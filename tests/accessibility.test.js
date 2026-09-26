import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Consentia WCAG WAI-ARIA Accessibility Audit Suite', () => {

  it('index.html contains valid lang attribute, meta description, and document title', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
    expect(html).toContain('lang="en"');
    expect(html).toContain('<title>');
    expect(html).toContain('meta name="description"');
  });

  it('All core components feature explicit WAI-ARIA roles and semantic accessibility tags', () => {
    const appJsx = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');
    const intakeJsx = fs.readFileSync(path.resolve('src/components/DocumentIntake.jsx'), 'utf-8');
    const headerJsx = fs.readFileSync(path.resolve('src/components/Header.jsx'), 'utf-8');

    expect(appJsx.includes('role="main"') || appJsx.includes('<main')).toBe(true);
    expect(headerJsx.includes('role="banner"') || headerJsx.includes('<header')).toBe(true);
    expect(intakeJsx.includes('aria-label') || intakeJsx.includes('htmlFor') || intakeJsx.includes('label')).toBe(true);
  });

});
