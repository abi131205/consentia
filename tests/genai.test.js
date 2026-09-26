import { describe, it, expect } from 'vitest';
import { 
  simplifyDocument, 
  detectRisks, 
  generateChecklist, 
  generatePatientRights, 
  explainScenario 
} from '../server/services/genai.js';
import { sampleDocuments } from '../server/services/fallbackEngine.js';

describe('Consentia 5 GenAI Engine Services Audit & Verification Suite', () => {

  it('Engine 1: simplifyDocument returns structured plain-language sections', async () => {
    const text = sampleDocuments.surgical.text;
    const result = await simplifyDocument(text);
    
    expect(result).toBeDefined();
    expect(result.documentCategory).toBeTruthy();
    expect(result.overallSummary).toBeTruthy();
    expect(Array.isArray(result.sections)).toBe(true);
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.sections[0].plainLanguage).toBeTruthy();
    expect(result.sections[0].bottomLineTakeaway).toBeTruthy();
  });

  it('Engine 2: detectRisks returns flagged clauses with severity & reasoning', async () => {
    const text = sampleDocuments.surgical.text;
    const result = await detectRisks(text);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].clauseType).toBeTruthy();
    expect(result[0].severity).toBeTruthy();
    expect(['high', 'medium', 'info']).toContain(result[0].severity.toLowerCase());
    expect(result[0].explanation).toBeTruthy();
  });

  it('Engine 3: generateChecklist returns categorized questions', async () => {
    const text = sampleDocuments.surgical.text;
    const risks = await detectRisks(text);
    const result = await generateChecklist(text, risks);

    expect(result).toBeDefined();
    expect(result.summaryTip).toBeTruthy();
    expect(Array.isArray(result.categories)).toBe(true);
    expect(result.categories.length).toBeGreaterThan(0);
    expect(result.categories[0].questions.length).toBeGreaterThan(0);
  });

  it('Engine 4: generatePatientRights returns document-aware rights snapshot', async () => {
    const text = sampleDocuments.surgical.text;
    const result = await generatePatientRights(text);

    expect(result).toBeDefined();
    expect(result.disclaimer).toBeTruthy();
    expect(Array.isArray(result.rightsList)).toBe(true);
    expect(result.rightsList.length).toBeGreaterThan(0);
    expect(result.rightsList[0].right).toBeTruthy();
    expect(result.rightsList[0].details).toBeTruthy();
  });

  it('Engine 5: explainScenario returns dynamic consequences & action steps', async () => {
    const clause = "Binding arbitration clause";
    const question = "What happens if I refuse to sign?";
    const result = await explainScenario(clause, question);

    expect(result).toBeDefined();
    expect(result.consequence).toBeTruthy();
    expect(Array.isArray(result.actionSteps)).toBe(true);
    expect(result.actionSteps.length).toBeGreaterThan(0);
  });

});
