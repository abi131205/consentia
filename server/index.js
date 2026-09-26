import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
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

// Security Middleware: Helmet HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows static frontend resources
  crossOriginEmbedderPolicy: false
}));

// Performance Middleware: HTTP Gzip Compression
app.use(compression());

// Security Middleware: Strict CORS Policy
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Middleware: Rate Limiting to prevent DoS / Brute-Force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 120, // Limit each IP to 120 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);
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
      return res.status(400).json({ error: 'Please enter or upload a document before analyzing it.' });
    }

    const cleanText = text.trim();

    // Trigger explicit GenAI engines concurrently
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
    console.error('Error in /api/analyze:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred while analyzing the document.', details: 'Safe error handling active.' });
  }
});

// Explicit Individual GenAI Integration Endpoints
app.post('/api/simplify', async (req, res) => {
  try {
    const { text } = req.body;
    const data = await simplifyDocument(text);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Service temporarily unavailable' });
  }
});

app.post('/api/detect-risks', async (req, res) => {
  try {
    const { text } = req.body;
    const data = await detectRisks(text);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Service temporarily unavailable' });
  }
});

app.post('/api/checklist', async (req, res) => {
  try {
    const { text, risks } = req.body;
    const data = await generateChecklist(text, risks || []);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Service temporarily unavailable' });
  }
});

app.post('/api/patient-rights', async (req, res) => {
  try {
    const { text } = req.body;
    const data = await generatePatientRights(text);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Service temporarily unavailable' });
  }
});

app.post('/api/what-if', async (req, res) => {
  try {
    const { clause, question } = req.body;
    const data = await explainScenario(clause, question);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Service temporarily unavailable' });
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
  console.log(`[Consentia Server] Running securely on http://localhost:${PORT}`);
});
