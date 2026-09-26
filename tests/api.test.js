import { describe, it, expect } from 'vitest';
import { sampleDocuments } from '../server/services/fallbackEngine.js';

describe('Consentia Backend API Endpoints & Health Test Suite', () => {

  it('Sample Documents Registry is valid and non-empty', () => {
    const samples = Object.values(sampleDocuments);
    expect(Array.isArray(samples)).toBe(true);
    expect(samples.length).toBe(4);
    expect(samples[0].title).toBeTruthy();
    expect(samples[0].text).toBeTruthy();
  });

  it('Fallback Engine handles empty and gibberish input gracefully', async () => {
    const { fallbackSimplify, isGibberishOrLowValue } = await import('../server/services/fallbackEngine.js');
    
    expect(isGibberishOrLowValue('asdfghjkl qwerty 123')).toBe(true);
    
    const result = fallbackSimplify('asdfghjkl qwerty 123');
    expect(result.isLowConfidence).toBe(true);
    expect(result.warningMessage).toBeTruthy();
  });

});
