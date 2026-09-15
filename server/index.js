import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { 
  simplifyDocument, 
  detectRisks, 
  generateChecklist, 
  generatePatientRights,
  explainScenario
} from './services/genai.js';

import { sampleDocuments } from './services/fallbackEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Consentia — Medical Consent & Patient Rights Navigator',
    genaiReady: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Sample Documents Endpoint
app.get('/api/samples', (req, res) => {
  res.json(Object.values(sampleDocuments));
});

/**
 * FULL ANALYSIS ROUTE
 * Triggers all 4 explicit GenAI engines in parallel:
 * 1. Document Simplification
 * 2. Risk & Clause Detection
 * 3. Question Checklist Generation
 * 4. Patient Rights Summary
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const cleanText = text.trim();

    // Trigger explicit GenAI engines
    const [simplification, risks, rights] = await Promise.all([
      simplifyDocument(cleanText),
      detectRisks(cleanText),
      generatePatientRights(cleanText)
    ]);

    // Generate checklist using parsed context and detected risks
    const checklist = await generateChecklist(cleanText, risks);

    res.json({
      success: true,
      data: {
        simplification,
        risks,
        checklist,
        rights
      }
    });
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: 'Failed to analyze medical document', details: err.message });
  }
});

// Explicit Individual GenAI Integration Endpoints
app.post('/api/simplify', async (req, res) => {
  try {
    const { text } = req.body;
    const data = await simplifyDocument(text);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/detect-risks', async (req, res) => {
  try {
    const { text } = req.body;
    const data = await detectRisks(text);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checklist', async (req, res) => {
  try {
    const { text, risks } = req.body;
    const data = await generateChecklist(text, risks || []);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patient-rights', async (req, res) => {
  try {
    const { text } = req.body;
    const data = await generatePatientRights(text);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/what-if', async (req, res) => {
  try {
    const { clause, question } = req.body;
    const data = await explainScenario(clause, question);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend dist build static files in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Consentia Server running. Build frontend with `npm run build` to view UI.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Consentia Server] Running on http://localhost:${PORT}`);
});
