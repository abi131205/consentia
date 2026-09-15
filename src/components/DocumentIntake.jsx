import React, { useState } from 'react';
import { Clipboard, FileText, Upload, Sparkles, AlertCircle, Trash2, ArrowRight, BookOpen } from 'lucide-react';

export default function DocumentIntake({ onAnalyze, isLoading, samples = [], currentText = '', setText }) {
  const [dragActive, setDragActive] = useState(false);

  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const charCount = currentText.length;

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Intro Heading & Context */}
      <div className="bg-paper-50 p-6 rounded-2xl border border-paper-300/60 shadow-xs space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-clay-500" />
          Document Intake
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          Paste the text of your medical consent form, insurance denial letter, hospital bill, or financial waiver below. Consentia will translate the legal jargon into clear, comforting plain English and highlight important rights and risks.
        </p>
      </div>

      {/* Preset Scenarios for Quick Testing */}
      {samples.length > 0 && (
        <div className="bg-paper-50/70 p-4 rounded-xl border border-paper-300/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sage-600" /> Sample Medical Scenarios (1-Click Load)
            </span>
            <span className="text-xs text-slate-600 font-sans">Click any example to inspect live</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => setText(sample.text)}
                className="text-left p-3 rounded-lg border border-paper-300/80 bg-paper-50 hover:bg-clay-50 hover:border-clay-500/40 transition-all group"
              >
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-clay-600 bg-clay-100/70 px-2 py-0.5 rounded mb-1">
                  {sample.category}
                </span>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-clay-700 line-clamp-1">
                  {sample.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Intake Area: Plain Text Paste Primary Path */}
      <div 
        className={`relative bg-paper-50 rounded-2xl border-2 transition-all p-5 shadow-sm space-y-4 ${
          dragActive ? 'border-clay-500 bg-clay-50/20' : 'border-paper-300/80 hover:border-paper-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Action Toolbar above Textarea */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-paper-100 px-2.5 py-1 rounded-md border border-paper-300/40">
              Primary Intake: Plain Text Paste
            </span>
            {wordCount > 0 && (
              <span className="text-xs text-slate-500 font-mono">
                {wordCount} words ({charCount} chars)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-700 bg-paper-100 hover:bg-paper-200 border border-paper-300/60 transition-all"
              title="Paste content from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5 text-clay-600" /> Paste Clipboard
            </button>

            <label className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-700 bg-paper-100 hover:bg-paper-200 border border-paper-300/60 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-sage-600" /> Upload File (.txt)
              <input type="file" accept=".txt,.md,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>

            {currentText && (
              <button
                type="button"
                onClick={() => setText('')}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-all"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <textarea
          value={currentText}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your medical consent form, insurance denial letter, or hospital bill text here... 

For live demo entry, you can paste fresh unformatted text, or click any sample scenario above."
          rows={12}
          className="w-full bg-paper-50 text-slate-900 text-sm leading-relaxed p-4 rounded-xl border border-paper-300/70 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-500 placeholder-slate-400 font-sans resize-y transition-all"
        />

        {/* Bottom Submission Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Private & secure: All document processing happens locally in your browser session.</span>
          </div>

          <button
            type="button"
            disabled={!currentText.trim() || isLoading}
            onClick={() => onAnalyze(currentText)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm shadow-md transition-all ${
              !currentText.trim() || isLoading
                ? 'bg-paper-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-clay-500 text-paper-50 hover:bg-clay-600 hover:shadow-lg hover:shadow-clay-500/20 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-paper-50 border-t-transparent rounded-full animate-spin" />
                Analyzing Document with GenAI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Document & Translate
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
