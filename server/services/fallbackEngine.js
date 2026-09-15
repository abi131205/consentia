/**
 * Consentia Fallback Heuristic & Rule-based Engine
 * 
 * Provides robust offline/demo mode intelligence for medical document analysis
 * when GEMINI_API_KEY is absent or when offline resilience is required.
 */

export const sampleDocuments = {
  surgical: {
    id: 'surgical_consent',
    title: 'General Surgical Informed Consent & Liability Release',
    category: 'Consent Form',
    text: `INFORMED CONSENT FOR SURGICAL PROCEDURE & ASSIGNMENT OF BENEFITS

1. AUTHORIZATION FOR SURGERY AND PROCEDURES
I hereby authorize Dr. Evelyn Reed, M.D., and such assistants or surgical associates as may be selected by her, to perform the following procedure(s): Laparoscopic Cholecystectomy with possible open conversion, intraoperative cholangiogram, and related diagnostic or therapeutic procedures as deemed necessary during the course of surgery.

2. ACKNOWLEDGEMENT OF RISKS & COMPLICATIONS
I acknowledge that the nature and purpose of the operation, risks involved (including bleeding, infection, damage to surrounding organs, bile duct injury, blood clots, cardiac events, reaction to anesthesia, or death), and reasonable alternatives have been explained to me. I understand that no guarantee has been made as to the final result of the treatment.

3. WAIVER OF LIABILITY & UNFORESEEN EXPENSES
I understand that in the event of unanticipated surgical complications requiring additional operative procedures, prolonged ICU hospitalization, or specialized medical equipment, I assume full financial responsibility for all charges incurred that are not covered by my primary insurance provider.

4. MANDATORY BINDING ARBITRATION CLAUSE
By signing below, I agree that any medical malpractice claim, breach of standard of care dispute, or financial billing conflict arising from this procedure shall be resolved exclusively through mandatory, binding arbitration administered by the American Arbitration Association. I explicitly waive my right to a jury trial or participation in any class action lawsuit against the hospital, attending physicians, or affiliated healthcare entities.

5. ASSIGNMENT OF INSURANCE BENEFITS & DEFAULT TERMS
I hereby assign and transfer to the hospital all rights, title, and interest in insurance benefits payable to me for services rendered. If insurance payment is delayed beyond 60 days, the full balance becomes immediately due and payable by the patient, incurring a 1.5% monthly late finance fee.`,
  },

  insurance_denial: {
    id: 'insurance_denial',
    title: 'Commercial Health Plan Insurance Claim Denial Letter',
    category: 'Insurance Denial Letter',
    text: `NOTICE OF ADVERSE BENEFIT DETERMINATION & CLAIM DENIAL

Member Name: Jordan Miller
Policy ID: HTP-99201482
Claim Reference: CLM-2026-8812B
Date of Service: August 14, 2026
Provider: Metro Health Specialty Center
Total Billed Amount: $14,850.00
Amount Approved: $0.00 (100% Denied)

REASON FOR DENIAL:
Your claim for CPT Code 74177 (Computed Tomography, Abdomen and Pelvis with Contrast) has been reviewed by our Medical Necessity Review Board and is DENIED under Section 4.2 of your Benefit Handbook. 

The clinical documentation submitted does not establish that alternative conservative non-radiological therapies (such as 6 weeks of physical therapy or standard oral anti-inflammatory medication) were attempted prior to performing advanced diagnostic imaging. Therefore, the service is deemed "Not Medically Necessary" for your reported diagnosis of lower abdominal distress.

APPEAL RIGHTS & TIMELINES:
You have the right to file an Internal Level 1 Appeal. Your written appeal, along with supporting clinical notes from your ordering provider, must be received by our Grievance Department within strict thirty (30) calendar days from the date of this letter. 

FAILURE TO SUBMIT COMPREHENSIVE CLINICAL RECORDS OR MISSING THE 30-DAY WINDOW WILL RESULT IN PERMANENT FORFEITURE OF YOUR APPEAL RIGHTS AND PERSONAL FINANCIAL RESPONSIBILITY FOR THE ENTIRE BILLED BALANCE OF $14,850.00.`,
  },

  billing_dispute: {
    id: 'billing_dispute',
    title: 'Out-of-Network Emergency Facility & Anesthesia Statement',
    category: 'Billing Statement',
    text: `STATEMENT OF ACCOUNT & OUT-OF-NETWORK EMERGENCY BALANCE

Patient: Alex Vance
Account Number: ACT-7749102
Facility: St. Jude Regional Emergency Center
Date of Service: July 22, 2026

SUMMARY OF CHARGES:
1. Emergency Department Level 5 Facility Fee: $6,400.00 (In-Network Insurance Paid: $1,200.00)
2. Attending Physician Out-of-Network Service Fee: $3,100.00 (Insurance Denied - Provider Not Contracted)
3. Anesthesiology Out-of-Network Fee: $2,850.00 (Insurance Denied - Provider Not Contracted)
4. Diagnostic Laboratory & Supplies: $1,900.00 (Insurance Paid: $400.00)

TOTAL REMAINING PATIENT BALANCE: $10,650.00
DUE DATE: October 1, 2026

NOTICE REGARDING OUT-OF-NETWORK SERVICES:
Although St. Jude Regional Emergency Center facility is an in-network hospital under your health plan, independent medical contractors (including Anesthesiology Services LLC and Emergency Physicians Group) do not participate in your health plan network. 

Because you received services from non-participating providers, you are balance-billed for all amounts exceeding your plan's allowable usual-and-customary rate. Please note that failure to pay in full within 45 days will result in automated referral to collections, credit reporting, and standard legal collection proceedings.`,
  },

  procedure_waiver: {
    id: 'procedure_waiver',
    title: 'Out-of-Pocket Payment Agreement & Financial Guarantee',
    category: 'Hospital Paperwork',
    text: `OUT-OF-POCKET ADVANCE PAYMENT AGREEMENT & GUARANTOR FORM

Facility: Horizon Specialty Clinic
Patient Name: Morgan Taylor

1. ACKNOWLEDGEMENT OF NON-COVERED SERVICES
I understand that the treatment or diagnostic diagnostic protocol recommended today (Cellular Bio-marker Profiling) is considered experimental or investigational by standard commercial insurance policies and Medicare.

2. ADVANCE DIRECT FINANCIAL RESPONSIBILITY
I agree to pay Horizon Specialty Clinic the estimated upfront fee of $3,200.00 prior to receiving treatment. I understand that I am personally liable for any additional laboratory processing fees or physician consultation charges incurred during the visit.

3. WAIVER OF INSURANCE SUBMISSION
I explicitly request that Horizon Specialty Clinic NOT submit a claim to my health insurance provider. I agree that I will not attempt to file a reimbursement claim with my insurance company or seek secondary coverage for any portion of these charges.

4. COLLECTIONS & LEGAL FEES
Should my account fall into default, I agree to pay all costs of collection, including reasonable attorney fees (calculated at 33% of outstanding debt), court costs, and pre-judgment interest accrued at 18% per annum.`,
  }
};

/**
 * Fallback Document Simplifier
 */
export function fallbackSimplify(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const sections = [];
  let currentTitle = 'Document Summary';
  let currentBuffer = [];

  for (const line of lines) {
    if (line.match(/^(\d+\.|\bSECTION\b|\bNOTICE\b|\bREASON\b|\bSUMMARY\b|\bAPPEAL\b)/i) || line === line.toUpperCase() && line.length < 60) {
      if (currentBuffer.length > 0) {
        sections.push(buildSimplifiedSection(currentTitle, currentBuffer.join(' ')));
        currentBuffer = [];
      }
      currentTitle = line.trim();
    } else {
      currentBuffer.push(line.trim());
    }
  }

  if (currentBuffer.length > 0) {
    sections.push(buildSimplifiedSection(currentTitle, currentBuffer.join(' ')));
  }

  if (sections.length === 0) {
    sections.push(buildSimplifiedSection('General Medical Document', text));
  }

  return {
    documentCategory: detectCategory(text),
    overallSummary: "This document outlines medical, financial, or legal terms regarding your healthcare. It includes details on authorizations, potential financial responsibilities, and procedural deadlines that require your attention.",
    sections
  };
}

function buildSimplifiedSection(title, raw) {
  let plainText = raw;
  let takeaway = "Review this section carefully before signing or submitting payment.";

  const lower = raw.toLowerCase() + ' ' + title.toLowerCase();

  if (lower.includes('arbitration') || lower.includes('jury')) {
    plainText = "This section asks you to give up your right to go to court if something goes wrong. Instead, any dispute would be handled privately by an arbiter.";
    takeaway = "What this actually means for you: You cannot sue in regular court or join a group lawsuit if medical errors or billing disputes happen.";
  } else if (lower.includes('denied') || lower.includes('not medically necessary') || lower.includes('adverse')) {
    plainText = "The insurance company refused to pay for this medical service because they claim it wasn't proven necessary by previous treatments.";
    takeaway = "What this actually means for you: You are being held responsible for the bill unless you submit an appeal with your doctor's supporting records within the deadline.";
  } else if (lower.includes('out-of-network') || lower.includes('balance-billed') || lower.includes('remaining patient balance')) {
    plainText = "Even if the hospital was in your insurance network, some doctors who treated you do not take your insurance and are billing you the difference.";
    takeaway = "What this actually means for you: You may be protected under federal balance billing laws (No Surprises Act) for emergency care. Do not pay without checking protections first.";
  } else if (lower.includes('financial responsibility') || lower.includes('unanticipated surgical complications') || lower.includes('guarantor')) {
    plainText = "This states that you agree to pay out of your own pocket for any extra treatments, unexpected complications, or unpaid insurance amounts.";
    takeaway = "What this actually means for you: If insurance delays or rejects payment, the hospital can charge you directly, including late fees or collection costs.";
  } else if (lower.includes('authorization') || lower.includes('consent for surgery')) {
    plainText = "You are giving permission to your surgical team to perform the procedure as well as any necessary extra steps during surgery.";
    takeaway = "What this actually means for you: You are consenting to the procedure and authorizing emergency adjustments if complications occur during surgery.";
  } else if (lower.includes('appeal rights') || lower.includes('30 days')) {
    plainText = "You have a right to challenge this insurance denial, but you must act quickly before the strict deadline expires.";
    takeaway = "What this actually means for you: If you don't submit your appeal within the stated time frame, you lose your right to challenge the denial forever.";
  }

  return {
    title: title.replace(/^\d+\.\s*/, ''),
    originalSnippet: raw.length > 250 ? raw.slice(0, 250) + '...' : raw,
    plainLanguage: plainText,
    bottomLineTakeaway: takeaway
  };
}

/**
 * Fallback Risk & Clause Highlighter
 */
export function fallbackDetectRisks(text) {
  const risks = [];
  const lower = text.toLowerCase();

  if (lower.includes('arbitration') || lower.includes('waive my right to a jury trial')) {
    risks.push({
      clauseType: 'Binding Arbitration Clause',
      severity: 'high',
      quotedText: extractMatch(text, /arbitration|jury trial/i),
      explanation: 'Gives up your right to sue in court. Any medical error or billing dispute must be resolved in private arbitration.',
      whatHappensIfClicked: 'If a dispute occurs, you cannot present your case to a public judge or jury, and arbitration decisions are usually final with limited rights to appeal.'
    });
  }

  if (lower.includes('30 days') || lower.includes('forfeiture of your appeal') || lower.includes('strict thirty')) {
    risks.push({
      clauseType: 'Strict Urgent Appeal Deadline',
      severity: 'high',
      quotedText: extractMatch(text, /thirty \(30\) calendar days|appeal rights/i),
      explanation: 'A short 30-day window to file an insurance appeal before the denial becomes final and unchallengeable.',
      whatHappensIfClicked: 'If you miss the 30-day window by even one day, the $14,850.00 bill becomes permanently your personal obligation.'
    });
  }

  if (lower.includes('out-of-network') || lower.includes('balance-billed')) {
    risks.push({
      clauseType: 'Unusual Out-of-Network Balance Billing',
      severity: 'high',
      quotedText: extractMatch(text, /out-of-network|balance-billed/i),
      explanation: 'Separate bills from doctors who did not contract with your insurance plan, even at an in-network facility.',
      whatHappensIfClicked: 'Under the No Surprises Act (effective 2022), balance billing for emergency medical care at in-network facilities is illegal under federal law. You can contest this bill.'
    });
  }

  if (lower.includes('financial responsibility') || lower.includes('assumes full financial') || lower.includes('late finance fee')) {
    risks.push({
      clauseType: 'Uncapped Financial Responsibility & Late Fees',
      severity: 'medium',
      quotedText: extractMatch(text, /financial responsibility|finance fee|60 days/i),
      explanation: 'Makes you personally liable for unexpected complications and adds steep monthly interest if insurance delays payment.',
      whatHappensIfClicked: 'If insurance delays processing past 60 days, you could be billed interest fees for delays caused entirely by the insurer or hospital billing department.'
    });
  }

  if (lower.includes('experimental') || lower.includes('not submit a claim')) {
    risks.push({
      clauseType: 'Insurance Claim Submission Waiver',
      severity: 'medium',
      quotedText: extractMatch(text, /not submit a claim|experimental/i),
      explanation: 'Prevents you from submitting this expense to insurance for potential out-of-network or deductible credit.',
      whatHappensIfClicked: 'You forfeit any opportunity to apply these costs toward your health plan deductible or secondary coverage.'
    });
  }

  if (risks.length === 0) {
    risks.push({
      clauseType: 'Standard Terms Verification',
      severity: 'info',
      quotedText: text.slice(0, 120) + '...',
      explanation: 'Standard medical or administrative wording detected. Ensure all fee amounts and provider names match your records.',
      whatHappensIfClicked: 'Confirming provider credentials and itemized fee breakdowns is recommended before signing.'
    });
  }

  return risks;
}

/**
 * Fallback Question Checklist Generator
 */
export function fallbackGenerateChecklist(text, risks) {
  const doctorQuestions = [
    "Can you clarify if there are less invasive or alternative treatments before proceeding?",
    "Are all physicians, anesthesiologists, and lab technicians involved in my care in-network for my specific insurance plan?",
    "If complications arise during the procedure, will I be informed before non-essential additional interventions are billed?"
  ];

  const billingQuestions = [
    "Can you provide a comprehensive itemized bill with CPT/HCPCS codes for every line item?",
    "Does this bill fall under federal No Surprises Act protections for emergency or facility-based out-of-network care?",
    "Can we establish a interest-free financial hardship payment plan or apply for hospital charity care?"
  ];

  const insurerQuestions = [
    "What specific additional medical notes or peer-to-peer documentation does the Medical Review Board require for an expedited Level 1 Appeal?",
    "What is the exact deadline date for receiving my appeal documentation, and can I get written confirmation of receipt?",
    "Will this claim be re-evaluated if my physician submits an urgent expedited appeal request?"
  ];

  return {
    summaryTip: "Bring these questions to your next appointment or phone call. Take notes on who you speak with, the date, and call reference numbers.",
    categories: [
      {
        title: "Questions for Your Doctor & Care Team",
        target: "Doctor / Surgeon",
        questions: doctorQuestions
      },
      {
        title: "Questions for Hospital Billing Office",
        target: "Billing Department",
        questions: billingQuestions
      },
      {
        title: "Questions for Health Insurer / Claims Department",
        target: "Insurance Representative",
        questions: insurerQuestions
      }
    ]
  };
}

/**
 * Fallback Patient Rights Summary
 */
export function fallbackPatientRights(text) {
  const category = detectCategory(text);

  let rights = [
    {
      right: "Right to Informed Consent & Refusal",
      details: "You have the moral and legal right to receive a clear explanation of risks, benefits, and alternatives, and to refuse any medical treatment at any time."
    },
    {
      right: "Right to an Itemized Bill",
      details: "You are entitled to a line-by-line itemized receipt listing every medical code (CPT), drug, and supply billed to you or your insurance."
    },
    {
      right: "Right to Federal Balance Billing Protection (No Surprises Act)",
      details: "For emergency care or non-emergency services received at an in-network facility from an out-of-network provider, federal law prohibits balance billing above in-network rates."
    },
    {
      right: "Right to Appeal Insurance Denials",
      details: "You have the right to both internal appeals with your insurance provider and independent external reviews by neutral medical reviewers."
    }
  ];

  if (category === 'Insurance Denial Letter') {
    rights.unshift({
      right: "Right to Expedited Internal & External Review",
      details: "If your health condition is urgent, you have the right to request a fast-track appeal decision within 72 hours, as well as an independent external review if denied."
    });
  }

  return {
    documentCategory: category,
    disclaimer: "These rights represent general patient protections in the United States (including federal laws like EMTALA and the No Surprises Act) and are provided for educational preparation.",
    rightsList: rights
  };
}

/**
 * Fallback What-If Explainer
 */
export function fallbackExplainScenario(clause, question) {
  const qLower = (question || '').toLowerCase();
  
  if (qLower.includes('30 days') || qLower.includes('miss') || qLower.includes('deadline')) {
    return {
      scenario: "What happens if I miss the 30-day appeal window?",
      consequence: "Your insurance company considers the denial final and unappealable. The hospital or clinic will transfer the entire balance directly to you for out-of-pocket payment.",
      actionSteps: [
        "Immediately call your ordering physician's office and request an urgent clinical appeal letter.",
        "Contact the insurer's grievance department to ask if a good-cause extension is permitted.",
        "Request an itemized bill from the hospital to verify if any billing codes can be re-submitted."
      ]
    };
  }

  if (qLower.includes('sign') || qLower.includes('refuse') || qLower.includes('arbitration')) {
    return {
      scenario: "What happens if I refuse to sign the arbitration clause?",
      consequence: "You preserve your constitutional right to take any future malpractice or billing dispute to court. In non-emergency situations, some facilities may ask you to sign an addendum, but emergency facilities CANNOT refuse emergency care under EMTALA.",
      actionSteps: [
        "Politely cross out the arbitration paragraph on paper consent forms and initial next to it.",
        "State: 'I consent to medical treatment, but I do not consent to mandatory arbitration.'",
        "If in an emergency department, remember EMTALA law requires them to stabilize you regardless of paperwork disputes."
      ]
    };
  }

  return {
    scenario: question || "What happens if I encounter an issue with this clause?",
    consequence: "Signing without clarification can bind you to unexpected out-of-pocket expenses or restrict your rights to dispute billing errors.",
    actionSteps: [
      "Ask the patient advocate or hospital billing coordinator for written clarification.",
      "Request a temporary 30-day payment hold while you review charges.",
      "Keep timestamped copies of all correspondence and documents signed."
    ]
  };
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('denial') || lower.includes('adverse benefit') || lower.includes('not medically necessary')) {
    return 'Insurance Denial Letter';
  }
  if (lower.includes('out-of-network') || lower.includes('balance-billed') || lower.includes('statement of account')) {
    return 'Billing Statement';
  }
  if (lower.includes('consent') || lower.includes('surgery') || lower.includes('procedure')) {
    return 'Consent Form';
  }
  return 'Medical Document';
}

function extractMatch(text, regex) {
  const match = text.match(regex);
  if (!match) return text.slice(0, 80) + '...';
  const idx = match.index;
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + match[0].length + 60);
  return '...' + text.slice(start, end).trim() + '...';
}
