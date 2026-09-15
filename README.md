# Consentia — GenAI Medical Consent & Patient Rights Navigator

> **Empowering patients and caregivers to understand medical consent forms, hospital paperwork, insurance denial letters, and billing disputes before signing, appealing, or agreeing to anything.**

---

## 📋 Legal Boundary & Persistent Disclaimer

**Consentia provides clear explanations and preparation tools to empower you. It does not replace professional legal or medical advice.**

A persistent, human-first one-liner disclaimer is embedded across all user interfaces.

---

## 🏥 Problem Statement

When faced with complex surgical consent forms, unexpected out-of-network hospital bills, or insurance denial letters, patients and caregivers are often confused and anxious in hospital waiting rooms. Traditional legal boilerplate is intimidating, packed with binding arbitration waivers, liability releases, and strict deadlines.

**Consentia** solves this problem by acting as a calm, clear, and empathetic patient navigator. Written in a tone resembling a smart friend who understands medical paperwork, it simplifies legalese into actionable insights and personalized question checklists.

---

## 🤖 GenAI Architecture & Explicit Service Mapping

Consentia utilizes Google Gemini (`gemini-2.5-flash`) via `@google/genai` to power four distinct, specialized intelligence engines. Each integration point is explicitly defined in backend services (`server/services/genai.js`):

| GenAI Engine | Integration Point | Input | Output Payload Structure |
| :--- | :--- | :--- | :--- |
| **1. Document Simplification Engine** | `simplifyDocument(rawText)` | Raw document text (consent form, denial letter, bill) | `{ documentCategory, overallSummary, sections: [{ title, originalSnippet, plainLanguage, bottomLineTakeaway }] }` |
| **2. Risk & Clause Detection Engine** | `detectRisks(rawText)` | Raw document text | Array of flagged risk objects: `[{ clauseType, severity ('high' \| 'medium' \| 'info'), quotedText, explanation, whatHappensIfClicked }]` |
| **3. Question & Checklist Generator** | `generateChecklist(rawText, risks)` | Parsed text + detected risks array | `{ summaryTip, categories: [{ title, target, questions: [...] }] }` |
| **4. Patient Rights Summary Generator** | `generatePatientRights(rawText)` | Document category & context | `{ documentCategory, disclaimer, rightsList: [{ right, details }] }` |

*Note: Consentia also includes an interactive **"What Happens If" Explainer** endpoint (`explainScenario(clause, question)`) for real-world consequence analysis.*

---

## 🎨 Design Direction

- **No AI Clichés**: Avoids purple-to-blue gradients, dark-mode neon glowing accents, generic chat bubbles, and rigid card grids.
- **Warm Grounded Palette**: Uses warm healthcare tones — Terracotta (`#c85a32`), Warm Cream/Paper (`#f6f2ea`), Deep Slate (`#0f172a`), Sage Green (`#4a6b5d`), and Amber (`#d97706`).
- **Dynamic Asymmetric Layout**: Rethinks screen arrangements at different breakpoints with an asymmetric dual-column desktop layout and stacked drawer views.
- **Interactive Motion**: Framer Motion transitions during document analysis, section toggling, and interactive "What Happens If" modal launcher.

---

## 🚀 Quick Setup & Installation

### Prerequisites
- Node.js v18 or later

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. (Optional) Set up your Gemini API key in a `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```
*Note: If no API key is provided, Consentia automatically operates in a high-fidelity Heuristic Fallback Mode so all features work seamlessly out-of-the-box.*

3. Start the application:

**Build and run production server:**
```bash
npm run build
npm run server
```

**Development mode:**
Run backend server and Vite frontend concurrently:
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Frontend Vite Dev Server
npm run dev
```

Open your browser at `http://localhost:3000` (or `http://localhost:5000` in production).

---

## 📄 Sample Test Documents Included

For live demo entry and evaluation, Consentia includes 4 realistic sample scenarios accessible via 1-click preset buttons:
1. **General Surgical Informed Consent & Liability Release**
2. **Commercial Health Plan Insurance Claim Denial Letter**
3. **Out-of-Network Emergency Facility & Anesthesia Statement**
4. **Out-of-Pocket Payment Agreement & Financial Guarantee**

---

## ⚡ Deployment

Consentia is designed to deploy seamlessly to platforms like Vercel, Render, Railway, or Google Cloud Run.
- Frontend build output: `dist/`
- Backend entrypoint: `server/index.js`
