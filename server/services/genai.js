/**
 * CONSENTIA GenAI ARCHITECTURE ENGINE
 * 
 * Explicit Mapping of GenAI Integration Points (Per Requirements):
 * 
 * 1. DOCUMENT SIMPLIFICATION ENGINE (simplifyDocument)
 *    - Input: Raw document text (medical consent, insurance denial, billing statement)
 *    - Output: Structured JSON containing:
 *        • documentCategory (e.g. Surgical Consent, Insurance Denial)
 *        • overallSummary (2-3 sentence calm explanation)
 *        • sections: Array of { title, originalSnippet, plainLanguage, bottomLineTakeaway }
 * 
 * 2. CLAUSE & RISK DETECTION ENGINE (detectRisks)
 *    - Input: Raw document text
 *    - Output: Array of flagged clause objects:
 *        • clauseType (e.g. Binding Arbitration, Financial Obligation, Strict Deadline)
 *        • severity ('high' | 'medium' | 'info')
 *        • quotedText (exact snippet from original text)
 *        • explanation (why this matters in plain terms)
 *        • whatHappensIfClicked (consequence summary for interactive explainer)
 * 
 * 3. QUESTION & CHECKLIST GENERATOR (generateChecklist)
 *    - Input: Parsed document summary + detected risks array
 *    - Output: Structured checklist object:
 *        • summaryTip (guidance on how to ask)
 *        • categories: Array of { title, target, questions: string[] }
 * 
 * 4. PATIENT RIGHTS SUMMARY GENERATOR (generatePatientRights)
 *    - Input: Document type/context
 *    - Output: Structured patient rights snapshot:
 *        • documentCategory
 *        • disclaimer (general educational statement)
 *        • rightsList: Array of { right, details }
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  fallbackSimplify, 
  fallbackDetectRisks, 
  fallbackGenerateChecklist, 
  fallbackPatientRights,
  fallbackExplainScenario
} from './fallbackEngine.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('[Consentia GenAI] Gemini API Client initialized successfully.');
  } catch (err) {
    console.warn('[Consentia GenAI] Failed to initialize Gemini API Client:', err.message);
  }
} else {
  console.log('[Consentia GenAI] No GEMINI_API_KEY provided. Operating in high-fidelity Heuristic Fallback Mode.');
}

/**
 * Common System Prompt specifying tone of voice and strict legal boundary
 */
const SYSTEM_INSTRUCTION = `
You are Consentia, a compassionate, highly clear GenAI Medical Consent & Patient Rights Navigator.
Your purpose is to help confused, anxious patients and caregivers understand complex medical paperwork, surgical consent forms, insurance denial letters, and billing statements.

TONE & VOICE REQUIREMENTS:
- Calm, clear, respectful, and grounding. Never alarmist. Never condescending.
- Write as if explaining something to a smart friend who is currently stressed in a hospital waiting room.
- Avoid legal jargon; translate corporate and medical boilerplate into plain human speech.
- Legal Boundary: Provide clear preparation and educational support without giving jurisdiction-specific legal or medical advice.
`;

/**
 * 1. DOCUMENT SIMPLIFICATION ENGINE
 * Raw text -> Structured plain-language sections
 */
export async function simplifyDocument(rawText) {
  if (!aiClient) {
    return fallbackSimplify(rawText);
  }

  const prompt = `
Analyze the following medical document or letter. Return ONLY valid JSON with this exact structure:
{
  "documentCategory": "Category name (e.g., Surgical Consent, Insurance Denial Letter, Billing Statement)",
  "overallSummary": "A reassuring 2-3 sentence summary of what this document is and what the user needs to focus on.",
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
${rawText}
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
    return parsed;
  } catch (err) {
    console.error('[Consentia GenAI Engine 1 Error]:', err.message);
    return fallbackSimplify(rawText);
  }
}

/**
 * 2. CLAUSE & RISK DETECTION ENGINE
 * Raw text -> Flagged clauses with severity and reasoning
 */
export async function detectRisks(rawText) {
  if (!aiClient) {
    return fallbackDetectRisks(rawText);
  }

  const prompt = `
Examine the following medical document for clauses that present financial, legal, or procedural risks to a patient.
Look specifically for:
- Liability waivers / release of claims
- Binding arbitration clauses (giving up right to jury trial)
- Unusual or uncapped financial obligations / guarantor clauses
- Strict appeal deadlines or forfeiture of rights
- Balance billing or out-of-network surprises

Return ONLY valid JSON matching this exact structure:
[
  {
    "clauseType": "Name of clause (e.g. Mandatory Binding Arbitration Clause)",
    "severity": "high" | "medium" | "info",
    "quotedText": "Exact quote from document",
    "explanation": "Plain language explanation of why this clause is significant or unusual.",
    "whatHappensIfClicked": "A clear description of the consequence if the patient agrees or misses a deadline."
  }
]

DOCUMENT TEXT:
${rawText}
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
    return Array.isArray(parsed) ? parsed : fallbackDetectRisks(rawText);
  } catch (err) {
    console.error('[Consentia GenAI Engine 2 Error]:', err.message);
    return fallbackDetectRisks(rawText);
  }
}

/**
 * 3. QUESTION & CHECKLIST GENERATOR
 * Parsed Document + Detected Risks -> Actionable Checklist
 */
export async function generateChecklist(rawText, risks = []) {
  if (!aiClient) {
    return fallbackGenerateChecklist(rawText, risks);
  }

  const risksSummary = JSON.stringify(risks);

  const prompt = `
Based on the medical document text and detected risks below, generate a personalized list of clear, assertive, respectful questions the patient should ask before signing or paying.

DOCUMENT TEXT:
${rawText}

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
    return parsed;
  } catch (err) {
    console.error('[Consentia GenAI Engine 3 Error]:', err.message);
    return fallbackGenerateChecklist(rawText, risks);
  }
}

/**
 * 4. PATIENT RIGHTS SUMMARY GENERATOR
 * Document context -> Relevant general patient rights snapshot
 */
export async function generatePatientRights(rawText) {
  if (!aiClient) {
    return fallbackPatientRights(rawText);
  }

  const prompt = `
Analyze the provided medical text and return a summary of general patient rights relevant to this document type (e.g., Informed Consent, No Surprises Act balance billing protection, right to itemized bills, right to emergency care under EMTALA, right to internal/external insurance appeals).

Return ONLY valid JSON matching this exact structure:
{
  "documentCategory": "Category of document",
  "disclaimer": "General patient rights information for educational preparation, not jurisdiction-specific legal advice.",
  "rightsList": [
    {
      "right": "Name of Patient Right",
      "details": "Explanation of what this right guarantees to the patient."
    }
  ]
}

DOCUMENT TEXT:
${rawText}
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
    return parsed;
  } catch (err) {
    console.error('[Consentia GenAI Engine 4 Error]:', err.message);
    return fallbackPatientRights(rawText);
  }
}

/**
 * What-If Interactive Scenario Explainer
 */
export async function explainScenario(clause, question) {
  if (!aiClient) {
    return fallbackExplainScenario(clause, question);
  }

  const prompt = `
The user is asking about a specific consequence or clause in their medical document:
Clause/Snippet: "${clause || 'Not specified'}"
User Question: "${question || 'What happens if I encounter an issue with this?'}"

Provide a plain-language explanation of what happens and practical steps to protect themselves.

Return ONLY valid JSON:
{
  "scenario": "Rephrased question statement",
  "consequence": "Direct, calm explanation of real-world impact or outcome.",
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

    return JSON.parse(response.text);
  } catch (err) {
    console.error('[Consentia What-If Error]:', err.message);
    return fallbackExplainScenario(clause, question);
  }
}
