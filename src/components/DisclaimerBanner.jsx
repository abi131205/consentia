import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function DisclaimerBanner({ position = 'top' }) {
  return (
    <div className={`w-full bg-paper-50/90 backdrop-blur border-b border-paper-300/40 py-2 px-4 text-xs sm:text-sm text-slate-700 shadow-sm z-30 ${position === 'bottom' ? 'border-t border-b-0' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <Info className="w-4 h-4 text-clay-500 shrink-0" />
        <p className="font-medium">
          <span className="font-semibold text-slate-900">Patient Navigator Disclaimer:</span> Consentia provides clear explanations and preparation tools to empower you. It does not replace professional legal or medical advice.
        </p>
      </div>
    </div>
  );
}
