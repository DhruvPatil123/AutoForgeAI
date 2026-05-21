import React from 'react';
import { Bot, Terminal, Cpu, CheckCircle, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-cyan-500/30 blur-sm animate-pulse"></div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-cyan-500 text-cyan-400">
              <Bot className="h-6 w-6" id="logo-icon" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display tracking-tight text-white m-0">AutoForge AI</h1>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400 border border-cyan-500/20 font-mono tracking-widest uppercase">
                v1.0-beta
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Self-Writing & Self-Testing Autonomous Coding Platform</p>
          </div>
        </div>

        {/* Live Operational Metrics KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-x-auto py-1">
          <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-2 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Acceptance</span>
            </div>
            <div className="text-sm font-semibold font-mono text-cyan-400 mt-1">
              88.4% <span className="text-[10px] text-slate-500 font-normal">(&ge;75%)</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-2 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Test Coverage</span>
            </div>
            <div className="text-sm font-semibold font-mono text-emerald-400 mt-1">
              94.2% <span className="text-[10px] text-slate-500 font-normal">(&ge;90%)</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-2 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Avg MTTG</span>
            </div>
            <div className="text-sm font-semibold font-mono text-amber-400 mt-1">
              3.8 min <span className="text-[10px] text-slate-500 font-normal">(&lt;5m)</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-2 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Self-Repair</span>
            </div>
            <div className="text-sm font-semibold font-mono text-indigo-400 mt-1">
              91.5% <span className="text-[10px] text-slate-500 font-normal">(&ge;70%)</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
