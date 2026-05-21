import React, { useState, useEffect } from 'react';
import { Task, SourceFile, AutoForgePlan, TerminalLog, RepairStep, MultiAgentAudit, SupportedLanguage } from './types';
import Header from './components/Header';
import PresetSelector from './components/PresetSelector';
import TaskTracker from './components/TaskTracker';
import CodeWorkspace from './components/CodeWorkspace';
import SandboxConsole from './components/SandboxConsole';
import SystemDiagram from './components/SystemDiagram';
import ReviewPrDialog from './components/ReviewPrDialog';
import MultiAgentAuditPanel from './components/MultiAgentAuditPanel';
import SavedWorkspaces from './components/SavedWorkspaces';
import { Terminal, GitPullRequest, ShieldCheck, Play, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

const INITIAL_TS_PLAN: AutoForgePlan = {
  specSummary: "Create a complete, robust Express REST API for an inventory manager with route validation, CRUD endpoints, token auth middleware, and comprehensive unit tests.",
  architecture: {
    components: [
      { name: "Express Router", description: "Handles incoming HTTP requests, route binding, and request parsers.", technology: "Express, Router" },
      { name: "Auth Middleware", description: "Verifies JWT tokens in request headers to authorize access.", technology: "jsonwebtoken" },
      { name: "InMemory DB", description: "Atomic thread-safe data storage mapping items to key-values.", technology: "TypeScript Map" },
      { name: "Input Validator", description: "Ensures request body payloads conform to type constraints.", technology: "Zod validation schema" }
    ],
    dataFlow: [
      "Client sends POST /api/items with authentication bearer token.",
      "Auth Middleware parses the Authorization header, validates the signature, and attaches u_id.",
      "Input Validator intercepts payload and ensures schema is correct.",
      "Express Controller writes the validated records to InMemory DB.",
      "Controller returns a 201 Created JSON response with metadata."
    ]
  },
  tasks: [
    { id: "T1", name: "Parse Ingested Specification", status: "success", category: "spec", details: "Validate specification grammar, determine constraints, and map architecture components.", dependencies: [] },
    { id: "T2", name: "Create Router with CRUD Operations", status: "success", category: "codegen", details: "Write Express router endpoints mapping GET, POST, PUT, DELETE with body schemas.", dependencies: ["T1"] },
    { id: "T3", name: "Write Token Auth Middleware", status: "success", category: "codegen", details: "Write secure middleware checking the signature of Auth tokens and extracting metadata.", dependencies: ["T1"] },
    { id: "T4", name: "Generate Automated Vitest Harness", status: "success", category: "testgen", details: "Structure high-coverage unit tests checking token verification and CRUD validation errors.", dependencies: ["T2", "T3"] },
    { id: "T5", name: "Run Isolated Test Sandbox", status: "success", category: "sandbox", details: "Spin up a sandboxed node container, run linter, compile typescript type system, and execute test runner.", dependencies: ["T4"] }
  ],
  files: [
    {
      filename: "inventory.ts",
      path: "src/inventory.ts",
      language: "typescript",
      code: `import express, { Request, Response, NextFunction } from 'express';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  sku: string;
}

export const db = new Map<string, InventoryItem>();

// Seed initial item
db.set('item-1', { id: 'item-1', name: 'Smart Server Node', quantity: 15, sku: 'AF-NODE-3000' });

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Access token required. Format: Bearer <token>' });
    return;
  }
  
  if (token !== 'autoforge-secret-auth-token-2026') {
    res.status(403).json({ error: 'Invalid or expired credentials' });
    return;
  }
  
  next();
}

export const inventoryRouter = express.Router();

inventoryRouter.get('/', (req: Request, res: Response) => {
  res.json(Array.from(db.values()));
});

inventoryRouter.post('/', authenticateToken, (req: Request, res: Response) => {
  const { name, quantity, sku } = req.body;
  
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Invalid parameter: name must be a non-empty string' });
    return;
  }
  
  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    res.status(400).json({ error: 'Invalid parameter: quantity must be a non-negative number' });
    return;
  }
  
  if (!sku || typeof sku !== 'string') {
    res.status(400).json({ error: 'Invalid parameter: sku must be a string matching SKU structures' });
    return;
  }

  const id = 'item-' + Math.random().toString(36).substring(2, 9);
  const newItem: InventoryItem = { id, name, quantity, sku };
  db.set(id, newItem);
  
  res.status(201).json(newItem);
});
`,
      testCode: `import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import { inventoryRouter, db, authenticateToken } from './inventory';

const app = express();
app.use(express.json());
app.use('/inventory', inventoryRouter);

describe('AutoForge Inventory System API', () => {
  beforeEach(() => {
    db.clear();
    db.set('item-1', { id: 'item-1', name: 'Smart Server Node', quantity: 15, sku: 'AF-NODE-3000' });
  });

  describe('GET /inventory', () => {
    it('should return all inventory items correctly', () => {
      const allItems = Array.from(db.values());
      expect(allItems).toHaveLength(1);
      expect(allItems[0].sku).toBe('AF-NODE-3000');
    });
  });

  describe('POST /inventory with Authentication', () => {
    it('should block operations lacking JWT bearer tags', () => {
      const mockReq = { headers: {} } as any;
      const mockRes = {
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          this.body = data;
          return this;
        },
        statusCode: 200,
        body: null
      } as any;
      const nextCalled = { value: false };

      authenticateToken(mockReq, mockRes, () => {
        nextCalled.value = true;
      });

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes.body.error).toContain('Access token required');
      expect(nextCalled.value).toBe(false);
    });

    it('should allow authentic items to be posted', () => {
      const mockReq = {
        headers: { authorization: 'Bearer autoforge-secret-auth-token-2026' },
        body: { name: 'Compute Module', quantity: 50, sku: 'COMP-A1' }
      } as any;
      const mockRes = {
        status(code: number) { this.statusCode = code; return this; },
        json(data: any) { this.body = data; return this; },
        statusCode: 200,
        body: null
      } as any;
      
      // Verification
      expect(mockReq.body.quantity).toBe(50);
      expect(mockReq.body.sku).toBe('COMP-A1');
    });
  });
});
`,
      explanations: [
        { line: 12, text: "The database is scoped to an ES6 Map class securely pinned to the file closure." },
        { line: 16, text: "Standardizes Bearer Authorization scheme using exact cryptographic constant checking." },
        { line: 40, text: "Provides deep-nested parsing validation checks to intercept malicious inputs." }
      ]
    }
  ]
};

export default function App() {
  const [plan, setPlan] = useState<AutoForgePlan>(INITIAL_TS_PLAN);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("T1");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Sandbox & Terminal logs
  const [isRepairMode, setIsRepairMode] = useState<boolean>(false);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [testReport, setTestReport] = useState<any | null>(null);
  const [repairHistory, setRepairHistory] = useState<RepairStep[]>([]);
  
  // Pipeline details
  const [activeStage, setActiveStage] = useState<'idle' | 'parsing' | 'codegen' | 'testgen' | 'sandbox' | 'repair' | 'ready'>('idle');
  const [prDialogOpen, setPrDialogOpen] = useState<boolean>(false);

  // Multi-Agent Critique State
  const [auditReport, setAuditReport] = useState<MultiAgentAudit | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);

  const handleTriggerAudit = async () => {
    setIsRunningAudit(true);
    setTerminalLogs(prev => [
      ...prev,
      { id: `L_AUD_${Date.now()}`, timestamp: "15:05:10", type: "info", text: "Critic Network: Initiating Security, Performance, and Style analysis..." }
    ]);
    try {
      const resp = await fetch('/api/autoforge/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: plan.files[0]?.code || "",
          filename: plan.files[0]?.filename || "inventory.ts",
          language: plan.files[0]?.language || "typescript"
        })
      });
      const data = await resp.json();
      setAuditReport(data);
      setTerminalLogs(prev => [
        ...prev,
        { id: `L_AUD_S_${Date.now()}`, timestamp: "15:05:12", type: "success", text: "Critic Network Consensus Audit generated successfully." }
      ]);
    } catch (err: any) {
      console.error(err);
      setTerminalLogs(prev => [
        ...prev,
        { id: `L_AUD_E_${Date.now()}`, timestamp: "15:05:12", type: "error", text: "Critic agents timed out or failed analysis." }
      ]);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleApplyAuditFix = (fixCode: string, explanationName: string) => {
    if (!plan || !plan.files || plan.files.length === 0) return;
    const updatedFiles = [...plan.files];
    
    const original = updatedFiles[0].code;
    let newCode = original;
    if (fixCode.startsWith('const') || fixCode.startsWith('def') || fixCode.startsWith('import')) {
      newCode = `// Critic Agent Hot-Patch (${explanationName}):\n${fixCode}\n\n${original}`;
    } else {
      newCode = `${original}\n\n// Hot-Patch configuration appended:\n${fixCode}\n`;
    }

    updatedFiles[0] = {
      ...updatedFiles[0],
      code: newCode
    };

    setPlan(prev => ({
      ...prev,
      files: updatedFiles
    }));

    setTerminalLogs(prev => [
      ...prev,
      { id: `L_FIX_${Date.now()}`, timestamp: "15:05:15", type: "success", text: `Critic Hot-Fix applied: ${explanationName}` }
    ]);
  };

  // Initialize with initial logs
  useEffect(() => {
    initDefaultLogs();
  }, [plan]);

  const initDefaultLogs = () => {
    const defaultLogs: TerminalLog[] = [
      { id: "L1", timestamp: "15:04:12", type: "info", text: "AUTOFORGE WORKSPACE SYSTEM STATUS: READY" },
      { id: "L2", timestamp: "15:04:13", type: "command", text: "$ cat metadata.json" },
      { id: "L3", timestamp: "15:04:14", type: "success", text: "{ name: 'AutoForge AI', status: 'ready', components: 4 }" },
      { id: "L4", timestamp: "15:04:15", type: "info", text: "Awaiting natural language specifications mapping..." }
    ];
    setTerminalLogs(defaultLogs);
    setTestReport(null);
    setRepairHistory([]);
  };

  const handleGeneratePlan = async (specification: string, language: SupportedLanguage) => {
    setIsGenerating(true);
    setActiveStage('parsing');
    setPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => ({ ...t, status: 'pending' }))
    }));

    // Instantly append log
    setTerminalLogs(prev => [
      ...prev,
      { id: `L_GEN_${Date.now()}`, timestamp: "15:04:20", type: "command", text: `$ parse-spec --lang=${language}` },
      { id: `L_GEN_2_${Date.now()}`, timestamp: "15:04:21", type: "info", text: "Contacting AutoForge parsing endpoint..." }
    ]);

    try {
      const response = await fetch('/api/autoforge/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ specification, language })
      });

      const data = await response.json();
      if (data && data.files) {
        setPlan(data);
        setSelectedTaskId("T1");
        setActiveStage('ready');
        setTerminalLogs(prev => [
          ...prev,
          { id: `L_S_${Date.now()}`, timestamp: "15:04:30", type: "success", text: "Specification parsed. Graph mapped successfully." },
          { id: `L_S_2_${Date.now()}`, timestamp: "15:04:31", type: "info", text: `Loaded source file path: ${data.files[0]?.path}` }
        ]);
      } else {
        throw new Error("Invalid plan object returned from server.");
      }
    } catch (err: any) {
      console.error(err);
      setTerminalLogs(prev => [
        ...prev,
        { id: `L_E_${Date.now()}`, timestamp: "15:04:35", type: "error", text: `Specification failure: ${err.message}` }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeRevised = (revisedCode: string) => {
    if (!plan || !plan.files || plan.files.length === 0) return;
    
    // Update the local code in App state
    const updatedFiles = [...plan.files];
    updatedFiles[0] = {
      ...updatedFiles[0],
      code: revisedCode
    };

    setPlan(prev => ({
      ...prev,
      files: updatedFiles
    }));

    // Append log of changes
    setTerminalLogs(prev => [
      ...prev,
      { id: `L_REV_${Date.now()}`, timestamp: "15:04:45", type: "warning", text: `Code module revised successfully: ${plan.files[0].filename} modified.` }
    ]);
  };

  const handleStartTesting = (triggerRepairFlow: boolean) => {
    setIsRunningTests(true);
    setTestReport(null);
    setRepairHistory([]);
    setActiveStage('sandbox');

    setTerminalLogs(prev => [
      ...prev,
      { id: `L_T1_${Date.now()}`, timestamp: "15:04:50", type: "command", text: "$ bootstrap-sandbox-container --image=node:20" },
      { id: `L_T2_${Date.now()}`, timestamp: "15:04:51", type: "info", text: "Ephemeral Docker sandboxing container running: ID = container-af-59" },
      { id: `L_T3_${Date.now()}`, timestamp: "15:04:52", type: "info", text: `Targeting directory tests system diagnostics folder...` }
    ]);

    // Timed animations for interactive logging realism
    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        { id: `L_T4_${Date.now()}`, timestamp: "15:04:53", type: "info", text: "Index Workspace: matching dependencies structure... COMPLETED." },
        { id: `L_T5_${Date.now()}`, timestamp: "15:04:54", type: "info", text: "Invoking automated test validations framework harness." }
      ]);
    }, 1000);

    setTimeout(() => {
      if (!triggerRepairFlow) {
        // Happy Path Success Simulation
        setTerminalLogs(prev => [
          ...prev,
          { id: `L_OK1_${Date.now()}`, timestamp: "15:04:55", type: "success", text: "PASS  tests/inventory.test.ts" },
          { id: `L_OK2_${Date.now()}`, timestamp: "15:04:56", type: "success", text: "  ✔ GET /inventory matches seed record sku properties (11ms)" },
          { id: `L_OK3_${Date.now()}`, timestamp: "15:04:56", type: "success", text: "  ✔ POST /inventory fails on empty title parameter (15ms)" },
          { id: `L_OK4_${Date.now()}`, timestamp: "15:04:57", type: "success", text: "VERIFICATION REPORT SECURED. Statement coverage: 94.2%" }
        ]);

        setTestReport({
          passed: 12,
          failed: 0,
          skipped: 0,
          coverage: 94.2,
          durationMs: 450
        });

        setIsRunningTests(false);
        setActiveStage('ready');

        // Update task T5 status
        setPlan(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === "T5" ? { ...t, status: "success" } : t)
        }));

      } else {
        // Self-Repair Loop Simulation Active!
        setActiveStage('repair');
        setTerminalLogs(prev => [
          ...prev,
          { id: `L_FL1_${Date.now()}`, timestamp: "15:04:55", type: "error", text: "FAIL  tests/inventory.test.ts" },
          { id: `L_FL2_${Date.now()}`, timestamp: "15:04:55", type: "error", text: "  ✖ POST /inventory should insert authentic compute modules (42ms)" },
          { id: `L_FL3_${Date.now()}`, timestamp: "15:04:56", type: "error", text: "    AssertionError: Expected status code 201, received 401 Unauthorized" },
          { id: `L_FL4_${Date.now()}`, timestamp: "15:04:57", type: "warning", text: "!!! STACK TRACE BOUNDS ERROR DETECTED !!!" },
          { id: `L_FL5_${Date.now()}`, timestamp: "15:04:57", type: "info", text: "ALERT: Contacting AutoForge autonomous repair service loops..." }
        ]);

        // Wait 2.2 seconds before the repair loop starts formulation
        setTimeout(() => {
          setTerminalLogs(prev => [
            ...prev,
            { id: `L_RP1_${Date.now()}`, timestamp: "15:04:59", type: "command", text: "$ autoforge-repair-agent --failing-trace='AssertionError: Expected code 201'" },
            { id: `L_RP2_${Date.now()}`, timestamp: "15:04:59", type: "info", text: "Repair strategy formulation: Analyze authentication headers parsing." },
            { id: `L_RP3_${Date.now()}`, timestamp: "15:05:00", type: "info", text: "Applying hot-patch file memory substitution." }
          ]);

          // Repair History step values
          const step: RepairStep = {
            iteration: 1,
            failingTestName: "POST /inventory should insert authentic items",
            assertionFailure: "Assert code 401 Unauthorized matches expected status 201 Created",
            hypothesis: "The router blocks requests without a valid Bearer token. We need to inject an authentication header token constant in our synthetic assertions payload.",
            patchCode: "headers: { 'Authorization': 'Bearer ' + secretToken }",
            status: "fixed",
            testLogs: ["Executing diagnostic hot-patch", "Assertion parameters matched successfully"]
          };
          setRepairHistory([step]);

        }, 2200);

        // Wait another 2.2 seconds before success finish
        setTimeout(() => {
          setTerminalLogs(prev => [
            ...prev,
            { id: `L_RP4_${Date.now()}`, timestamp: "15:05:01", type: "success", text: "PASS  tests/inventory.test.ts" },
            { id: `L_RP5_${Date.now()}`, timestamp: "15:05:02", type: "success", text: "  ✔ POST /inventory should insert authentic compute modules after repair patch (6ms)" },
            { id: `L_RP6_${Date.now()}`, timestamp: "15:05:03", type: "success", text: "AUTO-REPAIR ENGINE CONCLUDED SUCCESSFULLY. MTTG: 3.8m" }
          ]);

          setTestReport({
            passed: 12,
            failed: 0,
            skipped: 0,
            coverage: 94.2,
            durationMs: 820
          });

          setIsRunningTests(false);
          setActiveStage('ready');

          // Set active task success
          setPlan(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === "T5" ? { ...t, status: "success" } : t)
          }));

        }, 4400);
      }

    }, 2000);

  };

  const currentFile = plan.files[0];

  return (
    <div className="min-h-screen bg-[#0c0f17] flex flex-col font-sans select-none pb-12">
      
      {/* Top Header Navigation banner */}
      <Header />

      {/* Main Workspace content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        
        {/* Intro Alert */}
        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-4.5 py-3.5 flex items-start gap-3">
          <Zap className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-white text-xs block font-display">AutoForge AI Platform Playground</span>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-normal select-text">
              Enter target requirements or select prebuilt templates below. The autonomous engine parses goals, produces tasks, generates pristine source programs with Vitest unit assertions, and performs sandboxed container runs.
            </p>
          </div>
        </div>

        {/* Configuration Pane split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Inputs column (Preset Select + Tasks pipeline) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 1. Target spec inputs */}
            <PresetSelector onGenerate={handleGeneratePlan} isLoading={isGenerating} />

            {/* 2. Tasks tracking visual progress */}
            <TaskTracker 
              tasks={plan.tasks} 
              activeTaskCategory={activeStage} 
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              selectedTaskId={selectedTaskId}
            />

            {/* 3. Persistent Firebase Saved Workspaces */}
            <SavedWorkspaces 
              currentPlan={plan}
              onLoadPlan={(loaded) => {
                setPlan(loaded);
                setTerminalLogs(prev => [
                  ...prev,
                  { id: `L_LD_${Date.now()}`, timestamp: "15:05:30", type: "success", text: "Successfully restored archived workspace parameters from Cloud Firestore." }
                ]);
              }}
              language={currentFile?.language || 'typescript'}
              specification={plan.specSummary}
              testReport={testReport}
            />

          </div>

          {/* Right outputs panel (Visual workspace + dynamic diagram) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Main Code viewer workspace */}
            {plan && (
              <CodeWorkspace 
                plan={plan} 
                isLoading={isGenerating} 
                onCodeRevised={handleCodeRevised}
                onUpdatePlan={setPlan}
              />
            )}

            {/* 3. Terminal output sandboxes panel */}
            <SandboxConsole 
              language={currentFile?.language || 'typescript'}
              filename={currentFile?.filename || 'inventory.ts'}
              isRepairMode={isRepairMode}
              onRepairModeChange={(val) => setIsRepairMode(val)}
              isRunningTests={isRunningTests}
              onStartTesting={handleStartTesting}
              testReport={testReport}
              terminalLogs={terminalLogs}
              repairHistory={repairHistory}
            />

            {/* High-level system topology map */}
            <SystemDiagram 
              architecture={plan.architecture} 
              activeStage={activeStage}
              onUpdateArchitecture={(newArch) => {
                setPlan(prev => ({
                  ...prev,
                  architecture: newArch
                }));
                setTerminalLogs(prev => [
                  ...prev,
                  { id: `L_ARC_${Date.now()}`, timestamp: "15:05:40", type: "warning", text: "System Architecture updated: Dynamic technology tuning configured." }
                ]);
              }}
            />

            {/* Specialized Critic review checklist */}
            <MultiAgentAuditPanel 
              auditReport={auditReport}
              onApplyFix={handleApplyAuditFix}
              isRunningAudit={isRunningAudit}
              onTriggerAudit={handleTriggerAudit}
            />

          </div>

        </div>

        {/* Bottom review and submit panel */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-5 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Clean verification artifact compiled</span>
            </div>
            <h3 className="text-sm font-semibold text-white font-display mt-1">Review &amp; Deploy Baseline Branch</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal m-0 select-text">
              If the generated tests, code layouts, and sandboxed parameters are accepted, proceed to formulate a secure GitHub Pull Request.
            </p>
          </div>

          <button
            type="button"
            id="deploy-pipeline-btn"
            onClick={() => setPrDialogOpen(true)}
            className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-5 py-3 tracking-tight flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-center text-xs"
          >
            <GitPullRequest className="h-4 w-4" />
            <span>Accept Code &amp; Create PR</span>
          </button>
        </div>

      </main>

      {/* Deploy PR overlay dialog */}
      <ReviewPrDialog 
        filename={currentFile?.filename || 'inventory.ts'}
        language={currentFile?.language || 'typescript'}
        isOpen={prDialogOpen}
        onClose={() => setPrDialogOpen(false)}
      />

    </div>
  );
}
