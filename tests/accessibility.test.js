import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Consentia WCAG WAI-ARIA Accessibility Audit Suite', () => {

  it('index.html contains valid lang attribute, meta description, and document title', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
    assert.ok(html.includes('lang="en"'), 'HTML must declare lang="en"');
    assert.ok(html.includes('<title>'), 'HTML must contain title tag');
    assert.ok(html.includes('meta name="description"'), 'HTML must contain meta description');
  });

  it('All core components feature explicit WAI-ARIA roles and semantic accessibility tags', () => {
    const appJsx = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');
    const intakeJsx = fs.readFileSync(path.resolve('src/components/DocumentIntake.jsx'), 'utf-8');
    const headerJsx = fs.readFileSync(path.resolve('src/components/Header.jsx'), 'utf-8');

    assert.ok(appJsx.includes('role="main"') || appJsx.includes('<main'), 'App must have semantic main element');
    assert.ok(headerJsx.includes('role="banner"') || headerJsx.includes('<header'), 'Header must have banner landmark');
    assert.ok(intakeJsx.includes('aria-label') || intakeJsx.includes('htmlFor') || intakeJsx.includes('label'), 'Intake must have form accessibility labels');
  });

});
