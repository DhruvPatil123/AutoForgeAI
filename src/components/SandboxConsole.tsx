import React, { useState, useEffect, useRef } from 'react';
import { TerminalLog, RepairStep, SupportedLanguage } from '../types';
import { Terminal, Shield, Play, AlertTriangle, CheckCircle, RefreshCcw, HelpCircle, AlertCircle, Cpu, HardDrive, Wifi, Plus, Trash2, Check } from 'lucide-react';

interface SandboxConsoleProps {
  language: SupportedLanguage;
  filename: string;
  isRepairMode: boolean;
  onRepairModeChange: (val: boolean) => void;
  isRunningTests: boolean;
  onStartTesting: (triggerRepairFlow: boolean) => void;
  testReport: {
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
    durationMs: number;
  } | null;
  terminalLogs: TerminalLog[];
  repairHistory: RepairStep[];
}

export default function SandboxConsole({
  language,
  filename,
  isRepairMode,
  onRepairModeChange,
  isRunningTests,
  onStartTesting,
  testReport,
  terminalLogs,
  repairHistory
}: SandboxConsoleProps) {
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // Resizable / interactive Firewall Configuration
  const [firewallActive, setFirewallActive] = useState(true);
  const [networkRules, setNetworkRules] = useState<string[]>([
    '*.googleapis.com',
    '*.github.com',
    'registry.npmjs.org'
  ]);
  const [customDomain, setCustomDomain] = useState('');

  // Simulated live container metrics (updated during test execution)
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 18, 14, 20, 15, 28, 22, 35, 20, 15, 12, 10]);
  const [memOverhead, setMemOverhead] = useState<number>(14.2);
  const [diskBytes, setDiskBytes] = useState<number>(4.2);
  const [compDuration, setCompDuration] = useState<number>(512);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Simulate metrics tick when tests are running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunningTests) {
      interval = setInterval(() => {
        const nextCpu = Math.floor(Math.random() * 45) + 35; // 35% - 80%
        setCpuUsage(nextCpu);
        setCpuHistory(prev => {
          const copy = [...prev.slice(1), nextCpu];
          return copy;
        });
        setMemOverhead(prev => {
          const delta = (Math.random() * 2) - 0.9;
          return parseFloat((Math.max(12, Math.min(24, prev + delta))).toFixed(1));
        });
        setDiskBytes(prev => parseFloat((prev + Math.random() * 0.4).toFixed(2)));
        setCompDuration(Math.floor(Math.random() * 200) + 400);
      }, 300);
    } else {
      setCpuUsage(0);
      setCpuHistory(prev => [...prev.slice(1), 0]);
    }
    return () => clearInterval(interval);
  }, [isRunningTests]);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain) return;
    if (!networkRules.includes(customDomain)) {
      setNetworkRules([...networkRules, customDomain]);
    }
    setCustomDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    setNetworkRules(networkRules.filter(r => r !== domain));
  };

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-rose-400';
      case 'warning': return 'text-amber-400';
      case 'command': return 'text-cyan-400 font-bold';
      default: return 'text-slate-300';
    }
  };

  const getRunnerCmd = () => {
    switch (language) {
      case 'typescript': return `npx vitest run src/${filename.replace('.ts', '.test.ts')}`;
      case 'javascript': return `npx jest src/${filename.replace('.js', '.test.js')}`;
      case 'python': return `python -m unittest tests/test_${filename.replace('.py', '')}.py`;
      case 'go': return 'go test -v ./...';
      case 'rust': return 'cargo test --lib';
      case 'java': return 'mvn test';
      case 'cpp': return `g++ -std=c++17 tests/test_${filename.replace('.cpp', '')}.cpp -o test_runner && ./test_runner`;
      case 'csharp': return 'dotnet test';
      case 'ruby': return 'rspec spec/';
      case 'php': return 'vendor/bin/phpunit';
      case 'swift': return 'swift test';
      case 'kotlin': return './gradlew test';
      case 'scala': return 'sbt test';
      case 'dart': return 'dart test';
      case 'shell': return 'bats tests/test_suite.bats';
      case 'sql': return 'pg_prove tests/test_schema.sql';
      case 'lua': return 'busted spec/';
      case 'perl': return 'prove -r t/';
      case 'r': return 'Rscript -e "testthat::test_local()"';
      case 'haskell': return 'stack test';
      case 'julia': return 'julia --project -e \'using Pkg; Pkg.test()\'';
      case 'elixir': return 'mix test';
      case 'clojure': return 'lein test';
      case 'fortran': return 'funit';
      case 'cobol': return 'cobc -x -o test_runner test.cob && ./test_runner';
      default: return 'npm test';
    }
  };

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-5 flex flex-col gap-4">
      
      {/* Header and Simulate Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-white font-display">Container Sandbox &amp; Metrics</h2>
        </div>

        {/* Self-repair Trigger Switch */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-lg">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              id="repair-mode-toggle"
              checked={isRepairMode}
              onChange={(e) => onRepairModeChange(e.target.checked)}
              disabled={isRunningTests}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-slate-900 peer-checked:after:border-cyan-200"></div>
            <span className="ml-2 text-[10.5px] font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className={`h-3 w-3 ${isRepairMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              Simulate Code Failure &amp; Repair
            </span>
          </label>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed m-0">
        Run tests in ephemeral Docker-based isolates. Monitor active memory bounds, CPU threads, and isolation firewall permissions in real-time.
      </p>

      {/* Control Buttons row */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <button
          type="button"
          id="run-tests-btn"
          onClick={() => onStartTesting(isRepairMode)}
          disabled={isRunningTests}
          className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-[0_2px_12px_rgba(16,185,129,0.15)]"
        >
          {isRunningTests ? (
            <>
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
              <span>Container Running tests...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Bootstrap Test Sandbox (<code>{getRunnerCmd()}</code>)</span>
            </>
          )}
        </button>

        {/* Dynamic Status Badges for Firewall and Sandbox Environment */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 px-2 py-0.5 rounded">
            <span className={`h-1.5 w-1.5 rounded-full ${isRunningTests ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`}></span>
            VM Sandbox Ready
          </span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${firewallActive ? 'text-cyan-400 bg-cyan-950/20 border-cyan-500/10' : 'text-slate-500 bg-slate-950 border-slate-900'}`}>
            <Wifi className="h-3 w-3" />
            Firewall {firewallActive ? 'Active' : 'Bypassed'}
          </span>
        </div>
      </div>

      {/* Grid of four main cards for multi-faceted view */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        
        {/* Module 1: Terminal Logs Block */}
        <div className="xl:col-span-2 bg-slate-950 border border-slate-800/80 rounded-lg p-4 font-mono text-[10px] leading-relaxed h-[270px] flex flex-col min-w-0">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 text-slate-500 uppercase tracking-widest select-none">
            <span>Terminal Sandbox - Logs output</span>
            <span className="text-[9px]">UTC: 16,000Hz</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-1 select-text">
            {terminalLogs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-slate-600 select-none min-w-[50px]">{log.timestamp}</span>
                <span className={getLogColor(log.type)}>{log.text}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Module 2: Assertions Scorecard Progress */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex flex-col h-[270px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-2 mb-3">
            Assertions Outcome
          </div>

          {testReport ? (
            <div className="flex-1 flex flex-col justify-between">
              
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-slate-850">
                  <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${testReport.failed > 0 ? 'border-rose-500 rotate-45' : 'border-emerald-500'}`} />
                  <span className="font-mono text-[10px] font-bold text-white text-center">
                    {testReport.failed > 0 ? 'Failing' : 'Passed'}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400">Total assertions:</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {testReport.passed + testReport.failed}{' '}
                    <span className="text-xs text-slate-500 font-normal">checked</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] font-mono">
                    <span className="text-emerald-400">{testReport.passed} OK</span>
                    {testReport.failed > 0 && <span className="text-rose-400">• {testReport.failed} ERR</span>}
                  </div>
                </div>
              </div>

              {/* Coverages and Durations */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Coverages statement:</span>
                  <span className={`font-mono font-semibold ${testReport.coverage >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {testReport.coverage}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${testReport.failed > 0 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all`} 
                    style={{ width: `${testReport.coverage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Compilation:</span>
                  <span>{testReport.durationMs}ms</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
              <Terminal className="h-6 w-6 text-slate-800 animate-pulse mb-2" />
              <p className="text-[11px] text-slate-500 m-0 leading-relaxed font-display">No test run recorded.</p>
              <p className="text-[10px] text-slate-600 mt-1">Boot the virtual test suite to check output metrics.</p>
            </div>
          )}
        </div>

        {/* Module 3: Live Container Metrics & Resource Diagnostics */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex flex-col h-[270px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-2 mb-3">
            VM Telemetry Meters
          </div>

          <div className="flex-1 flex flex-col justify-between text-[10px] space-y-3">
            {/* CPU usage bar */}
            <div>
              <div className="flex justify-between items-center text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-mono">
                  <Cpu className="h-3 w-3 text-cyan-400" />
                  CPU LOAD
                </span>
                <span className="font-mono text-white font-bold">{cpuUsage}%</span>
              </div>
              <div className="bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300`}
                  style={{ width: `${cpuUsage || 2}%` }}
                />
              </div>
              {/* Dynamic Sparkline Visualizer */}
              <div className="mt-1.5 bg-slate-900/60 p-1 rounded border border-slate-900 flex flex-col justify-end h-9">
                <svg className="w-full h-[26px] overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path
                    d={cpuHistory.reduce((path, val, idx) => `${path} ${idx === 0 ? 'M' : 'L'} ${(idx * (100 / (cpuHistory.length - 1)))} ${30 - (val * 0.25)}`, '')}
                    fill="none"
                    stroke="url(#cpuGrad)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* RAM capacity footprint */}
            <div>
              <div className="flex justify-between items-center text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-mono">
                  <Shield className="h-3 w-3 text-purple-400" />
                  MEM ALLOC
                </span>
                <span className="font-mono text-white font-bold">{isRunningTests ? memOverhead : 11.4} MB</span>
              </div>
              <div className="bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${((isRunningTests ? memOverhead : 11.4) / 48) * 100}%` }}
                />
              </div>
            </div>

            {/* Disk IO write buffer */}
            <div>
              <div className="flex justify-between items-center text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-mono">
                  <HardDrive className="h-3 w-3 text-amber-400" />
                  DISK WRITE
                </span>
                <span className="font-mono text-white font-bold">
                  {isRunningTests ? diskBytes : 3.12} MB
                </span>
              </div>
              <div className="bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${(((isRunningTests ? diskBytes : 3.12)) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Performance Indicators Grid */}
            <div className="pt-2 border-t border-slate-900 grid grid-cols-2 gap-2 text-slate-500 font-mono text-[9px]">
              <div>
                <span>CORES CAP:</span>
                <div className="text-white font-bold mt-0.5">0.5 vCPU</div>
              </div>
              <div>
                <span>TIMEOUT:</span>
                <div className="text-white font-bold mt-0.5">15,000ms</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Network Boundary rules sandbox allowlist settings panel */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col md:flex-row gap-4 items-stretch justify-between text-xs">
        
        <div className="space-y-1 md:max-w-md">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="firewall-toggle"
              checked={firewallActive}
              onChange={(e) => setFirewallActive(e.target.checked)}
              className="rounded border-slate-800 text-cyan-600 bg-slate-900 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
            />
            <label htmlFor="firewall-toggle" className="font-bold text-white select-none cursor-pointer flex items-center gap-1 text-[11px] font-mono tracking-tight uppercase">
              Sandbox Outbound Firewall Isolation Rule
            </label>
          </div>
          <p className="text-slate-400 text-[10px] leading-relaxed m-0 pl-6">
            When enabled, outbound third-party API dependencies will be intercepted. Only resolved domains in the allowlist below can stream HTTP requests.
          </p>
        </div>

        {/* Adding domain control */}
        <div className="flex-1 max-w-lg flex flex-col gap-2">
          {/* Active Domains badges */}
          <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
            {networkRules.map(rule => (
              <span key={rule} className="inline-flex items-center gap-1 font-mono text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                <span>{rule}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveDomain(rule)} 
                  className="text-slate-500 hover:text-rose-400 font-bold ml-0.5"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddDomain} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. *.stripe.com"
              value={customDomain}
              onChange={e => setCustomDomain(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 text-[11px] placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded text-[11px] transition-colors cursor-pointer"
            >
              Add Rule
            </button>
          </form>
        </div>

      </div>

      {/* Self-Repair loop active report blocks */}
      {repairHistory.length > 0 && (
        <div className="border-t border-slate-800/60 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertCircle className="h-4 w-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono m-0">
              Orchestrator self-healing trail audit logs
            </h3>
          </div>

          <div className="space-y-3.5">
            {repairHistory.map((step, idx) => (
              <div 
                key={idx} 
                className={`rounded-lg p-3.5 border transition-all ${
                  step.status === 'fixed'
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-rose-950/15 border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${step.status === 'fixed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        Iteration #{step.iteration} : {step.status === 'fixed' ? 'Healed' : 'Failed'}
                      </span>
                      <h4 className="text-xs font-bold font-mono text-white m-0">
                        Boundary Error: {step.failingTestName}
                      </h4>
                    </div>

                    <p className="text-[11px] font-mono text-rose-400 mt-2 bg-rose-950/30 border border-rose-950 px-2 rounded-md py-1 leading-relaxed">
                      Assert Error: {step.assertionFailure}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">REPAIR AGENT HYPOTHESIS:</span>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed m-0">{step.hypothesis}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">DRAFT REPAIR PATCH:</span>
                        <pre className="text-[9px] bg-slate-950/60 rounded border border-slate-900 p-2 text-cyan-400 overflow-x-auto select-all max-h-24 mt-1">
                          {step.patchCode}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {step.status === 'fixed' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-2 sm:mt-0 font-mono">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      REPAIR CODE INTEGRATED
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
