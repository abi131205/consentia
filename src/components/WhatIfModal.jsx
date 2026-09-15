import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function WhatIfModal({ isOpen, onClose, initialClause = '', initialQuestion = '' }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setQuestion(initialQuestion || `What happens if I refuse to sign or encounter issues with this clause?`);
      setResult(null);
      if (initialQuestion || initialClause) {
        fetchExplanation(initialClause, initialQuestion || `What happens if I encounter issues with this?`);
      }
    }
  }, [isOpen, initialClause, initialQuestion]);

  const fetchExplanation = async (clauseText, userQ) => {
    setLoading(true);
    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clause: clauseText, question: userQ })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      console.error('What-If fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    fetchExplanation(initialClause, question);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-paper-50 w-full max-w-2xl rounded-2xl border border-paper-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-paper-100 p-5 border-b border-paper-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-clay-100 text-clay-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900">
                "What Happens If..." Explainer
              </h3>
              <p className="text-xs text-slate-600">
                Real-world consequences & actionable patient steps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-paper-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Targeted Clause Snippet */}
          {initialClause && (
            <div className="bg-paper-100/70 p-3.5 rounded-xl border border-paper-300/50 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Targeted Clause / Topic:
              </span>
              <p className="italic font-mono text-slate-800 line-clamp-2">"{initialClause}"</p>
            </div>
          )}

          {/* Interactive Question Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Ask your "What Happens If" question:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What happens if I don't respond to this denial in 30 days?"
                className="flex-1 bg-paper-50 text-slate-900 text-sm px-3.5 py-2.5 rounded-xl border border-paper-300 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-500"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="px-4 py-2.5 rounded-xl bg-clay-500 text-paper-50 font-semibold text-xs flex items-center gap-1.5 hover:bg-clay-600 disabled:opacity-50 transition-all shrink-0"
              >
                {loading ? <div className="w-4 h-4 border-2 border-paper-50 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Explain
              </button>
            </div>
          </form>

          {/* Result Display */}
          {loading && (
            <div className="py-8 text-center space-y-2 text-slate-600">
              <div className="w-6 h-6 border-2 border-clay-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Generating plain-language consequence analysis...</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4 pt-2">
              
              {/* Consequence Box */}
              <div className="bg-clay-50 border-l-4 border-clay-500 p-4 rounded-r-xl space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-clay-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-clay-600" />
                  Real-World Consequence:
                </span>
                <p className="text-sm text-clay-950 leading-relaxed font-sans font-medium">
                  {result.consequence}
                </p>
              </div>

              {/* Actionable Steps */}
              {result.actionSteps && result.actionSteps.length > 0 && (
                <div className="bg-paper-100/80 p-4 rounded-xl border border-paper-300/60 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sage-600" />
                    Recommended Steps You Can Take:
                  </span>
                  <ul className="space-y-2">
                    {result.actionSteps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                        <ArrowRight className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-paper-100 p-4 border-t border-paper-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-paper-200 hover:bg-paper-300 transition-all"
          >
            Close Explainer
          </button>
        </div>

      </div>
    </div>
  );
}
