import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sampleDocuments } from '../server/services/fallbackEngine.js';

describe('Consentia Backend API Endpoints & Health Test Suite', () => {

  it('Sample Documents Registry is valid and non-empty', () => {
    const samples = Object.values(sampleDocuments);
    assert.ok(Array.isArray(samples), 'Samples should be an array');
    assert.strictEqual(samples.length, 4, 'Should contain 4 synthetic sample scenarios');
    assert.ok(samples[0].title, 'Sample should have title');
    assert.ok(samples[0].text, 'Sample should have text');
  });

  it('Fallback Engine handles empty and gibberish input gracefully', async () => {
    const { fallbackSimplify, isGibberishOrLowValue } = await import('../server/services/fallbackEngine.js');
    
    assert.strictEqual(isGibberishOrLowValue('asdfghjkl qwerty 123'), true, 'Should detect gibberish');
    
    const result = fallbackSimplify('asdfghjkl qwerty 123');
    assert.strictEqual(result.isLowConfidence, true, 'Should return isLowConfidence true');
    assert.ok(result.warningMessage, 'Should provide helpful warning message');
  });

});
