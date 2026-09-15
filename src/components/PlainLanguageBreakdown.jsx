import React, { useState } from 'react';
import { HeartHandshake, Eye, EyeOff, CheckCircle2, ChevronDown, ChevronUp, Quote } from 'lucide-react';

export default function PlainLanguageBreakdown({ simplification }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  if (!simplification) return null;

  const { documentCategory, overallSummary, sections = [] } = simplification;

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Category & Overall Reassuring Summary */}
      <div className="bg-paper-50 p-6 rounded-2xl border border-paper-300/60 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-200 pb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-clay-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-clay-600 bg-clay-100/80 px-2.5 py-1 rounded-md">
              {documentCategory || 'Medical Document Translation'}
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 bg-paper-100 hover:bg-paper-200 border border-paper-300/50 transition-all"
          >
            {showOriginal ? <EyeOff className="w-3.5 h-3.5 text-clay-600" /> : <Eye className="w-3.5 h-3.5 text-sage-600" />}
            {showOriginal ? 'Hide Original Legal Wording' : 'Show Original Legal Wording'}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold font-serif text-slate-900 mb-1">Overall Plain-Language Summary</h3>
          <p className="text-sm text-slate-700 leading-relaxed font-sans">
            {overallSummary}
          </p>
        </div>
      </div>

      {/* Section-by-Section Plain Language Cards */}
      <div className="space-y-4">
        <h3 className="text-md font-bold uppercase tracking-wider text-slate-500 font-sans px-1">
          Section-by-Section Plain Breakdown ({sections.length} Sections)
        </h3>

        {sections.map((section, idx) => {
          const isExpanded = expandedSections[idx] !== false; // expanded by default

          return (
            <div 
              key={idx}
              className="bg-paper-50 rounded-2xl border border-paper-300/70 shadow-xs overflow-hidden transition-all hover:border-paper-300"
            >
              {/* Header bar of section card */}
              <div 
                onClick={() => toggleSection(idx)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer bg-paper-50 hover:bg-paper-100/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <h4 className="text-base font-bold font-serif text-slate-900">
                    {section.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 hidden sm:inline">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              </div>

              {/* Card Body */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-paper-200/60 space-y-4 bg-paper-50">
                  
                  {/* Plain Language Rewrite */}
                  <div className="pt-4 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Plain English Translation
                    </span>
                    <p className="text-sm text-slate-800 leading-relaxed font-sans">
                      {section.plainLanguage}
                    </p>
                  </div>

                  {/* ONE-LINE TAKEAWAY CALLOUT (REQUIRED) */}
                  <div className="bg-sage-50 border-l-4 border-sage-500 p-4 rounded-r-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sage-700 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-sage-600" />
                      What this actually means for you:
                    </div>
                    <p className="text-sm font-medium text-sage-900 leading-snug">
                      {section.bottomLineTakeaway ? section.bottomLineTakeaway.replace(/^What this actually means for you:\s*/i, '') : section.plainLanguage}
                    </p>
                  </div>

                  {/* Optional Original Snippet View */}
                  {showOriginal && section.originalSnippet && (
                    <div className="bg-paper-100/70 p-3.5 rounded-xl border border-paper-300/40 text-xs text-slate-600 space-y-1 font-mono">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                        <Quote className="w-3 h-3 text-slate-600" /> Original Medical / Legal Wording:
                      </span>
                      <p className="italic leading-relaxed">{section.originalSnippet}</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
