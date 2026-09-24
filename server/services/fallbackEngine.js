/**
 * Consentia Local Heuristic Fallback Engine
 * 
 * Provides robust offline/demo mode intelligence for medical document analysis
 * when GEMINI_API_KEY is absent or when API resilience is required.
 * 
 * NOTE: This is explicitly documented as a Local Heuristic Fallback Engine
 * and is distinct from the primary Gemini-powered GenAI integration path.
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
 * Low-value & Gibberish Detector
 */
export function isGibberishOrLowValue(text) {
  if (!text || typeof text !== 'string') return true;
  const clean = text.trim();
  if (clean.length < 15) return true;
  
  const lettersOnly = clean.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length < 10) return true;

  // Check unique character ratio for gibberish like "asdfghjkl qwerty 123"
  const uniqueChars = new Set(lettersOnly.toLowerCase()).size;
  if (uniqueChars < 4 && lettersOnly.length > 15) return true;

  // Check for lack of standard spaces or common English vowels
  const vowels = lettersOnly.match(/[aeiouAEIOU]/g);
  if (!vowels || vowels.length / lettersOnly.length < 0.12) return true;

  return false;
}

/**
 * Fallback Document Simplifier
 */
export function fallbackSimplify(text) {
  if (isGibberishOrLowValue(text)) {
    return {
      isLowConfidence: true,
      documentCategory: 'Unrecognized Input',
      overallSummary: 'The provided text does not appear to contain enough meaningful medical, legal, or billing document content for a reliable analysis.',
      warningMessage: 'Please enter a consent form, insurance denial letter, hospital bill, procedure waiver, or other healthcare paperwork.',
      sections: []
    };
  }

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
    overallSummary: "This document outlines medical, financial, or legal terms regarding your healthcare. It includes details on authorizations, potential financial responsibilities, and procedural deadlines that may require your attention.",
    sections
  };
}

function buildSimplifiedSection(title, raw) {
  let plainText = raw;
  let takeaway = "Consider reviewing this section carefully before signing or submitting payment.";

  const lower = raw.toLowerCase() + ' ' + title.toLowerCase();

  if (lower.includes('arbitration') || lower.includes('jury')) {
    plainText = "This section asks you to give up your right to go to court if something goes wrong. Instead, any dispute would be handled privately by an arbiter.";
    takeaway = "What this actually means for you: This clause may affect your ability to sue in regular court or join a group lawsuit if medical errors or billing disputes happen.";
  } else if (lower.includes('denied') || lower.includes('not medically necessary') || lower.includes('adverse')) {
    plainText = "The insurance company refused to pay for this medical service because they claim it wasn't proven necessary by previous treatments.";
    takeaway = "What this actually means for you: You may be held responsible for the bill unless you submit an appeal with your doctor's supporting records within the deadline.";
  } else if (lower.includes('out-of-network') || lower.includes('balance-billed') || lower.includes('remaining patient balance')) {
    plainText = "Even if the hospital was in your insurance network, some doctors who treated you do not take your insurance and are billing you the difference.";
    takeaway = "What this actually means for you: You may be protected under federal balance billing laws (No Surprises Act) for emergency care. Consider checking your protections before paying.";
  } else if (lower.includes('financial responsibility') || lower.includes('unanticipated surgical complications') || lower.includes('guarantor')) {
    plainText = "This states that you agree to pay out of your own pocket for any extra treatments, unexpected complications, or unpaid insurance amounts.";
    takeaway = "What this actually means for you: If insurance delays or rejects payment, the hospital may attempt to charge you directly.";
  } else if (lower.includes('authorization') || lower.includes('consent for surgery')) {
    plainText = "You are giving permission to your surgical team to perform the procedure as well as any necessary extra steps during surgery.";
    takeaway = "What this actually means for you: You are consenting to the procedure and authorizing emergency adjustments if complications occur during surgery.";
  } else if (lower.includes('appeal rights') || lower.includes('30 days')) {
    plainText = "You have a right to challenge this insurance denial, but you must act quickly before the strict deadline expires.";
    takeaway = "What this actually means for you: If you do not submit your appeal within the stated time frame, you may lose your right to challenge the denial.";
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
  if (isGibberishOrLowValue(text)) return [];
  const risks = [];
  const lower = text.toLowerCase();

  if (lower.includes('arbitration') || lower.includes('waive my right to a jury trial')) {
    risks.push({
      clauseType: 'Binding Arbitration Clause',
      severity: 'high',
      quotedText: extractMatch(text, /arbitration|jury trial/i),
      explanation: 'May require resolving medical error or billing disputes through private arbitration rather than public court.',
      whatHappensIfClicked: 'If a dispute occurs, you may be unable to present your case to a public judge or jury.'
    });
  }

  if (lower.includes('30 days') || lower.includes('forfeiture of your appeal') || lower.includes('strict thirty')) {
    risks.push({
      clauseType: 'Urgent Appeal Deadline',
      severity: 'high',
      quotedText: extractMatch(text, /thirty \(30\) calendar days|appeal rights/i),
      explanation: 'A short window to file an insurance appeal before the denial becomes final.',
      whatHappensIfClicked: 'Missing the 30-day window may result in losing your right to challenge the insurance denial.'
    });
  }

  if (lower.includes('out-of-network') || lower.includes('balance-billed')) {
    risks.push({
      clauseType: 'Potential Out-of-Network Balance Billing',
      severity: 'high',
      quotedText: extractMatch(text, /out-of-network|balance-billed/i),
      explanation: 'Separate bills from doctors who did not contract with your insurance plan.',
      whatHappensIfClicked: 'Under the No Surprises Act, balance billing for emergency care at in-network facilities is restricted under federal law.'
    });
  }

  if (lower.includes('financial responsibility') || lower.includes('assumes full financial') || lower.includes('late finance fee')) {
    risks.push({
      clauseType: 'Financial Obligation Terms',
      severity: 'medium',
      quotedText: extractMatch(text, /financial responsibility|finance fee|60 days/i),
      explanation: 'May assign personal liability for unexpected complications or unpaid insurance balances.',
      whatHappensIfClicked: 'If insurance delays processing, the facility may attempt to bill you interest or collection fees.'
    });
  }

  if (risks.length === 0) {
    risks.push({
      clauseType: 'Standard Terms Verification',
      severity: 'info',
      quotedText: text.slice(0, 120) + '...',
      explanation: 'Standard medical or administrative wording detected. Consider verifying all provider names and fee breakdowns.',
      whatHappensIfClicked: 'Confirming provider credentials and fee breakdowns is recommended before signing.'
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
    "Are all physicians, anesthesiologists, and lab technicians involved in my care in-network for my insurance plan?",
    "Which parts of this consent document should I clarify before the procedure?"
  ];

  const billingQuestions = [
    "Can you provide a comprehensive itemized bill with CPT/HCPCS medical codes for every line item?",
    "Could there be separate out-of-network charges from independent doctors or labs?",
    "Does this bill fall under federal No Surprises Act protections for emergency care?"
  ];

  const insurerQuestions = [
    "What is the exact appeal deadline, and what documentation is required?",
    "How can I request an expedited internal or external review for this denial?",
    "Will this claim be re-evaluated if my physician submits additional clinical records?"
  ];

  return {
    summaryTip: "Bring these questions to your next appointment or phone call. Take notes on who you speak with and the date.",
    categories: [
      {
        title: "Questions for Your Doctor & Care Team",
        target: "Doctor / Care Team",
        questions: doctorQuestions
      },
      {
        title: "Questions for Hospital Billing Office",
        target: "Billing Office",
        questions: billingQuestions
      },
      {
        title: "Questions for Health Insurer",
        target: "Health Insurer",
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
      details: "You generally have the right to receive a clear explanation of risks, benefits, and alternatives, and to refuse proposed treatments."
    },
    {
      right: "Right to an Itemized Bill",
      details: "You are generally entitled to a line-by-line itemized receipt listing every medical code, medication, and facility charge."
    },
    {
      right: "Right to Federal Balance Billing Protections (No Surprises Act)",
      details: "For emergency care or non-emergency care at in-network facilities by out-of-network providers, federal law generally prohibits balance billing above in-network rates."
    },
    {
      right: "Right to Insurance Appeals",
      details: "You generally have the right to file internal appeals with your insurance provider and request independent external reviews."
    }
  ];

  return {
    documentCategory: category,
    disclaimer: "General educational information. Applicable rights may depend on jurisdiction, insurance coverage, circumstances, and the specific document.",
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
      consequence: "The insurance company may consider the denial final. The provider may then transfer the balance directly to you for out-of-pocket payment.",
      actionSteps: [
        "Contact your ordering physician's office immediately to request an urgent clinical appeal letter.",
        "Contact the insurer's grievance department to ask if a good-cause extension is permitted.",
        "Request an itemized bill from the hospital to verify if any billing codes can be resubmitted."
      ]
    };
  }

  if (qLower.includes('sign') || qLower.includes('refuse') || qLower.includes('arbitration')) {
    return {
      scenario: "What happens if I refuse to sign the arbitration clause?",
      consequence: "You preserve your option to pursue future disputes in court. In emergency situations, hospitals CANNOT refuse stabilizing emergency care under EMTALA.",
      actionSteps: [
        "Politely cross out the arbitration paragraph on paper consent forms and initial next to it.",
        "State: 'I consent to medical treatment, but I do not consent to mandatory arbitration.'",
        "If in an emergency department, remember EMTALA law requires them to stabilize emergency conditions."
      ]
    };
  }

  return {
    scenario: question || "What happens if I encounter an issue with this clause?",
    consequence: "Signing without clarification may bind you to out-of-pocket expenses or restrict dispute options.",
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
