import React, { useState } from 'react';
import { Presets, SupportedLanguage } from '../types';
import { BookOpen, Code, Terminal, Github, HelpCircle, Layers, FileCode } from 'lucide-react';

const ALL_LANGUAGES: { value: SupportedLanguage; label: string; badge: string }[] = [
  { value: 'typescript', label: 'TypeScript (Node.js)', badge: 'TS/Node' },
  { value: 'javascript', label: 'JavaScript (Node.js)', badge: 'JS/Node' },
  { value: 'python', label: 'Python (v3)', badge: 'Python' },
  { value: 'go', label: 'Go (Golang)', badge: 'Go' },
  { value: 'rust', label: 'Rust (Cargo)', badge: 'Rust' },
  { value: 'java', label: 'Java (JDK)', badge: 'Java' },
  { value: 'cpp', label: 'C++ (Clang/GCC)', badge: 'C++' },
  { value: 'csharp', label: 'C# (.NET Core)', badge: 'C#' },
  { value: 'ruby', label: 'Ruby (Gems)', badge: 'Ruby' },
  { value: 'php', label: 'PHP (Composer)', badge: 'PHP' },
  { value: 'swift', label: 'Swift (SPM)', badge: 'Swift' },
  { value: 'kotlin', label: 'Kotlin (Gradle)', badge: 'Kotlin' },
  { value: 'scala', label: 'Scala (Sbt)', badge: 'Scala' },
  { value: 'dart', label: 'Dart (Pub)', badge: 'Dart' },
  { value: 'shell', label: 'Shell (Bash)', badge: 'Bash' },
  { value: 'sql', label: 'SQL (Postgres/MySQL)', badge: 'SQL' },
  { value: 'lua', label: 'Lua (Script)', badge: 'Lua' },
  { value: 'perl', label: 'Perl (CPAN)', badge: 'Perl' },
  { value: 'r', label: 'R (testthat)', badge: 'R' },
  { value: 'haskell', label: 'Haskell (HSpec)', badge: 'Haskell' },
  { value: 'julia', label: 'Julia (Test)', badge: 'Julia' },
  { value: 'elixir', label: 'Elixir (ExUnit)', badge: 'Elixir' },
  { value: 'clojure', label: 'Clojure (clojure.test)', badge: 'Clojure' },
  { value: 'fortran', label: 'Fortran (FUnit)', badge: 'Fortran' },
  { value: 'cobol', label: 'Cobol (Cobopt)', badge: 'Cobol' }
];

const PRESETS: Presets[] = [
  {
    title: 'TypeScript Express API',
    description: 'CRUD Inventory Hub with Bearer Auth & request parsing rules.',
    language: 'typescript',
    specification: 'Build an elegant Express REST API for an inventory manager. Include JWT token check middleware, local cached database state mapping fields, error validations with zod-like properties, and multiple Vitest units mocking payloads.'
  },
  {
    title: 'Python Streaming CSV Parser',
    description: 'Metrics consolidator with schema checking & null guards.',
    language: 'python',
    specification: 'Create a Python CSV parsing service using stream buffers. Validate headers, compute statistical averages across rows, intercept corrupt inputs with customized error logging, and include a unittest suite covering anomalies.'
  },
  {
    title: 'Rust Overflow-Safe Fibonacci',
    description: 'Calculations using checked operations & vector cache table.',
    language: 'rust',
    specification: 'Write a Rust core engine that generates Fibonacci terms safely. Cache sequences inside dynamic Vec buffers, use checked additions to prevent u64 overflows, and add test cases affirming maximum u64 limits.'
  },
  {
    title: 'Go Registrations Validator',
    description: 'Email pattern auditing & localized registration checking.',
    language: 'go',
    specification: 'Create a Go registration verification package. Check email regular expression patterns, password minimum boundaries, format an aggregated ValidationError slice, and include parallel unit tests for complete coverage.'
  }
];

interface PresetSelectorProps {
  onGenerate: (spec: string, lang: SupportedLanguage) => void;
  isLoading: boolean;
}

export default function PresetSelector({ onGenerate, isLoading }: PresetSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customSpec, setCustomSpec] = useState<string>(PRESETS[0].specification);
  const [customLang, setCustomLang] = useState<SupportedLanguage>('typescript');
  const [ticketUrl, setTicketUrl] = useState<string>('');
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'importing' | 'success'>('idle');

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setCustomSpec(PRESETS[idx].specification);
    setCustomLang(PRESETS[idx].language);
  };

  const handleImportTicket = () => {
    if (!ticketUrl) return;
    setTicketStatus('importing');
    
    // Simulate parsing ticket details
    setTimeout(() => {
      setTicketStatus('success');
      let ticketSpec = '';
      if (ticketUrl.includes('101')) {
        ticketSpec = 'FIX BUG: Resolves item quantity bounds processing exception. The billing pipeline crashes on quantities exceeding 1000 items. Introduce safe clamp constraints and boundary checks in product validation routers.';
        setCustomLang('typescript');
      } else {
        ticketSpec = `FEATURE REQ FROM LINEAR: Ingest stock reports and calculate localized currency margins. Target input structures are JSON payload records. Expected behavior: format averages, check blank pricing fields, and verify against standard mocks.`;
        setCustomLang('python');
      }
      setCustomSpec(ticketSpec);
    }, 1200);
  };

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-5 flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-white font-display">1. Target Specification</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Orchestrator Ready</span>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            id={`preset-btn-${idx}`}
            onClick={() => handleSelectPreset(idx)}
            className={`text-left rounded-lg p-3 border transition-all flex flex-col justify-between h-28 ${
              selectedPreset === idx
                ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)] text-white'
                : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60 text-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-xs font-display tracking-tight leading-4 line-clamp-1">
                  {preset.title}
                </span>
                <span className="uppercase text-[9px] font-mono font-bold tracking-wider rounded-md border border-slate-700 px-1 bg-slate-900/60 block py-0.5">
                  {preset.language}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Ticket Importer Panel */}
      <div className="border-t border-slate-800/80 pt-4">
        <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">
          Import from Jira / Linear / GitHub Issue
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              id="ticket-import-input"
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              placeholder="e.g. https://github.com/autoforge/issues/101"
              className="w-full bg-slate-950/60 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-800 focus:border-cyan-500 focus:outline-none font-mono text-slate-200"
            />
          </div>
          <button
            type="button"
            id="ticket-import-btn"
            onClick={handleImportTicket}
            disabled={ticketStatus === 'importing'}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white px-3 py-2 font-medium tracking-tight border border-slate-700 disabled:opacity-50 transition-colors"
          >
            {ticketStatus === 'importing' ? 'Reading...' : 'Import'}
          </button>
        </div>
        {ticketStatus === 'success' && (
          <div className="mt-2 text-[10px] font-mono text-cyan-400 bg-cyan-950/10 border border-cyan-500/20 rounded px-2.5 py-1 flex items-center gap-1.5">
            <span>&#10003;</span> Ingested Linear Issue properties successfully.
          </div>
        )}
      </div>

      {/* Editor & Core Configurations */}
      <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3.5">
        <div>
          <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">
            Target Language and Environment ({ALL_LANGUAGES.length} Languages)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] text-slate-500 mb-1.5 font-mono uppercase tracking-wider">Quick Select Preset:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['typescript', 'python', 'go', 'rust'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    id={`lang-btn-${lang}`}
                    onClick={() => setCustomLang(lang)}
                    className={`rounded-lg py-1.5 text-center font-mono font-medium transition-all capitalize border ${
                      customLang === lang
                        ? 'bg-slate-100 text-slate-950 border-white font-bold'
                        : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {lang === 'typescript' ? 'TS/Node' : lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[10px] text-slate-500 mb-1.5 font-mono uppercase tracking-wider">All Supported Languages:</span>
              <select
                id="all-languages-select"
                value={customLang}
                onChange={(e) => setCustomLang(e.target.value as SupportedLanguage)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-mono transition-all cursor-pointer h-9"
              >
                {ALL_LANGUAGES.map((langSpec) => (
                  <option key={langSpec.value} value={langSpec.value} className="bg-slate-950 text-slate-200">
                    {langSpec.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 font-mono mt-1.5 leading-normal">
                Active Compiler Engine: <span className="text-cyan-400 font-bold capitalize">{customLang}</span>
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">
            Specification Details (Full Natural Language)
          </label>
          <textarea
            id="spec-textarea"
            rows={5}
            value={customSpec}
            onChange={(e) => setCustomSpec(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            placeholder="Describe your module requirements..."
          />
        </div>

        {/* Generate Trigger Button */}
        <button
          type="button"
          id="generate-forge-btn"
          onClick={() => onGenerate(customSpec, customLang)}
          disabled={isLoading || !customSpec.trim()}
          className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 px-4 focus:outline-none transition-all duration-200 tracking-tight flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.25)] disabled:opacity-50 text-sm cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Instructing AutoForge Agent Hub...</span>
            </>
          ) : (
            <>
              <Code className="h-4 w-4 stroke-[2.5]" />
              <span>Forge Code & Automated Tests</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
