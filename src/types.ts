export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  category: 'spec' | 'codegen' | 'testgen' | 'sandbox' | 'repair' | 'review';
  details: string;
  dependencies: string[];
}

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'scala'
  | 'dart'
  | 'shell'
  | 'sql'
  | 'lua'
  | 'perl'
  | 'r'
  | 'haskell'
  | 'julia'
  | 'elixir'
  | 'clojure'
  | 'fortran'
  | 'cobol';

export interface SourceFile {
  filename: string;
  path: string;
  code: string;
  testCode: string;
  language: SupportedLanguage;
  explanations: { line: number; text: string }[];
}

export interface SystemArchitecture {
  components: { name: string; description: string; technology: string }[];
  dataFlow: string[];
}

export interface AutoForgePlan {
  specSummary: string;
  architecture: SystemArchitecture;
  tasks: Task[];
  files: SourceFile[];
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
  text: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface RepairStep {
  iteration: number;
  failingTestName: string;
  assertionFailure: string;
  hypothesis: string;
  patchCode: string;
  status: 'failed' | 'fixed';
  testLogs: string[];
}

export interface Presets {
  title: string;
  description: string;
  specification: string;
  language: SupportedLanguage;
}

// Multi-Agent Audit Critic Types
export interface SecurityAlert {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  text: string;
  fixSuggestion: string;
}

export interface PerformanceRecom {
  id: string;
  complexity: string; // e.g. "O(N^2) to O(N)"
  beforeCode: string;
  afterCode: string;
  text: string;
}

export interface StyleIssue {
  id: string;
  text: string;
  line: number;
  expectedFormat: string;
}

export interface MultiAgentAudit {
  securityAlerts: SecurityAlert[];
  performance: PerformanceRecom[];
  style: StyleIssue[];
}

// Container Telemetry & Resource Diagnostics Types
export interface ContainerMetrics {
  cpu: number[];
  memory: number[];
  diskWrite: number;
  compilationMs: number;
  networkAllowed: string[];
}
