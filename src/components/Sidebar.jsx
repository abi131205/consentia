import React from 'react';
import { 
  Shield, 
  PlusCircle, 
  FileText, 
  HeartHandshake, 
  ShieldAlert, 
  CheckSquare, 
  Scale, 
  History, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Info
} from 'lucide-react';

export default function Sidebar({ 
  activeNav, 
  setActiveNav, 
  onNewAnalysis, 
  history = [], 
  currentDocId, 
  onSelectHistoryDoc,
  isCollapsed,
  setIsCollapsed
}) {
  const navItems = [
    { id: 'intake', label: 'Document Intake', icon: FileText, badge: null },
    { id: 'breakdown', label: 'Plain Breakdown', icon: HeartHandshake, badge: null },
    { id: 'risks', label: 'Risk & Clause Audit', icon: ShieldAlert, badge: null },
    { id: 'checklist', label: 'Question Checklist', icon: CheckSquare, badge: null },
    { id: 'rights', label: 'Patient Rights Library', icon: Scale, badge: 'Guide' },
  ];

  return (
    <aside 
      className={`bg-paper-50 border-r border-paper-300/60 flex flex-col justify-between transition-all duration-300 z-20 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="p-4 border-b border-paper-200/80 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveNav('intake')}>
              <div className="w-9 h-9 rounded-xl bg-clay-500 text-paper-50 flex items-center justify-center shadow-md shadow-clay-500/20 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-serif text-slate-900 leading-none">Consentia</h1>
                <span className="text-[10px] font-semibold text-clay-600 tracking-wide uppercase">Patient Navigator</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 rounded-xl bg-clay-500 text-paper-50 flex items-center justify-center mx-auto cursor-pointer" onClick={() => setActiveNav('intake')}>
              <Shield className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-paper-200 transition-all hidden sm:block"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <button
            onClick={onNewAnalysis}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-clay-500 text-paper-50 font-semibold text-xs shadow-sm hover:bg-clay-600 transition-all ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Analyze New Document"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>New Analysis</span>}
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-clay-50 text-clay-700 border border-clay-500/20 shadow-xs'
                    : 'text-slate-600 hover:bg-paper-100 hover:text-slate-900'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-clay-600' : 'text-slate-500'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sage-100 text-sage-700 border border-sage-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Recent Documents Section */}
        {!isCollapsed && history.length > 0 && (
          <div className="p-3 pt-4 border-t border-paper-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2 px-1">
              <History className="w-3 h-3 text-clay-600" /> Recent Documents
            </span>

            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {history.map((doc) => {
                const isSelected = currentDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => onSelectHistoryDoc(doc)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-paper-100 border-paper-300 font-bold text-slate-900'
                        : 'border-transparent text-slate-600 hover:bg-paper-100/70 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{doc.title}</span>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0">{doc.date}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-paper-200/80 bg-paper-100/50 space-y-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-sage-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-sage-600 shrink-0" />
            <span>GenAI Active: Gemini 2.5 Flash</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-tight">
            Consentia Patient Navigator (v1.0)
          </p>
        </div>
      ) : (
        <div className="p-3 border-t border-paper-200/80 text-center">
          <Sparkles className="w-4 h-4 text-sage-600 mx-auto" />
        </div>
      )}
    </aside>
  );
}
