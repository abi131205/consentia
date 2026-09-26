import { describe, it } from 'node:test';
import assert from 'node:assert';
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
    
    assert.ok(result, 'Result should be defined');
    assert.ok(result.documentCategory, 'Should have documentCategory');
    assert.ok(result.overallSummary, 'Should have overallSummary');
    assert.ok(Array.isArray(result.sections), 'Sections should be an array');
    assert.ok(result.sections.length > 0, 'Sections should not be empty');
    assert.ok(result.sections[0].plainLanguage, 'Section should have plainLanguage');
    assert.ok(result.sections[0].bottomLineTakeaway, 'Section should have bottomLineTakeaway');
  });

  it('Engine 2: detectRisks returns flagged clauses with severity & reasoning', async () => {
    const text = sampleDocuments.surgical.text;
    const result = await detectRisks(text);

    assert.ok(Array.isArray(result), 'Risks should be an array');
    assert.ok(result.length > 0, 'Should detect at least 1 risk clause');
    assert.ok(result[0].clauseType, 'Risk should have clauseType');
    assert.ok(result[0].severity, 'Risk should have severity');
    assert.ok(['high', 'medium', 'info'].includes(result[0].severity.toLowerCase()), 'Severity should be valid');
    assert.ok(result[0].explanation, 'Risk should have plain language explanation');
  });

  it('Engine 3: generateChecklist returns categorized questions', async () => {
    const text = sampleDocuments.surgical.text;
    const risks = await detectRisks(text);
    const result = await generateChecklist(text, risks);

    assert.ok(result, 'Checklist result should be defined');
    assert.ok(result.summaryTip, 'Should have summary tip');
    assert.ok(Array.isArray(result.categories), 'Categories should be an array');
    assert.ok(result.categories.length > 0, 'Categories should not be empty');
    assert.ok(result.categories[0].questions.length > 0, 'Category should contain questions');
  });

  it('Engine 4: generatePatientRights returns document-aware rights snapshot', async () => {
    const text = sampleDocuments.surgical.text;
    const result = await generatePatientRights(text);

    assert.ok(result, 'Rights result should be defined');
    assert.ok(result.disclaimer, 'Should have educational disclaimer');
    assert.ok(Array.isArray(result.rightsList), 'rightsList should be an array');
    assert.ok(result.rightsList.length > 0, 'rightsList should not be empty');
    assert.ok(result.rightsList[0].right, 'Right should have title');
    assert.ok(result.rightsList[0].details, 'Right should have details');
  });

  it('Engine 5: explainScenario returns dynamic consequences & action steps', async () => {
    const clause = "Binding arbitration clause";
    const question = "What happens if I refuse to sign?";
    const result = await explainScenario(clause, question);

    assert.ok(result, 'Scenario result should be defined');
    assert.ok(result.consequence, 'Should have consequence explanation');
    assert.ok(Array.isArray(result.actionSteps), 'actionSteps should be an array');
    assert.ok(result.actionSteps.length > 0, 'actionSteps should not be empty');
  });

});
