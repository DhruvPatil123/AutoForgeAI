import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Scissors, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Check, MessageSquare } from 'lucide-react';
import { SecurityAlert, PerformanceRecom, StyleIssue, MultiAgentAudit } from '../types';

interface MultiAgentAuditPanelProps {
  auditReport: MultiAgentAudit | null;
  onApplyFix: (fixCode: string, explanationName: string) => void;
  isRunningAudit: boolean;
  onTriggerAudit: () => void;
}

export default function MultiAgentAuditPanel({
  auditReport,
  onApplyFix,
  isRunningAudit,
  onTriggerAudit
}: MultiAgentAuditPanelProps) {
  const [activeTab, setActiveTab ] = useState<'security' | 'performance' | 'style' | 'debate'>('security');
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});
  const [debateMessages, setDebateMessages] = useState<any[]>([]);

  const handleApplyFixLocal = (id: string, codeToApply: string, description: string) => {
    onApplyFix(codeToApply, description);
    setAppliedFixes(prev => ({ ...prev, [id]: true }));
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Generate simulated multi-agent debate logs dynamically when auditReport changes
  useEffect(() => {
    if (auditReport) {
      const messages = [
        {
          agent: '🔒 Security Guardian',
          color: 'text-purple-400 border-purple-500/20 bg-purple-950/10',
          text: `Initiating code branch security analysis scan. I've audited security standards. I flagged ${auditReport.securityAlerts.length} vulnerabilities. Specifically ${auditReport.securityAlerts[0]?.title || 'safe authentication structure validation border margins'}.`
        },
        {
          agent: '⚡ Performance Architect',
          color: 'text-amber-400 border-amber-500/20 bg-amber-950/10',
          text: `Linear search thresholds scanned. Recommended ${auditReport.performance.length || 1} optimization parameters. The baseline is structured, but we can decrease lookup complexity down to ${auditReport.performance[0]?.complexity || 'O(1) using preallocated closure indexing'}.`
        },
        {
          agent: '🎨 Style Inspector',
          color: 'text-blue-400 border-blue-500/20 bg-blue-950/10',
          text: `Style standards and module export formatting parsed successfully. I flagged ${auditReport.style.length} minor import indentations. Applying automatic lint fixes will ensure absolute code hygiene.`
        },
        {
          agent: '🤖 Consensus Coordinator',
          color: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/10',
          text: `Agencies aligned. Consolidating security metrics, performance hotspots, and format checks onto active action blocks card list. Baseline audit report branch compiled and ready!`
        }
      ];
      setDebateMessages(messages);
      setActiveTab('security');
    } else {
      setDebateMessages([
        {
          agent: '🤖 Multi-Agent Critic Network',
          color: 'text-slate-400 border-slate-800 bg-slate-950/50',
          text: 'Individual critic agents (Security, Performance, Style) are standing by inside the sandbox VM. Trigger the audit review below to compile discussion metrics and auto-patch proposals.'
        }
      ]);
    }
  }, [auditReport]);

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-5 flex flex-col gap-4">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white font-display">Multi-Agent Review &amp; Critic Panel</h2>
        </div>
        <button
          type="button"
          onClick={onTriggerAudit}
          disabled={isRunningAudit}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-[11px] font-display px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 shadow-[0_2px_10px_rgba(147,51,234,0.2)]"
        >
          {isRunningAudit ? (
            <>
              <div className="h-3 w-3 border border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Auditing...</span>
            </>
          ) : (
            <span>Run Parallel Agent Audit</span>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed m-0">
        Specialized critic agents run concurrent lint sweeps to inspect security loopholes, algorithmic performance hot-spots, and format style standards.
      </p>

      {/* Tabs navigation */}
      <div className="flex flex-wrap border-b border-slate-800/80 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 border-b-2 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'security' ? 'border-purple-500 text-purple-400 font-bold bg-purple-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Security Inspector ({auditReport?.securityAlerts.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 border-b-2 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'performance' ? 'border-amber-500 text-amber-400 font-bold bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Performance Optimizer ({auditReport?.performance.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 border-b-2 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'style' ? 'border-blue-500 text-blue-400 font-bold bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scissors className="h-4 w-4" />
          <span>Style Standards ({auditReport?.style.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('debate')}
          className={`px-4 py-2 border-b-2 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'debate' ? 'border-cyan-500 text-cyan-400 font-bold bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Agent Debate Stream ({debateMessages.length})</span>
        </button>
      </div>

      {/* Main tab content */}
      <div className="min-h-[160px] flex flex-col justify-between">
        {auditReport || activeTab === 'debate' ? (
          <div>
            {/* Security Audit cards */}
            {activeTab === 'security' && auditReport && (
              <div className="space-y-3">
                {auditReport.securityAlerts.length > 0 ? (
                  auditReport.securityAlerts.map((alert) => (
                    <div key={alert.id} className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-all hover:bg-slate-950/80">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-white font-display">{alert.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed mt-1 select-text">{alert.text}</p>
                        
                        {/* Quick fix suggestion box */}
                        {alert.fixSuggestion && (
                          <div className="bg-slate-900 border border-slate-800/60 rounded p-2 mt-2 font-mono text-[10px] text-purple-400 max-h-24 overflow-y-auto whitespace-pre select-all">
                            {alert.fixSuggestion}
                          </div>
                        )}
                      </div>

                      {alert.fixSuggestion && (
                        <button
                          type="button"
                          id={`apply-sec-fix-${alert.id}`}
                          disabled={appliedFixes[alert.id]}
                          onClick={() => handleApplyFixLocal(alert.id, alert.fixSuggestion, alert.title)}
                          className="self-end sm:self-start shrink-0 text-[10px] font-mono font-semibold bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/20 text-purple-400 hover:text-purple-300 rounded px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                        >
                          {appliedFixes[alert.id] ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span>Hot-Fix Applied</span>
                            </>
                          ) : (
                            <>
                              <span>Apply Hot-Fix</span>
                              <ChevronRight className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto opacity-70 mb-2" />
                    <p className="text-xs text-slate-400 m-0 font-display">No security alerting items found. Good validation bounds.</p>
                  </div>
                )}
              </div>
            )}

            {/* Performance Optimizations */}
            {activeTab === 'performance' && auditReport && (
              <div className="space-y-3">
                {auditReport.performance.length > 0 ? (
                  auditReport.performance.map((perf) => (
                    <div key={perf.id} className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 flex flex-col gap-3 transition-all hover:bg-slate-950/80">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-950/20 border border-amber-500/10 px-1.5 py-0.5 rounded">
                          {perf.complexity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Optimized Block</span>
                      </div>
                      
                      <p className="text-[11px] text-slate-300 leading-normal m-0 select-text">{perf.text}</p>

                      {/* Before / After comparative diff visualizers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="bg-red-950/10 border border-red-500/15 p-2 rounded max-h-32 overflow-y-auto select-all">
                          <div className="text-[9px] text-red-500 font-semibold mb-1 uppercase tracking-wider select-none">Before Configuration</div>
                          <div className="text-slate-400 whitespace-pre">{perf.beforeCode}</div>
                        </div>
                        <div className="bg-emerald-950/10 border border-emerald-500/15 p-2 rounded max-h-32 overflow-y-auto select-all">
                          <div className="text-[9px] text-emerald-400 font-semibold mb-1 uppercase tracking-wider select-none">Proposed Hot-Patch</div>
                          <div className="text-slate-300 whitespace-pre">{perf.afterCode}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        id={`apply-perf-fix-${perf.id}`}
                        disabled={appliedFixes[perf.id]}
                        onClick={() => handleApplyFixLocal(perf.id, perf.afterCode, `Optimize bounds for Complexity`)}
                        className="self-end text-[10px] font-mono font-semibold bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/20 text-amber-400 hover:text-amber-300 rounded px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap w-fit"
                      >
                        {appliedFixes[perf.id] ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Optimized Structure Patched</span>
                          </>
                        ) : (
                          <>
                            <span>Inject Optimized Structure</span>
                            <ArrowRight className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto opacity-70 mb-2" />
                    <p className="text-xs text-slate-400 m-0 font-display">No high-complexity algorithmic structures identified.</p>
                  </div>
                )}
              </div>
            )}

            {/* Style Standards Issues */}
            {activeTab === 'style' && auditReport && (
              <div className="space-y-3">
                {auditReport.style.length > 0 ? (
                  auditReport.style.map((issue) => (
                    <div key={issue.id} className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:bg-slate-950/80">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-blue-400 font-semibold bg-blue-950/20 border border-blue-500/10 px-1.5 py-0.5 rounded">
                            Line {issue.line}
                          </span>
                          <span className="text-slate-300 select-text leading-relaxed text-[11px]">{issue.text}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono italic mt-1">
                          Expected format: <span className="text-slate-300 font-normal select-all">{issue.expectedFormat}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        id={`apply-style-fix-${issue.id}`}
                        disabled={appliedFixes[issue.id]}
                        onClick={() => handleApplyFixLocal(issue.id, issue.expectedFormat, `Style update: Lint alignment`)}
                        className="self-end sm:self-center shrink-0 text-[10px] font-mono font-semibold bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/20 text-blue-400 hover:text-blue-300 rounded px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                      >
                        {appliedFixes[issue.id] ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Style Formatted</span>
                          </>
                        ) : (
                          <span>Re-Format</span>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto opacity-70 mb-2" />
                    <p className="text-xs text-slate-400 m-0 font-display">Imports and variables obey standard styling constraints.</p>
                  </div>
                )}
              </div>
            )}

            {/* Agent Debating Chat Stream layout */}
            {activeTab === 'debate' && (
              <div className="space-y-3">
                <div className="border border-slate-800/60 rounded-xl bg-slate-950/40 p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-2 mb-2 select-none uppercase tracking-wider">
                    <span>Active Consensus Agency Thread</span>
                    <span className="text-cyan-400">Status: Listening</span>
                  </div>

                  {debateMessages.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-lg border leading-relaxed select-text ${msg.color}`}>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1 select-none">
                        {msg.agent}
                      </div>
                      <p className="text-slate-200 text-xs m-0 leading-relaxed font-sans font-medium">
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 select-none bg-slate-950/30 rounded-lg border border-slate-900 flex flex-col items-center justify-center">
            {isRunningAudit ? (
              <div className="space-y-2">
                <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400 font-mono">Consensus model is scanning the codebase tree...</p>
              </div>
            ) : (
              <>
                <ShieldCheck className="h-8 w-8 text-slate-700 animate-pulse mb-2" />
                <p className="text-xs text-slate-500 m-0 font-display">No critique generated yet.</p>
                <p className="text-[10px] text-slate-600 mt-1">Click the button above to run parallel audit review passes.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
