import React, { useState } from 'react';
import { Clipboard, FileText, Upload, Sparkles, AlertCircle, Trash2, ArrowRight, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function DocumentIntake({ onAnalyze, isLoading, samples = [], currentText = '', setText, warningMessage, isLowConfidence }) {
  const [dragActive, setDragActive] = useState(false);
  const [inputError, setInputError] = useState('');

  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const charCount = currentText.length;

  const handleAnalyzeClick = () => {
    if (!currentText || !currentText.trim()) {
      setInputError('Please enter or upload a document before analyzing it.');
      return;
    }
    setInputError('');
    onAnalyze(currentText);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (inputError) setInputError('');
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        if (inputError) setInputError('');
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
        if (inputError) setInputError('');
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
          if (inputError) setInputError('');
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
          Healthcare Document Intake
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          Paste or upload the text of your medical consent form, insurance denial letter, hospital bill, or financial waiver below. Consentia will translate the complex legalese into clear, comforting plain English and highlight important rights and potential risk areas.
        </p>
      </div>

      {/* Preset Scenarios for Quick Testing */}
      {samples.length > 0 && (
        <div className="bg-paper-50/70 p-4 rounded-xl border border-paper-300/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sage-600" /> Synthetic Sample Scenarios (1-Click Load)
            </span>
            <span className="text-xs text-slate-600 font-sans">Click any example to inspect live</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setText(sample.text);
                  if (inputError) setInputError('');
                }}
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

      {/* Input Error / Low-Confidence Banner */}
      {(inputError || isLowConfidence) && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">
              {inputError ? 'Input Required' : 'Low-Confidence Input Detected'}
            </span>
            <p className="leading-relaxed">
              {inputError || warningMessage || 'The input text does not appear to contain enough meaningful medical or legal document content for a reliable analysis. Try entering a consent form, insurance letter, bill, waiver, or other healthcare-related document.'}
            </p>
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
                onClick={() => {
                  setText('');
                  setInputError('');
                }}
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
          onChange={handleTextChange}
          placeholder="Paste your medical consent form, insurance denial letter, hospital bill, or financial waiver text here... 

For live demo entry, you can paste fresh unformatted text, or click any sample scenario above."
          rows={12}
          className="w-full bg-paper-50 text-slate-900 text-sm leading-relaxed p-4 rounded-xl border border-paper-300/70 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-500 placeholder-slate-400 font-sans resize-y transition-all"
        />

        {/* Bottom Privacy & Submission Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-start gap-2 text-xs text-slate-500 max-w-xl">
            <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Protection:</strong> Remove personal identifiers (such as SSNs or account numbers) before uploading documents when possible. Consentia processes document text in transient session memory.
            </span>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleAnalyzeClick}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm shadow-md transition-all shrink-0 ${
              isLoading
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
