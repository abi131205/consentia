import React from 'react';
import { HeartHandshake, Shield, Scale, Info, CheckCircle2 } from 'lucide-react';

export default function PatientRightsSnapshot({ rights }) {
  if (!rights || !rights.rightsList) return null;

  const { documentCategory, disclaimer, rightsList } = rights;

  return (
    <div className="bg-paper-50 p-6 rounded-2xl border border-paper-300/70 shadow-xs space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-paper-200 pb-3">
        <div className="flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-sage-600" />
          <h3 className="text-lg font-bold font-serif text-slate-900">
            Patient Rights Snapshot ({documentCategory || 'General Protections'})
          </h3>
        </div>
        <span className="text-[11px] font-bold text-sage-700 bg-sage-100 px-2.5 py-1 rounded-md border border-sage-500/20">
          General Educational Reference
        </span>
      </div>

      {/* Rights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {rightsList.map((item, idx) => (
          <div 
            key={idx}
            className="bg-paper-100/60 p-4 rounded-xl border border-paper-300/50 space-y-1.5 hover:bg-paper-100 transition-all"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900 font-sans">
                {item.right}
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans pl-6">
              {item.details}
            </p>
          </div>
        ))}
      </div>

      {/* Framing Disclaimer */}
      {disclaimer && (
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-paper-200">
          <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>{disclaimer}</span>
        </div>
      )}
    </div>
  );
}
