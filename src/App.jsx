import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DisclaimerBanner from './components/DisclaimerBanner';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DocumentIntake from './components/DocumentIntake';
import PlainLanguageBreakdown from './components/PlainLanguageBreakdown';
import RiskHighlighter from './components/RiskHighlighter';
import QuestionChecklist from './components/QuestionChecklist';
import PatientRightsSnapshot from './components/PatientRightsSnapshot';
import RightsLibrary from './components/RightsLibrary';
import WhatIfModal from './components/WhatIfModal';
import { RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentText, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeNav, setActiveNav] = useState('intake'); // 'intake' | 'breakdown' | 'risks' | 'checklist' | 'rights'
  const [samples, setSamples] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal State for What-If Explainer
  const [modalState, setModalState] = useState({
    isOpen: false,
    clause: '',
    question: ''
  });

  // Load sample documents and history on mount
  useEffect(() => {
    fetch('/api/samples')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSamples(data);
      })
      .catch(err => console.warn('Failed to load sample docs:', err));

    try {
      const savedHistory = localStorage.getItem('consentia_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn('Failed to load local history:', e);
    }
  }, []);

  // Main Analysis Handler
  const handleAnalyze = async (textToAnalyze) => {
    if (!textToAnalyze || !textToAnalyze.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze })
      });
      const json = await res.json();

      if (json.success && json.data) {
        const data = json.data;
        setAnalysisData(data);
        setActiveNav('breakdown');

        // Save to document history
        const docCategory = data.simplification?.documentCategory || 'Medical Document';
        const newDocItem = {
          id: 'doc_' + Date.now(),
          title: docCategory + ' (' + textToAnalyze.trim().slice(0, 25) + '...)',
          category: docCategory,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawText: textToAnalyze,
          data
        };

        setCurrentDoc(newDocItem);

        const updatedHistory = [newDocItem, ...history.filter(h => h.rawText !== textToAnalyze)].slice(0, 10);
        setHistory(updatedHistory);
        try {
          localStorage.setItem('consentia_history', JSON.stringify(updatedHistory));
        } catch (e) {}

      } else {
        alert('Failed to analyze document: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Network error connecting to analysis server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryDoc = (docItem) => {
    setCurrentDoc(docItem);
    setText(docItem.rawText);
    setAnalysisData(docItem.data);
    setActiveNav('breakdown');
  };

  const handleTriggerWhatIf = (clauseText, userQuestion) => {
    setModalState({
      isOpen: true,
      clause: clauseText || '',
      question: userQuestion || ''
    });
  };

  const handleReset = () => {
    setText('');
    setAnalysisData(null);
    setCurrentDoc(null);
    setActiveNav('intake');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummary = () => {
    if (!analysisData) return;

    const category = analysisData.simplification?.documentCategory || 'Medical Document';
    let content = `CONSENTIA PATIENT NAVIGATOR SUMMARY REPORT\n`;
    content += `Category: ${category}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `==============================================\n\n`;

    content += `OVERALL SUMMARY:\n${analysisData.simplification?.overallSummary}\n\n`;

    content += `FLAGGED RISKS & CLAUSES:\n`;
    (analysisData.risks || []).forEach((r, i) => {
      content += `${i + 1}. [${(r.severity || 'INFO').toUpperCase()}] ${r.clauseType}\n`;
      content += `   Quote: "${r.quotedText}"\n`;
      content += `   Explanation: ${r.explanation}\n\n`;
    });

    content += `QUESTION CHECKLIST:\n`;
    (analysisData.checklist?.categories || []).forEach(cat => {
      content += `\n[ ${cat.title} ]\n`;
      cat.questions.forEach(q => {
        content += `  [ ] ${q}\n`;
      });
    });

    content += `\n---\nDisclaimer: Educational preparation reference tool. Does not constitute legal or medical advice.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consentia-report-${category.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex bg-paper-100 text-slate-900 font-sans selection:bg-clay-100 selection:text-clay-700">
      
      {/* Left App Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onNewAnalysis={handleReset}
        history={history}
        currentDocId={currentDoc?.id}
        onSelectHistoryDoc={handleSelectHistoryDoc}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Right Web App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        {/* Persistent Legal Disclaimer Banner */}
        <DisclaimerBanner position="top" />

        {/* Web App Top Navigation Header */}
        <TopNavbar
          currentDocTitle={currentDoc?.title || analysisData?.simplification?.documentCategory}
          category={analysisData?.simplification?.documentCategory}
          risksCount={analysisData?.risks?.length || 0}
          questionsCount={analysisData?.checklist?.categories?.reduce((acc, cat) => acc + (cat.questions?.length || 0), 0) || 0}
          onPrint={handlePrint}
          onDownload={handleExportSummary}
          onReset={handleReset}
          onToggleMobileSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Workspace Canvas Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* NAV TAB 1: Document Intake */}
              {activeNav === 'intake' && (
                <DocumentIntake
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  samples={samples}
                  currentText={currentText}
                  setText={setText}
                />
              )}

              {/* NAV TAB 2: Plain Language Breakdown */}
              {activeNav === 'breakdown' && (
                <div>
                  {!analysisData ? (
                    <div className="bg-paper-50 p-12 text-center rounded-2xl border border-paper-300/60 shadow-xs space-y-4 max-w-xl mx-auto my-8">
                      <div className="w-12 h-12 rounded-2xl bg-clay-100 text-clay-700 flex items-center justify-center mx-auto font-bold">
                        1
                      </div>
                      <h3 className="text-xl font-bold font-serif text-slate-900">No Document Analyzed Yet</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Please paste or select a medical consent form, hospital bill, or insurance denial letter to generate a plain-language breakdown.
                      </p>
                      <button
                        onClick={() => setActiveNav('intake')}
                        className="px-5 py-2.5 rounded-xl bg-clay-500 text-paper-50 font-semibold text-xs inline-flex items-center gap-2 hover:bg-clay-600"
                      >
                        Go to Intake & Paste Text <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-7 space-y-6">
                        <PlainLanguageBreakdown simplification={analysisData.simplification} />
                      </div>
                      <div className="lg:col-span-5 space-y-6">
                        <RiskHighlighter risks={analysisData.risks} onTriggerWhatIf={handleTriggerWhatIf} />
                        <PatientRightsSnapshot rights={analysisData.rights} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NAV TAB 3: Dedicated Risk & Clause Audit */}
              {activeNav === 'risks' && (
                <div>
                  {!analysisData ? (
                    <div className="bg-paper-50 p-12 text-center rounded-2xl border border-paper-300/60 shadow-xs space-y-4 max-w-xl mx-auto my-8">
                      <h3 className="text-xl font-bold font-serif text-slate-900">No Risk Flags to Display</h3>
                      <p className="text-xs text-slate-600">Analyze a medical document first to inspect automatically flagged clauses.</p>
                      <button onClick={() => setActiveNav('intake')} className="px-5 py-2.5 rounded-xl bg-clay-500 text-paper-50 font-semibold text-xs">
                        Start Document Intake
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto space-y-6">
                      <RiskHighlighter risks={analysisData.risks} onTriggerWhatIf={handleTriggerWhatIf} />
                      <PatientRightsSnapshot rights={analysisData.rights} />
                    </div>
                  )}
                </div>
              )}

              {/* NAV TAB 4: Dedicated Question Checklist */}
              {activeNav === 'checklist' && (
                <div>
                  {!analysisData ? (
                    <div className="bg-paper-50 p-12 text-center rounded-2xl border border-paper-300/60 shadow-xs space-y-4 max-w-xl mx-auto my-8">
                      <h3 className="text-xl font-bold font-serif text-slate-900">No Checklist Generated Yet</h3>
                      <p className="text-xs text-slate-600">Submit a medical document to generate your personalized question checklist.</p>
                      <button onClick={() => setActiveNav('intake')} className="px-5 py-2.5 rounded-xl bg-clay-500 text-paper-50 font-semibold text-xs">
                        Start Document Intake
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto space-y-6">
                      <QuestionChecklist checklist={analysisData.checklist} />
                    </div>
                  )}
                </div>
              )}

              {/* NAV TAB 5: Patient Rights Reference Library */}
              {activeNav === 'rights' && (
                <div className="space-y-6">
                  <RightsLibrary />
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </main>

        {/* Footer */}
        <footer className="bg-paper-50 border-t border-paper-300/50 py-5 px-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-700">Consentia — GenAI Patient Rights & Consent Navigator</span>
            <span>Empowering patient advocacy & educational preparation</span>
          </div>
        </footer>

      </div>

      {/* Interactive "What Happens If" Explainer Modal */}
      <WhatIfModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, clause: '', question: '' })}
        initialClause={modalState.clause}
        initialQuestion={modalState.question}
      />

    </div>
  );
}
