import React, { useState, useRef, useEffect } from 'react';
import { AutoForgePlan, SourceFile, SupportedLanguage } from '../types';
import { 
  FileCode, Shield, Check, MessageSquare, CornerDownLeft, Sparkles, 
  Eye, RefreshCw, Folder, File, Plus, Trash2, Download, 
  ChevronRight, ChevronDown, CheckSquare, Edit, Save, FileText, Info
} from 'lucide-react';
import JSZip from 'jszip';

interface CodeWorkspaceProps {
  plan: AutoForgePlan;
  isLoading: boolean;
  onCodeRevised: (revisedCode: string) => void;
  onUpdatePlan: (updatedPlan: AutoForgePlan) => void;
}

export default function CodeWorkspace({ plan, isLoading, onCodeRevised, onUpdatePlan }: CodeWorkspaceProps) {
  // Navigation & Tree management
  const [activeVirtualPath, setActiveVirtualPath] = useState<string>('');
  const [isSrcOpen, setIsSrcOpen] = useState(true);
  const [isTestsOpen, setIsTestsOpen] = useState(true);
  
  // Custom editing states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [isSavedFlash, setIsSavedFlash] = useState(false);

  // Chat/History Revision Stream
  const [chatInput, setChatInput] = useState<string>('');
  const [isRevising, setIsRevising] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'agent'; text: string }[]>([]);
  const codeEndRef = useRef<HTMLDivElement>(null);

  // File Creation Popup state
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  // Primary file representation (from plan.files[0])
  const primaryFile = plan.files[0];
  const primaryLanguage = primaryFile?.language || 'typescript';

  // Extract base names
  const baseName = primaryFile?.filename.split('.')[0] || 'service';
  const extension = primaryFile?.filename.split('.').pop() || 'ts';

  // Construct standard items
  const mainPath = primaryFile?.path || `src/${baseName}.${extension}`;
  const testPath = `tests/${baseName}.test.${extension}`;

  // Track active file path
  useEffect(() => {
    if (!activeVirtualPath && mainPath) {
      setActiveVirtualPath(mainPath);
    }
  }, [mainPath]);

  // Set chat history guidelines on load
  useEffect(() => {
    setChatHistory([
      { 
        sender: 'agent', 
        text: `Welcome to your AutoForge IDE. I've populated the core multi-module project workspace files. Click any file in the workspace explorer to read, edit, or adjust directly below!` 
      }
    ]);
  }, [primaryFile?.filename]);

  // Read current active file text representation
  const getActiveFileProperties = () => {
    if (activeVirtualPath === mainPath) {
      return {
        path: mainPath,
        code: primaryFile?.code || '',
        isReadOnly: false,
        isMarkdown: false,
        isJson: false,
        language: primaryLanguage,
        explanations: primaryFile?.explanations || []
      };
    } else if (activeVirtualPath === testPath) {
      return {
        path: testPath,
        code: primaryFile?.testCode || '',
        isReadOnly: false,
        isMarkdown: false,
        isJson: false,
        language: primaryLanguage,
        explanations: []
      };
    } else if (activeVirtualPath === 'README.md') {
      return {
        path: 'README.md',
        code: generateReadmeMD(),
        isReadOnly: true,
        isMarkdown: true,
        isJson: false,
        language: 'markdown' as SupportedLanguage,
        explanations: []
      };
    } else if (activeVirtualPath === 'autoforge.json') {
      return {
        path: 'autoforge.json',
        code: JSON.stringify({
          specSummary: plan.specSummary,
          primaryLanguage: primaryLanguage,
          fileCount: plan.files.length + 3,
          components: plan.architecture?.components || []
        }, null, 2),
        isReadOnly: true,
        isMarkdown: false,
        isJson: true,
        language: 'json' as SupportedLanguage,
        explanations: []
      };
    } else {
      // Find inside user created file list (indexes > 0 in plan.files)
      const userFile = plan.files.find(f => f.path === activeVirtualPath);
      if (userFile) {
        return {
          path: userFile.path,
          code: userFile.code,
          isReadOnly: false,
          isMarkdown: userFile.path.endsWith('.md'),
          isJson: userFile.path.endsWith('.json'),
          language: userFile.language,
          explanations: userFile.explanations || []
        };
      }
    }

    return {
      path: mainPath,
      code: primaryFile?.code || '',
      isReadOnly: false,
      isMarkdown: false,
      isJson: false,
      language: primaryLanguage,
      explanations: []
    };
  };

  const activeProp = getActiveFileProperties();

  // Keep editText state updated when file shifts or edit mode triggers
  useEffect(() => {
    setEditText(activeProp.code);
  }, [activeVirtualPath, activeProp.code, isEditMode]);

  // Build high fidelity dynamic README explaining user specification
  function generateReadmeMD() {
    return `# ${plan.specSummary || 'AutoForge Project Baseline'}\n
Generated autonomously with dynamic architecture specifications tracking.

## Technical Setup Info
- **Target Language**: \`${primaryLanguage}\`
- **Primary Source File**: \`/${mainPath}\`
- **Verification Harness**: \`/${testPath}\`

## Code Highlights & Architecture
The generated components utilize state-of-the-art parameters validators, robust memory stores, and modular design.
${(plan.architecture?.components || []).map(comp => `\n### 🛡️ ${comp.name}\n- **Specs**: \`${comp.technology}\`\n- **Function**: ${comp.description}`).join('')}

## Local Command Execution Commands
Install dependencies and trigger the isolated unit test suites:
\`\`\`bash
# Install NPM modules
npm install

# Invoke testing assertions
npm run test
\`\`\`
\n`;
  }

  // Handle direct file edits
  const handleSaveDirectCode = () => {
    if (!plan || !plan.files || plan.files.length === 0) return;

    if (activeVirtualPath === mainPath) {
      const updatedFiles = [...plan.files];
      updatedFiles[0] = { ...updatedFiles[0], code: editText };
      onUpdatePlan({ ...plan, files: updatedFiles });
    } else if (activeVirtualPath === testPath) {
      const updatedFiles = [...plan.files];
      updatedFiles[0] = { ...updatedFiles[0], testCode: editText };
      onUpdatePlan({ ...plan, files: updatedFiles });
    } else {
      const updatedFiles = plan.files.map(f => {
        if (f.path === activeVirtualPath) {
          return { ...f, code: editText };
        }
        return f;
      });
      onUpdatePlan({ ...plan, files: updatedFiles });
    }

    setIsSavedFlash(true);
    setTimeout(() => {
      setIsSavedFlash(false);
    }, 2000);

    setChatHistory(prev => [...prev, {
      sender: 'agent',
      text: `Direct modifications compiled successfully onto '${activeVirtualPath}'. Code refreshed inside operational sandbox container.`
    }]);
  };

  // Dynamic file creations
  const handleCreateCustomFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;

    const normalizedPath = newFilePath.trim().replaceAll('\\', '/');
    const parts = normalizedPath.split('/');
    const filename = parts[parts.length - 1];

    const currentExt = filename.split('.').pop() || 'ts';
    let newLang: SupportedLanguage = primaryLanguage;
    if (['py'].includes(currentExt)) newLang = 'python';
    if (['go'].includes(currentExt)) newLang = 'go';
    if (['rs'].includes(currentExt)) newLang = 'rust';
    if (['js'].includes(currentExt)) newLang = 'javascript';

    // Formulate SourceFile blueprint
    const newFileObj: SourceFile = {
      filename,
      path: normalizedPath,
      code: newFileContent || `// ${filename} Custom Utility Module\n\nexport function helper() {\n  return "operational";\n}\n`,
      testCode: '',
      language: newLang,
      explanations: []
    };

    onUpdatePlan({
      ...plan,
      files: [...plan.files, newFileObj]
    });

    setActiveVirtualPath(normalizedPath);
    setNewFilePath('');
    setNewFileContent('');
    setShowAddFileModal(false);

    setChatHistory(prev => [...prev, {
      sender: 'agent',
      text: `Created new user file module: \`/${normalizedPath}\`. You can edit this custom code block freely.`
    }]);
  };

  // Delete dynamic user files safely
  const handleDeleteCustomFile = (pathToDelete: string) => {
    if (pathToDelete === mainPath || pathToDelete === testPath) return;

    const filtered = plan.files.filter(f => f.path !== pathToDelete);
    onUpdatePlan({
      ...plan,
      files: filtered
    });

    setActiveVirtualPath(mainPath);
    setChatHistory(prev => [...prev, {
      sender: 'agent',
      text: `Removed virtual workspace file: '/${pathToDelete}'. Restored active visual editor focus to primary source block.`
    }]);
  };

  // ZIP Bundle Project Builder exporter
  const handleDownloadZipPackage = async () => {
    try {
      const zip = new JSZip();

      // Core file structures
      zip.file(mainPath, primaryFile.code);
      zip.file(testPath, primaryFile.testCode);
      zip.file('README.md', generateReadmeMD());
      zip.file('autoforge.json', JSON.stringify({
        specSummary: plan.specSummary,
        primaryLanguage: primaryLanguage,
        createdAt: new Date().toISOString()
      }, null, 2));

      // User created files compilation
      plan.files.slice(1).forEach(userFile => {
        zip.file(userFile.path, userFile.code);
      });

      const folderName = baseName.toLowerCase();
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `autoforge_baseline_${folderName}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

      setChatHistory(prev => [...prev, {
        sender: 'agent',
        text: `Export Complete! Packed complete directory assets as 'autoforge_baseline_${folderName}.zip' successfully.`
      }]);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Simulated Syntax Highlighting function
  const highlightCodeLine = (lineText: string, lang: string) => {
    if (!lineText.trim()) return <span className="text-slate-650">&nbsp;</span>;
    if (lineText.trim().startsWith('//') || lineText.trim().startsWith('#')) {
      return <span className="text-slate-500 italic">{lineText}</span>;
    }

    const keywords = [
      'import', 'from', 'export', 'const', 'let', 'function', 'return', 'interface', 
      'def', 'class', 'import', 'from', 'as', 'try', 'except', 'raise', 'if', 'else', 
      'pub', 'struct', 'impl', 'fn', 'match', 'use', 'mod', 'package', 'type', 'var'
    ];

    const words = lineText.split(/(\s+|,|\.|\(|\)|\{|\}|\[|\]|;|:|=|\+|-|\*|\/)/);
    return (
      <span>
        {words.map((w, idx) => {
          if (keywords.includes(w.trim())) {
            return <span key={idx} className="text-sky-400 font-semibold">{w}</span>;
          }
          if (w.trim().startsWith('"') || w.trim().startsWith("'") || w.trim().endsWith('"') || w.trim().endsWith("'")) {
            return <span key={idx} className="text-amber-300">{w}</span>;
          }
          if (w.trim() === 'true' || w.trim() === 'false' || (!isNaN(Number(w.trim())) && w.trim() !== '')) {
            return <span key={idx} className="text-emerald-400">{w}</span>;
          }
          return <span key={idx} className="text-slate-200">{w}</span>;
        })}
      </span>
    );
  };

  // Robust Markdown visual formatter for rendered READMEs
  const renderFormattedMarkdown = (markdownText: string) => {
    const rawLines = markdownText.split('\n');
    return (
      <div className="p-6 font-sans text-slate-300 space-y-4 max-w-2xl mx-auto leading-relaxed select-text">
        {rawLines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-2xl font-bold font-display text-white border-b border-slate-800 pb-2 mb-4 tracking-tight">{line.replace('# ', '')}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-lg font-semibold font-display text-cyan-400 mt-6 mb-2">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-sm font-bold font-display text-purple-400 mt-4 mb-1">{line.replace('### ', '')}</h3>;
          }

          // Lists
          if (line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-purple-500 mt-1.5 shrink-0 select-none">•</span>
                <p className="m-0 text-xs text-slate-300">{line.replace('- ', '')}</p>
              </div>
            );
          }

          // Multiline comments or code blocks toggle
          if (line.startsWith('```')) {
            return null; // Strip raw flags out neatly
          }

          // Code command rows
          if (line.startsWith('# ') && idx > 2) {
            return <div key={idx} className="font-mono text-[10.5px] bg-slate-950 p-2 border border-slate-900 rounded text-sky-400">{line}</div>;
          }

          // Paragraphs
          return <p key={idx} className="text-xs leading-relaxed text-slate-300 m-0">{line}</p>;
        })}
      </div>
    );
  };

  // Process revision chat input through backend proxy
  const handleSendChatRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isRevising) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsRevising(true);

    try {
      const response = await fetch('/api/autoforge/chat-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeVirtualPath === testPath ? primaryFile.testCode : activeProp.code,
          filename: activeVirtualPath === testPath ? `${baseName}.test.${extension}` : activeVirtualPath.split('/').pop(),
          language: activeProp.language,
          chatMessage: userMsg
        })
      });

      const data = await response.json();
      if (data.revisedCode) {
        onCodeRevised(data.revisedCode);
        
        // Dynamically path-update code based on what active selection was
        if (activeVirtualPath === mainPath) {
          const updatedFiles = [...plan.files];
          updatedFiles[0] = { ...updatedFiles[0], code: data.revisedCode };
          onUpdatePlan({ ...plan, files: updatedFiles });
        } else if (activeVirtualPath === testPath) {
          const updatedFiles = [...plan.files];
          updatedFiles[0] = { ...updatedFiles[0], testCode: data.revisedCode };
          onUpdatePlan({ ...plan, files: updatedFiles });
        } else {
          // Update custom user additions
          const updatedFiles = plan.files.map(f => {
            if (f.path === activeVirtualPath) {
              return { ...f, code: data.revisedCode };
            }
            return f;
          });
          onUpdatePlan({ ...plan, files: updatedFiles });
        }

        setChatHistory(prev => [...prev, { 
          sender: 'agent', 
          text: `Revision complete! Implemented prompt optimizations across '${activeVirtualPath}'.`
        }]);
      } else {
        throw new Error(data.error || 'Revision execution failed.');
      }
    } catch (err: any) {
      setChatHistory(prev => [...prev, { 
        sender: 'agent', 
        text: `Error updating codebase: ${err.message || 'Processing fallback.'}`
      }]);
    } finally {
      setIsRevising(false);
    }
  };

  const codeLines = activeProp.code ? activeProp.code.split('\n') : [];

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col h-[700px]">
      
      {/* Top action header */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
        
        {/* Workspace Title metadata info */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 border border-slate-800 text-cyan-400">
            <FileCode className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            AutoForge Virtual Workspace IDE
          </span>
          <span className="text-[9px] font-mono rounded bg-purple-950/30 border border-purple-500/20 px-1.5 py-0.5 text-purple-400 capitalize">
            {primaryLanguage} environment
          </span>
        </div>

        {/* Global Downloader zip trigger */}
        <button
          type="button"
          onClick={handleDownloadZipPackage}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer self-start sm:self-center"
          title="Export everything as modular offline zip"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span>Download Zip Package</span>
        </button>

      </div>

      {/* Main visual pane: Explorer + Editor + Assistant stream */}
      <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 min-h-0">
        
        {/* PANE 1: Directory Tree Sidebar */}
        <div className="w-full lg:w-56 bg-slate-950/80 flex flex-col h-[180px] lg:h-full select-none">
          
          <div className="px-3.5 py-3 border-b border-slate-900 flex items-center justify-between text-slate-500 uppercase tracking-widest text-[10px] font-bold">
            <span>Workspace Files</span>
            <button
              type="button"
              onClick={() => setShowAddFileModal(true)}
              className="text-cyan-400 hover:text-cyan-300 p-0.5 rounded hover:bg-slate-900 transition-colors cursor-pointer"
              title="Create custom file"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
            
            {/* Dynamic visual folders */}
            
            {/* Folder 1: src directory */}
            <div>
              <button
                type="button"
                onClick={() => setIsSrcOpen(!isSrcOpen)}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-colors text-xs text-left cursor-pointer font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5 text-amber-400 fill-amber-400/10" />
                  <span>src</span>
                </div>
                {isSrcOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {isSrcOpen && (
                <div className="pl-4 mt-0.5 space-y-0.5">
                  {/* Primary Code file */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVirtualPath(mainPath);
                      setIsEditMode(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-[11px] font-mono text-left transition-all ${
                      activeVirtualPath === mainPath
                        ? 'bg-slate-800 text-white font-semibold shadow-sm border-l-2 border-cyan-400 pl-2'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <FileCode className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{primaryFile?.filename || 'service.ts'}</span>
                    </div>
                  </button>

                  {/* Supplemental custom created files matching 'src/' */}
                  {plan.files.slice(1).filter(f => f.path.startsWith('src/')).map(f => (
                    <div key={f.path} className="group/file flex items-center justify-between pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVirtualPath(f.path);
                          setIsEditMode(false);
                        }}
                        className={`flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono text-left transition-all ${
                          activeVirtualPath === f.path
                            ? 'bg-slate-800 text-white font-semibold shadow-sm border-l-2 border-purple-400 pl-2'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <File className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{f.filename}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomFile(f.path)}
                        className="opacity-0 group-hover/file:opacity-100 hover:text-rose-400 p-0.5 text-slate-600 transition-opacity shrink-0 cursor-pointer"
                        title="Delete custom file"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Folder 2: tests directory */}
            <div>
              <button
                type="button"
                onClick={() => setIsTestsOpen(!isTestsOpen)}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-colors text-xs text-left cursor-pointer font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/10" />
                  <span>tests</span>
                </div>
                {isTestsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {isTestsOpen && (
                <div className="pl-4 mt-0.5 space-y-0.5">
                  {/* Primary unit test */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVirtualPath(testPath);
                      setIsEditMode(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-[11px] font-mono text-left transition-all ${
                      activeVirtualPath === testPath
                        ? 'bg-slate-800 text-white font-semibold shadow-sm border-l-2 border-emerald-400 pl-2'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{baseName}.test.{extension}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Root Documentation Files */}
            <div className="space-y-0.5">
              <div className="px-2 text-[9px] font-semibold text-slate-600 tracking-wider uppercase mb-1">
                Root Files
              </div>

              {/* README.md */}
              <button
                type="button"
                onClick={() => {
                  setActiveVirtualPath('README.md');
                  setIsEditMode(false);
                }}
                className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11.5px] text-left transition-all ${
                  activeVirtualPath === 'README.md'
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-teal-400" />
                <span>README.md</span>
              </button>

              {/* autoforge.json */}
              <button
                type="button"
                onClick={() => {
                  setActiveVirtualPath('autoforge.json');
                  setIsEditMode(false);
                }}
                className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11.5px] text-left transition-all ${
                  activeVirtualPath === 'autoforge.json'
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                <span>autoforge.json</span>
              </button>

              {/* Custom root files */}
              {plan.files.slice(1).filter(f => !f.path.includes('/')).map(f => (
                <div key={f.path} className="group/file flex items-center justify-between pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVirtualPath(f.path);
                      setIsEditMode(false);
                    }}
                    className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono text-left transition-all ${
                      activeVirtualPath === f.path
                        ? 'bg-slate-800 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <File className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{f.filename}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomFile(f.path)}
                    className="opacity-0 group-hover/file:opacity-100 hover:text-rose-400 p-0.5 text-slate-600 transition-opacity shrink-0 cursor-pointer"
                    title="Delete custom file"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* PANE 2: Visual Code Viewer & Markdown Layout */}
        <div className="flex-1 overflow-auto bg-slate-950/25 relative flex flex-col min-h-[350px] lg:min-h-0">
          
          {/* Editor Mode Control Subheader */}
          <div className="bg-slate-950/40 border-b border-slate-900 px-4 py-2 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10.5px]">
              <span className="font-semibold text-white">/{activeVirtualPath}</span>
              <span>&bull;</span>
              <span>{codeLines.length} lines</span>
            </div>

            {/* Edit Toggles */}
            {!activeProp.isReadOnly && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10.5px] transition-all cursor-pointer border ${
                    isEditMode 
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {isEditMode ? (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Inspector Mode</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-3 w-3" />
                      <span>Direct Editor</span>
                    </>
                  )}
                </button>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleSaveDirectCode}
                    className="flex items-center gap-1 bg-emerald-500 text-slate-950 font-semibold px-2.5 py-1 rounded text-[10.5px] hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    <Save className="h-3 w-3" />
                    <span>{isSavedFlash ? 'Code Saved!' : 'Apply Patch'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Loader */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-slate-300 z-20 gap-3 select-none">
              <RefreshCw className="h-7 w-7 text-cyan-500 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-xs tracking-tight text-white mb-0.5">Synthesizing Workspace Sandbox</p>
                <p className="text-[10px] text-slate-500 font-sans">Triggering automated compiler typechecks...</p>
              </div>
            </div>
          )}

          {/* Main workspace frame content view */}
          <div className="flex-1 overflow-auto min-h-0">
            {activeProp.isMarkdown ? (
              // Enhanced visual rendered Markdown layout
              renderFormattedMarkdown(activeProp.code)
            ) : isEditMode ? (
              // Full interactive direct code-mirror simulator text area
              <div className="flex h-full min-h-[300px] font-mono text-[11px] text-slate-300">
                {/* Visual Line Numbers gutter */}
                <div className="bg-slate-950/50 p-4 border-r border-slate-900 select-none text-right text-slate-600 font-mono pr-3.5 min-w-[32px] font-semibold">
                  {codeLines.map((_, i) => (
                    <div key={i} className="h-5">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 bg-transparent p-4 outline-none font-mono text-[11px] leading-5 resize-none h-full text-slate-100 select-text"
                  spellCheck="false"
                  placeholder="// Customize or extend code modules..."
                />
              </div>
            ) : (
              // Inspector viewer template with annotations support
              <div className="p-4 flex font-mono text-[11px] leading-relaxed select-text font-medium">
                {/* Visual line gutter */}
                <div className="text-slate-600 text-right select-none pr-4 border-r border-slate-900 font-mono min-w-[28px] font-bold">
                  {codeLines.map((_, idx) => (
                    <div key={idx} className="h-5">{idx + 1}</div>
                  ))}
                </div>

                {/* Simulated Highlighted view */}
                <div className="pl-4 overflow-x-auto w-full select-text whitespace-pre">
                  {codeLines.map((line, idx) => (
                    <div key={idx} className="h-5 flex items-center hover:bg-slate-800/20 transition-colors">
                      {highlightCodeLine(line, activeProp.language)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* PANE 3: Assistant chatbot drawer sidebar */}
        <div className="w-full lg:w-80 bg-slate-950/40 flex flex-col h-[300px] lg:h-full min-w-0">
          
          <div className="bg-slate-950/60 px-4 py-2.5 border-b border-slate-800/80 flex items-center gap-1.5 select-none shrink-0">
            <Sparkles className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-semibold text-white font-display m-0">AI Action Patch Stream</h3>
          </div>

          {/* Core code explanations panel */}
          {activeVirtualPath === mainPath && activeProp.explanations && activeProp.explanations.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 select-none shrink-0">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">AI Annotations Insights</div>
              <div className="flex flex-col gap-2">
                {activeProp.explanations.map((exp, i) => (
                  <div key={i} className="text-[10px] bg-slate-950/70 rounded-md p-2 border border-slate-900 flex gap-2">
                    <span className="font-mono text-cyan-400 font-bold bg-slate-900 border border-slate-800 px-1 rounded h-fit">
                      L{exp.line}
                    </span>
                    <p className="text-slate-300 leading-relaxed m-0 select-text font-sans">{exp.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Agent Chat log */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 font-medium">
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[90%] ${
                  msg.sender === 'user' 
                    ? 'self-end bg-cyan-950/40 border border-cyan-500/20 text-slate-100' 
                    : 'self-start bg-slate-900/60 border border-slate-800/80 text-slate-300'
                } rounded-lg p-3 text-[10.5px] leading-relaxed`}
              >
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 font-bold">
                  {msg.sender === 'user' ? 'Developer' : 'Sandbox Agent'}
                </span>
                <p className="m-0 select-text font-sans">{msg.text}</p>
              </div>
            ))}
            {isRevising && (
              <div className="self-start bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 text-[10.5px] max-w-[90%] flex items-center gap-2 select-none">
                <RefreshCw className="h-3 w-3 text-cyan-500 animate-spin" />
                <span className="text-slate-400 font-sans">Consensus model injecting revisions...</span>
              </div>
            )}
            <div ref={codeEndRef} />
          </div>

          {/* Revision patch feedback form */}
          <form onSubmit={handleSendChatRevision} className="p-3 border-t border-slate-850 bg-slate-950/60 flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              id="revision-workspace-chat"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isRevising || isLoading}
              placeholder="e.g. Add an endpoint to fetch system time..."
              className="flex-1 bg-slate-900 text-[11px] rounded-lg border border-slate-800 px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isRevising || isLoading}
              className="h-8 w-8 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>

      </div>

      {/* CREATE FILE POPUP DRAWER/MODAL */}
      {showAddFileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <form 
            onSubmit={handleCreateCustomFile} 
            className="bg-slate-900 border border-slate-850 rounded-xl p-5 w-full max-w-sm flex flex-col gap-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-white uppercase tracking-wider text-[10px] text-cyan-400 font-mono">Create Virtual Workspace File</span>
              <button 
                type="button" 
                onClick={() => setShowAddFileModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[9px] font-bold">File Path:</label>
              <input
                type="text"
                required
                placeholder="e.g. src/auth_helper.ts"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[9px] font-bold">Initial Context code:</label>
              <textarea
                rows={4}
                placeholder="Write custom code blueprint..."
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-105 font-mono text-[10px] resize-none focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddFileModal(false)}
                className="bg-slate-950 hover:bg-slate-905 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Create File
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
