/**
 * CONSENTIA GenAI ARCHITECTURE ENGINE
 * 
 * Explicit Mapping of the FIVE GenAI Integration Points (Per PromptWars 2026 Requirements):
 * 
 * 1. DOCUMENT SIMPLIFICATION ENGINE (simplifyDocument)
 *    - Function: simplifyDocument(rawText)
 *    - Purpose: Convert complex document text into structured plain-language explanations.
 *    - Input: Raw document text.
 *    - Output: Structured JSON { documentCategory, overallSummary, sections: [{ title, originalSnippet, plainLanguage, bottomLineTakeaway }] }
 * 
 * 2. RISK & CLAUSE DETECTION ENGINE (detectRisks)
 *    - Function: detectRisks(rawText)
 *    - Purpose: Identify clauses that may deserve attention (arbitration, waivers, balance billing, deadlines).
 *    - Input: Raw document text.
 *    - Output: Array of flagged clause objects: [{ clauseType, severity ('high'|'medium'|'info'), quotedText, explanation, whatHappensIfClicked }]
 * 
 * 3. QUESTION CHECKLIST GENERATOR (generateChecklist)
 *    - Function: generateChecklist(rawText, risks)
 *    - Purpose: Generate actionable questions based on the document and detected risks.
 *    - Input: Raw document text + detected risks array.
 *    - Output: Structured checklist object { summaryTip, categories: [{ title, target, questions: [...] }] }
 * 
 * 4. PATIENT RIGHTS SUMMARY GENERATOR (generatePatientRights)
 *    - Function: generatePatientRights(rawText)
 *    - Purpose: Generate general educational information about potentially relevant patient rights based on document context.
 *    - Input: Raw document text.
 *    - Output: Document-aware rights information { documentCategory, disclaimer, rightsList: [{ right, details }] }
 * 
 * 5. INTERACTIVE SCENARIO EXPLANATION ENGINE (explainScenario)
 *    - Function: explainScenario(clause, question)
 *    - Purpose: Answer a user's "What happens if?" question based on a specific clause and context.
 *    - Input: Clause snippet + user question.
 *    - Output: Dynamic step-by-step explanation { scenario, consequence, actionSteps: [...] }
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  fallbackSimplify, 
  fallbackDetectRisks, 
  fallbackGenerateChecklist, 
  fallbackPatientRights,
  fallbackExplainScenario,
  isGibberishOrLowValue
} from './fallbackEngine.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('[Consentia GenAI] Gemini API Client initialized successfully (@google/genai).');
  } catch (err) {
    console.warn('[Consentia GenAI] Failed to initialize Gemini API Client:', err.message);
  }
} else {
  console.log('[Consentia GenAI] No GEMINI_API_KEY provided. Operating in high-fidelity Local Heuristic Fallback Engine Mode.');
}

const MAX_INPUT_CHARS = 50000;

/**
 * Common System Instruction enforcing tone, safety boundaries, and non-definitive phrasing
 */
const SYSTEM_INSTRUCTION = `
You are Consentia, a compassionate, clear GenAI Medical Consent & Patient Rights Navigator.
Your purpose is to help patients and caregivers understand healthcare paperwork, surgical consent forms, insurance denial letters, and billing disputes before they sign or pay.

TONE & VOICE REQUIREMENTS:
- Calm, clear, respectful, and grounding. Never alarmist. Never condescending.
- Write as if explaining something to a smart friend who is stressed in a hospital waiting room.
- Translate legalese into plain human speech.

SAFETY & LEGAL BOUNDARIES:
- Educational & Preparation Support Only: Do NOT provide legal advice, medical advice, or clinical diagnoses.
- Non-Definitive Phrasing: Do NOT state that any clause is definitely illegal or binding. Use careful phrasing such as "May require additional attention", "Potential area to clarify", "Consider asking about...", or "This clause may affect...".
- Do NOT fabricate statutes, legal citations, or specific case law.
`;

/**
 * Helper to sanitize and trim text safely
 */
function prepareInputText(text) {
  if (!text || typeof text !== 'string') return { cleanText: '', wasTruncated: false };
  let cleanText = text.trim();
  let wasTruncated = false;
  if (cleanText.length > MAX_INPUT_CHARS) {
    cleanText = cleanText.slice(0, MAX_INPUT_CHARS);
    wasTruncated = true;
  }
  return { cleanText, wasTruncated };
}

/**
 * 1. DOCUMENT SIMPLIFICATION ENGINE
 */
export async function simplifyDocument(rawText) {
  const { cleanText, wasTruncated } = prepareInputText(rawText);

  if (isGibberishOrLowValue(cleanText)) {
    return {
      isLowConfidence: true,
      documentCategory: 'Unrecognized Input',
      overallSummary: 'The provided text does not appear to contain enough meaningful medical, legal, or billing document content for a reliable analysis.',
      warningMessage: 'Please enter a consent form, insurance denial letter, hospital bill, procedure waiver, or other healthcare paperwork.',
      sections: []
    };
  }

  if (!aiClient) {
    const res = fallbackSimplify(cleanText);
    res.wasTruncated = wasTruncated;
    return res;
  }

  const prompt = `
Analyze the following medical or healthcare document. Return ONLY valid JSON with this exact structure:
{
  "documentCategory": "Category name (e.g. Surgical Consent, Insurance Denial Letter, Billing Statement, Hospital Paperwork)",
  "overallSummary": "Reassuring 2-3 sentence summary of what this document is and what the user needs to focus on.",
  "sections": [
    {
      "title": "Section Title or Topic",
      "originalSnippet": "Brief snippet of original text",
      "plainLanguage": "Plain, non-intimidating rewrite of what this section says.",
      "bottomLineTakeaway": "What this actually means for you: [One-line direct translation of personal impact]"
    }
  ]
}

DOCUMENT TEXT:
${cleanText}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    if (parsed && typeof parsed === 'object') {
      parsed.wasTruncated = wasTruncated;
      return parsed;
    }
    return fallbackSimplify(cleanText);
  } catch (err) {
    console.error('[Consentia GenAI Engine 1 Error]:', err.message);
    const fallback = fallbackSimplify(cleanText);
    fallback.wasTruncated = wasTruncated;
    return fallback;
  }
}

/**
 * 2. RISK & CLAUSE DETECTION ENGINE
 */
export async function detectRisks(rawText) {
  const { cleanText } = prepareInputText(rawText);

  if (isGibberishOrLowValue(cleanText)) {
    return [];
  }

  if (!aiClient) {
    return fallbackDetectRisks(cleanText);
  }

  const prompt = `
Examine the following medical document for clauses that present financial, legal, or procedural risks to a patient.
Look for:
- Liability waivers / release of claims
- Binding arbitration clauses
- Financial obligations & late fees
- Appeal deadlines or forfeiture of rights
- Balance billing or out-of-network surprises

Use non-definitive wording (e.g. "May require additional attention", "Consider asking about...", "This clause may affect...").

Return ONLY valid JSON matching this exact structure:
[
  {
    "clauseType": "Name of clause (e.g. Mandatory Binding Arbitration Clause)",
    "severity": "high" | "medium" | "info",
    "quotedText": "Exact quote from document",
    "explanation": "Plain language explanation of why this clause may deserve attention.",
    "whatHappensIfClicked": "Clear description of potential real-world consequence."
  }
]

DOCUMENT TEXT:
${cleanText}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    return Array.isArray(parsed) ? parsed : fallbackDetectRisks(cleanText);
  } catch (err) {
    console.error('[Consentia GenAI Engine 2 Error]:', err.message);
    return fallbackDetectRisks(cleanText);
  }
}

/**
 * 3. QUESTION CHECKLIST GENERATOR
 */
export async function generateChecklist(rawText, risks = []) {
  const { cleanText } = prepareInputText(rawText);

  if (isGibberishOrLowValue(cleanText)) {
    return {
      summaryTip: "Enter a healthcare document to generate tailored preparation questions.",
      categories: []
    };
  }

  if (!aiClient) {
    return fallbackGenerateChecklist(cleanText, risks);
  }

  const risksSummary = JSON.stringify(risks);

  const prompt = `
Based on the medical document text and detected risks below, generate a personalized list of clear, assertive, respectful questions the patient should ask before signing or paying.

DOCUMENT TEXT:
${cleanText}

DETECTED RISKS:
${risksSummary}

Return ONLY valid JSON matching this exact structure:
{
  "summaryTip": "A calm, practical tip on how to ask these questions confidently.",
  "categories": [
    {
      "title": "Category Title (e.g., Questions for Your Doctor & Care Team)",
      "target": "Doctor / Billing / Insurer",
      "questions": [
        "Clear question string..."
      ]
    }
  ]
}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed && parsed.categories ? parsed : fallbackGenerateChecklist(cleanText, risks);
  } catch (err) {
    console.error('[Consentia GenAI Engine 3 Error]:', err.message);
    return fallbackGenerateChecklist(cleanText, risks);
  }
}

/**
 * 4. PATIENT RIGHTS SUMMARY GENERATOR
 */
export async function generatePatientRights(rawText) {
  const { cleanText } = prepareInputText(rawText);

  if (isGibberishOrLowValue(cleanText)) {
    return {
      documentCategory: 'General Educational Info',
      disclaimer: "General educational information. Applicable rights may depend on jurisdiction, insurance coverage, circumstances, and the specific document.",
      rightsList: []
    };
  }

  if (!aiClient) {
    return fallbackPatientRights(cleanText);
  }

  const prompt = `
Analyze the provided medical text and return a summary of general patient rights relevant to this document type (e.g., Informed Consent, No Surprises Act balance billing protection, right to itemized bills, right to emergency care under EMTALA, right to internal/external insurance appeals).

Include the exact disclaimer: "General educational information. Applicable rights may depend on jurisdiction, insurance coverage, circumstances, and the specific document."
Do NOT manufacture legal citations or specific case laws.

Return ONLY valid JSON matching this exact structure:
{
  "documentCategory": "Category of document",
  "disclaimer": "General educational information. Applicable rights may depend on jurisdiction, insurance coverage, circumstances, and the specific document.",
  "rightsList": [
    {
      "right": "Name of Patient Right",
      "details": "Explanation of what this right generally guarantees to the patient."
    }
  ]
}

DOCUMENT TEXT:
${cleanText}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed && parsed.rightsList ? parsed : fallbackPatientRights(cleanText);
  } catch (err) {
    console.error('[Consentia GenAI Engine 4 Error]:', err.message);
    return fallbackPatientRights(cleanText);
  }
}

/**
 * 5. INTERACTIVE SCENARIO EXPLANATION ENGINE ("What Happens If?")
 */
export async function explainScenario(clause, question) {
  if (!aiClient) {
    return fallbackExplainScenario(clause, question);
  }

  const prompt = `
The user is asking a "What happens if?" scenario question about a specific clause or topic in their medical document:
Clause/Snippet: "${clause || 'Not specified'}"
User Question: "${question || 'What happens if I encounter an issue with this?'}"

Provide a plain-language explanation of potential consequences and practical steps to protect themselves.
Use respectful, educational language without giving professional legal or medical advice.

Return ONLY valid JSON:
{
  "scenario": "Rephrased user question statement",
  "consequence": "Direct, calm explanation of real-world outcome.",
  "actionSteps": [
    "Step 1...",
    "Step 2..."
  ]
}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed && parsed.consequence ? parsed : fallbackExplainScenario(clause, question);
  } catch (err) {
    console.error('[Consentia GenAI Engine 5 Error]:', err.message);
    return fallbackExplainScenario(clause, question);
  }
}
