import React from 'react';
import { Shield, Sparkles, FileText, CheckSquare, HeartHandshake } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, hasAnalysis, onReset }) {
  return (
    <header className="bg-paper-50 border-b border-paper-300/50 pt-4 pb-3 px-4 sm:px-6 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-clay-500 text-paper-50 flex items-center justify-center shadow-md shadow-clay-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">Consentia</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 text-sage-700 border border-sage-500/20">
                <Sparkles className="w-3 h-3 text-sage-600" /> GenAI Patient Navigator
              </span>
            </div>
            <p className="text-xs text-slate-600 font-sans">
              Understand medical consent, hospital forms & insurance denials before you sign or agree.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {hasAnalysis && (
          <nav className="flex items-center gap-1 bg-paper-100 p-1 rounded-xl border border-paper-300/60 self-start md:self-center">
            <button
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'intake'
                  ? 'bg-paper-50 text-clay-700 shadow-xs border border-paper-300/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Intake & Source
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'breakdown'
                  ? 'bg-paper-50 text-clay-700 shadow-xs border border-paper-300/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4" /> Plain Breakdown
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'checklist'
                  ? 'bg-paper-50 text-clay-700 shadow-xs border border-paper-300/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" /> Questions Checklist
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
