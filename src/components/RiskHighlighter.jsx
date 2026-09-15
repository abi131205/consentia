import React from 'react';
import { AlertTriangle, ShieldAlert, HelpCircle, ArrowRight, Quote } from 'lucide-react';

export default function RiskHighlighter({ risks = [], onTriggerWhatIf }) {
  if (!risks || risks.length === 0) return null;

  // Severity indicator helper using warm earth palette (no traffic-light red/green clichés)
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          label: 'Critical Legal / Financial Flag',
          bg: 'bg-clay-100 text-clay-700 border-clay-500/30',
          accent: 'border-l-clay-500',
          iconColor: 'text-clay-600',
        };
      case 'medium':
        return {
          label: 'Important Clause to Verify',
          bg: 'bg-amber-100 text-amber-700 border-amber-500/30',
          accent: 'border-l-amber-500',
          iconColor: 'text-amber-600',
        };
      default:
        return {
          label: 'Standard Practice Notice',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          accent: 'border-l-slate-400',
          iconColor: 'text-slate-600',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-md font-bold uppercase tracking-wider text-slate-500 font-sans flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-clay-500" />
          Detected Risk & Special Clause Flags ({risks.length})
        </h3>
        <span className="text-xs text-slate-600 font-sans">Click "What Happens If" to inspect consequences</span>
      </div>

      <div className="space-y-3">
        {risks.map((risk, idx) => {
          const badge = getSeverityBadge(risk.severity);

          return (
            <div 
              key={idx}
              className={`bg-paper-50 rounded-xl border border-paper-300/70 border-l-4 ${badge.accent} p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3`}
            >
              {/* Card Header: Clause Name & Severity Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${badge.iconColor}`} />
                  <h4 className="text-base font-bold font-serif text-slate-900">
                    {risk.clauseType}
                  </h4>
                </div>

                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              {/* Exact Quote Highlight */}
              {risk.quotedText && (
                <div className="bg-paper-100/80 p-3 rounded-lg border border-paper-300/50 text-xs text-slate-700 font-mono">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                    <Quote className="w-3 h-3 text-slate-600" /> Quoted Wording:
                  </span>
                  <p className="italic leading-relaxed">{risk.quotedText}</p>
                </div>
              )}

              {/* Plain Language Reasoning */}
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                {risk.explanation}
              </p>

              {/* Interactive "What Happens If" Button (REQUIRED) */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onTriggerWhatIf(risk.quotedText || risk.clauseType, risk.whatHappensIfClicked || `What happens if I encounter issues with ${risk.clauseType}?`)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-clay-700 bg-clay-50 hover:bg-clay-100 px-3 py-1.5 rounded-lg border border-clay-500/20 transition-all hover:border-clay-500/40"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-clay-600" />
                  What Happens If I...
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
