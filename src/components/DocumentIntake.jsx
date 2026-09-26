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
    <section className="w-full space-y-6" aria-label="Healthcare Document Intake Section">
      
      {/* Intro Heading & Context */}
      <div className="bg-paper-50 p-6 rounded-2xl border border-paper-300/60 shadow-xs space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-clay-500" aria-hidden="true" />
          Healthcare Document Intake
        </h2>
        <p id="intake-instructions" className="text-sm text-slate-800 leading-relaxed max-w-3xl">
          Paste or upload the text of your medical consent form, insurance denial letter, hospital bill, or financial waiver below. Consentia will translate the complex legalese into clear, comforting plain English and highlight important rights and potential risk areas.
        </p>
      </div>

      {/* Preset Scenarios for Quick Testing */}
      {samples.length > 0 && (
        <div className="bg-paper-50/70 p-4 rounded-xl border border-paper-300/50 space-y-3" role="region" aria-label="Sample Documents">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sage-600" aria-hidden="true" /> Synthetic Sample Scenarios (1-Click Load)
            </span>
            <span className="text-xs text-slate-700 font-sans">Click any example to inspect live</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                aria-label={`Load sample document: ${sample.title}`}
                onClick={() => {
                  setText(sample.text);
                  if (inputError) setInputError('');
                }}
                className="text-left p-3 rounded-lg border border-paper-300/80 bg-paper-50 hover:bg-clay-50 hover:border-clay-500/40 focus:ring-2 focus:ring-clay-500 transition-all group"
              >
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-clay-700 bg-clay-100 px-2 py-0.5 rounded mb-1">
                  {sample.category}
                </span>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-clay-700 line-clamp-1">
                  {sample.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Error / Low-Confidence Banner */}
      {(inputError || isLowConfidence) && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1 text-xs text-amber-950 flex items-start gap-2.5" role="alert" aria-live="assertive">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
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
          <label htmlFor="document-text-intake" className="text-xs font-semibold text-slate-800 bg-paper-100 px-2.5 py-1 rounded-md border border-paper-300/60 cursor-pointer">
            Primary Intake: Plain Text Paste
            {wordCount > 0 && (
              <span className="ml-2 text-xs text-slate-700 font-mono">
                ({wordCount} words, {charCount} chars)
              </span>
            )}
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteClipboard}
              aria-label="Paste document text from clipboard"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-800 bg-paper-100 hover:bg-paper-200 focus:ring-2 focus:ring-clay-500 border border-paper-300/60 transition-all"
            >
              <Clipboard className="w-3.5 h-3.5 text-clay-600" aria-hidden="true" /> Paste Clipboard
            </button>

            <label htmlFor="file-upload-input" className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-800 bg-paper-100 hover:bg-paper-200 focus:ring-2 focus:ring-clay-500 border border-paper-300/60 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-sage-600" aria-hidden="true" /> Upload File (.txt)
              <input id="file-upload-input" type="file" accept=".txt,.md,.doc,.docx" onChange={handleFileUpload} aria-label="Upload document file" className="hidden" />
            </label>

            {currentText && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  setInputError('');
                }}
                aria-label="Clear document text"
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <textarea
          id="document-text-intake"
          aria-describedby="intake-instructions"
          aria-label="Medical document text input"
          value={currentText}
          onChange={handleTextChange}
          placeholder="Paste your medical consent form, insurance denial letter, hospital bill, or financial waiver text here... 

For live demo entry, you can paste fresh unformatted text, or click any sample scenario above."
          rows={12}
          className="w-full bg-paper-50 text-slate-900 text-sm leading-relaxed p-4 rounded-xl border border-paper-300 focus:outline-2 focus:outline-clay-600 focus:ring-2 focus:ring-clay-500/40 placeholder-slate-500 font-sans resize-y transition-all"
        />

        {/* Bottom Privacy & Submission Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-start gap-2 text-xs text-slate-700 max-w-xl">
            <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="text-slate-900">Privacy Protection:</strong> Remove personal identifiers (such as SSNs or account numbers) before uploading documents when possible. Consentia processes document text in transient session memory.
            </span>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleAnalyzeClick}
            aria-label="Analyze document with GenAI"
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm shadow-md transition-all shrink-0 focus:ring-2 focus:ring-clay-600 ${
              isLoading
                ? 'bg-paper-300 text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-clay-500 text-paper-50 hover:bg-clay-600 hover:shadow-lg hover:shadow-clay-500/20 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-paper-50 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Analyzing Document with GenAI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Analyze Document & Translate
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
