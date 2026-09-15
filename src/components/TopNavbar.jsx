import React from 'react';
import { FileText, Printer, Download, Sparkles, ShieldAlert, CheckSquare, RefreshCw, Menu } from 'lucide-react';

export default function TopNavbar({ 
  currentDocTitle, 
  category, 
  risksCount = 0, 
  questionsCount = 0,
  onPrint,
  onDownload,
  onReset,
  onToggleMobileSidebar
}) {
  return (
    <header className="bg-paper-50 border-b border-paper-300/60 px-4 py-3 sticky top-0 z-10 shadow-xs flex items-center justify-between gap-4">
      
      {/* Left: Mobile Menu Toggle & Active Document Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-paper-200 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-clay-100 text-clay-700 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-serif text-slate-900 truncate max-w-xs sm:max-w-md">
                {currentDocTitle || 'Medical Document Navigator'}
              </h2>
              {category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-clay-100 text-clay-700 border border-clay-500/20 shrink-0 hidden sm:inline-block">
                  {category}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-sans hidden sm:block">
              Interactive Patient Navigator & Risk Assessment Report
            </p>
          </div>
        </div>
      </div>

      {/* Right: Quick Preparedness Metrics & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Risk Badge */}
        {risksCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-clay-50 text-clay-700 border border-clay-500/20">
            <ShieldAlert className="w-3.5 h-3.5 text-clay-600" />
            <span>{risksCount} Risk Flags</span>
          </div>
        )}

        {/* Questions Count Badge */}
        {questionsCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sage-50 text-sage-700 border border-sage-500/20">
            <CheckSquare className="w-3.5 h-3.5 text-sage-600" />
            <span>{questionsCount} Questions</span>
          </div>
        )}

        {/* Print Action */}
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 bg-paper-100 hover:bg-paper-200 border border-paper-300/60 transition-all"
          title="Print or Save as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Print</span>
        </button>

        {/* Download Action */}
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-paper-50 bg-clay-500 hover:bg-clay-600 shadow-xs transition-all"
          title="Download Report Summary"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Report</span>
        </button>
      </div>

    </header>
  );
}
