import React, { useState } from 'react';
import { GitPullRequest, GitBranch, ShieldCheck, GitMerge, Check, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';

interface ReviewPrDialogProps {
  filename: string;
  language: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewPrDialog({ filename, language, isOpen, onClose }: ReviewPrDialogProps) {
  const [prStatus, setPrStatus] = useState<'open' | 'merging' | 'merged'>('open');

  if (!isOpen) return null;

  const handleMergePr = () => {
    setPrStatus('merging');
    setTimeout(() => {
      setPrStatus('merged');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-101 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950/60 p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-semibold text-white font-display">AutoForge Deploy Pipeline</span>
          </div>
          <button 
            type="button" 
            id="close-pr-dialog-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            &#10006; Close
          </button>
        </div>

        {/* PR Main Core Details */}
        <div className="p-5 flex flex-col gap-4">
          
          {/* Metadata Grid */}
          <div className="bg-slate-950/40 rounded-lg p-3.5 border border-slate-800/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono">Title:</span>
              <span className="text-slate-200 font-semibold font-display">Feat: Ingest core spec modules to {filename}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono">Repository:</span>
              <span className="text-slate-200 truncate select-all">github.com/autoforge-ai/prod-sandbox</span>
            </div>

            {/* Branches view */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/60 text-[10.5px]">
              <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono text-slate-400">
                <GitBranch className="h-3 w-3" />
                <span>main</span>
              </div>
              <ArrowRight className="h-3 w-3 text-slate-600" />
              <div className="flex items-center gap-1 bg-purple-950/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">
                <GitBranch className="h-3 w-3" />
                <span>autoforge/spec-parsing-92c</span>
              </div>
            </div>
          </div>

          {/* Core Checkmarks Checklist */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2.5">
              Automated Verification Status Checks
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2 bg-emerald-950/10 border border-emerald-500/10 rounded-md text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Continuous Integration Suite: PASSED</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    Compiled successfully inside sandboxed container. 100% assertions satisfied.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-emerald-950/10 border border-emerald-500/10 rounded-md text-xs text-slate-300">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Security Analysis Sweep: CLEAN</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    No dependency vulnerabilities or un-sanitized API keys detected in files.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Git Tree representation */}
          <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800/60 font-mono text-[10px] text-slate-400">
            <span className="text-slate-500 uppercase tracking-widest block mb-2.5 text-[9px]">Simulated Git Commit Tree</span>
            <div className="relative pl-5 space-y-2.5">
              <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-slate-800"></div>
              
              <div className="flex items-center gap-2 relative">
                <div className="absolute -left-[13px] h-2 w-2 rounded-full bg-slate-700 ring-4 ring-slate-950"></div>
                <span>commit d03fca0 (upstream master branch trunk tracking baseline)</span>
              </div>

              <div className="flex items-center gap-2 relative text-purple-400 font-semibold">
                <div className="absolute -left-[13px] h-2 w-2 rounded-full bg-purple-500 ring-4 ring-slate-950 animate-pulse"></div>
                <span>commit e28c9b2 (AutoForge spec code revision generation complete)</span>
              </div>

              <div className="flex items-center gap-2 relative">
                <div className="absolute -left-[13px] h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-slate-950"></div>
                <span>commit b41cf89 (Unit tests validations matching code variables integrated)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Controls Footer */}
        <div className="bg-slate-950/60 px-5 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          
          {prStatus === 'open' && (
            <>
              <p className="text-slate-400 leading-relaxed max-w-sm m-0">
                Proceeding will merge the verified changes into your baseline trunk branch and clear ephemeral container instances.
              </p>
              <button
                type="button"
                id="merge-pull-request-btn"
                onClick={handleMergePr}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 flex items-center gap-2 font-semibold font-display shadow-[0_4px_15px_rgba(147,51,234,0.3)] transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
              >
                <GitMerge className="h-4 w-4" />
                <span>Merge Pull Request</span>
              </button>
            </>
          )}

          {prStatus === 'merging' && (
            <div className="w-full flex items-center justify-center gap-2 text-cyan-400 py-2.5 font-mono">
              <div className="h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Formulating branch merge commit and updating production logs...</span>
            </div>
          )}

          {prStatus === 'merged' && (
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 bg-emerald-950/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-400">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0" />
                <span className="font-semibold font-display text-xs">SPECIFICATION SECURELY MERGED TO PRODUCTION</span>
              </div>
              <button
                type="button"
                id="pr-dialog-finish-btn"
                onClick={onClose}
                className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded font-semibold text-xs hover:bg-emerald-400 cursor-pointer"
              >
                Start New Project
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
