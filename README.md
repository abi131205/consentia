# Consentia — Medical Consent & Patient Rights Navigator

> **A GenAI-powered healthcare document navigator that helps patients and caregivers understand consent forms, insurance decisions, billing documents, and patient-rights information.**

---

## 📋 Legal Boundary & Persistent Disclaimer

**Consentia provides clear explanations and preparation tools to empower you. It does not replace professional legal or medical advice.**

A persistent, human-first one-liner disclaimer is embedded across all user interfaces:
> *"Patient Navigator Disclaimer: Consentia provides clear explanations and preparation tools to empower you. It does not replace professional legal or medical advice."*

---

## 🏥 Problem Statement

Healthcare paperwork—such as surgical consent forms, hospital billing statements, procedure waivers, and insurance claim denial letters—is notoriously complex. Filled with legal legalese, medical terminology, binding arbitration clauses, liability waivers, and strict appeal deadlines, these documents are presented to patients and caregivers who are often stressed and confused in hospital waiting rooms.

Without specialized assistance, patients risk forfeiting their appeal rights, assuming unexpected out-of-network balance billing, or signing away rights to dispute medical errors.

---

## 💡 Solution: Understand → Identify → Ask → Prepare

Consentia acts as a calm, empathetic patient navigator. Written in a tone resembling a knowledgeable friend who understands medical paperwork, it guides patients through a structured four-stage preparation workflow:

1. **Understand**: Translates dense legalese into plain-language, section-by-section summaries with clear one-line takeaways.
2. **Identify**: Automatically flags potential risk areas (binding arbitration, liability waivers, 30-day appeal windows, out-of-network balance billing).
3. **Ask**: Generates a personalized, interactive checklist of questions to bring to doctors, billing offices, or insurance representatives.
4. **Prepare**: Provides a tailored Patient Rights Snapshot and an interactive **"What Happens If?"** scenario explainer for real-world consequence analysis.

---

## 🤖 GenAI Architecture & Explicit Service Mapping

Consentia utilizes Google Gemini (`gemini-2.5-flash`) via the official `@google/genai` SDK to power **FIVE** distinct, specialized intelligence services. Each integration point is explicitly defined in backend services (`server/services/genai.js`):

| GenAI Engine Service | Backend Function | Purpose | Input | Output Structure |
| :--- | :--- | :--- | :--- | :--- |
| **1. Document Simplification Engine** | `simplifyDocument(rawText)` | Converts complex document text into structured plain-language explanations. | Raw document text | `{ documentCategory, overallSummary, sections: [{ title, originalSnippet, plainLanguage, bottomLineTakeaway }] }` |
| **2. Risk & Clause Detection Engine** | `detectRisks(rawText)` | Identifies clauses that deserve attention (arbitration, waivers, balance billing, deadlines). | Raw document text | Array of flagged clause objects: `[{ clauseType, severity ('high' \| 'medium' \| 'info'), quotedText, explanation, whatHappensIfClicked }]` |
| **3. Question Checklist Generator** | `generateChecklist(rawText, risks)` | Generates actionable, categorized questions based on document text and detected risks. | Raw document + detected risks | `{ summaryTip, categories: [{ title, target, questions: [...] }] }` |
| **4. Patient Rights Summary Generator** | `generatePatientRights(rawText)` | Generates general educational information about relevant patient rights based on document context. | Raw document text | `{ documentCategory, disclaimer, rightsList: [{ right, details }] }` |
| **5. Interactive Scenario Explainer** | `explainScenario(clause, question)` | Answers user "What happens if?" scenario questions based on specific clauses. | Clause snippet + user question | `{ scenario, consequence, actionSteps: [...] }` |

---

## 🔄 End-to-End Architecture & Data Flow

```
React 18 UI (Vite + Tailwind + Framer Motion)
      │
      ▼ HTTP POST (JSON Payload)
Node.js Express Backend (/api/analyze & /api/what-if)
      │
      ├──▶ 1. simplifyDocument()
      ├──▶ 2. detectRisks()
      ├──▶ 3. generateChecklist()      ────▶ Google Gemini 2.5 Flash (@google/genai)
      ├──▶ 4. generatePatientRights()
      └──▶ 5. explainScenario()
      │
      ▼ Structured JSON Response
React UI (Asymmetric Dynamic Workspace Canvas)
```

### 🛡️ Dual-Execution Architecture: GenAI vs. Local Heuristic Fallback Engine
- **Primary GenAI Mode**: Powered by Google Gemini (`gemini-2.5-flash`) via `@google/genai` when a valid `GEMINI_API_KEY` is configured.
- **Local Heuristic Fallback Engine**: If Gemini is unavailable, unconfigured, or experiences network rate limits, Consentia automatically switches to its **Local Heuristic Fallback Engine** (`server/services/fallbackEngine.js`).
  *Note: The local fallback engine uses deterministic rule-based parsing and is explicitly documented as separate from the GenAI path. It ensures 100% demonstration resilience and offline availability.*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **GenAI SDK**: `@google/genai` (Google Gemini 2.5 Flash).
- **Deployment**: Render / Vercel.

---

## ⚖️ Responsible AI & Ethical Safety Boundaries

- **No Professional Advice**: Consentia provides general educational assistance and document navigation. It does NOT provide legal advice or medical diagnoses.
- **Non-Definitive Phrasing**: Detected risks use non-definitive wording (*"May require additional attention"*, *"Potential area to clarify"*, *"Consider asking about..."*) rather than claiming a clause is illegal.
- **Jurisdiction Awareness**: Patient rights information is clearly framed: *"General educational information. Applicable rights may depend on jurisdiction, insurance coverage, circumstances, and the specific document."*
- **No Fabricated Statutes**: The system does not manufacture legal citations or fake case law.

---

## 🚀 Quick Setup & Local Installation

### Prerequisites
- Node.js v18 or later

### Installation

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/abi131205/consentia.git
cd consentia
npm install
```

2. Configure environment variables (create a `.env` file):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
```
*(If no API key is provided, Consentia operates via its built-in Local Heuristic Fallback Engine).*

3. Run the application locally:

**Production Mode (Single Server):**
```bash
npm run build
npm start
```

**Development Mode (Live Reload):**
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Frontend Dev Server
npm run dev
```

Open browser at `http://localhost:5000` (or `http://localhost:3000` for development).

---

## ⚡ Deployment

Consentia is live on Render:
- **Live Application URL**: [https://consentia-tmh7.onrender.com/](https://consentia-tmh7.onrender.com/)
- **GitHub Repository**: [https://github.com/abi131205/consentia](https://github.com/abi131205/consentia)

---

## 🎥 Demo Video

Demo video: [ADD FINAL VIDEO LINK]
