import React, { useState } from 'react';
import { SystemArchitecture } from '../types';
import { Cpu, Server, ShieldCheck, Zap, Database, ArrowRight, HelpCircle, Edit2, Trash2, Plus, Check, X } from 'lucide-react';

interface SystemDiagramProps {
  architecture: SystemArchitecture | null;
  activeStage: 'idle' | 'parsing' | 'codegen' | 'testgen' | 'sandbox' | 'repair' | 'ready';
  onUpdateArchitecture: (newArch: SystemArchitecture) => void;
}

export default function SystemDiagram({ architecture, activeStage, onUpdateArchitecture }: SystemDiagramProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTech, setEditTech] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTech, setNewTech] = useState('');

  const getStageHighlight = (stage: string) => {
    switch (activeStage) {
      case 'parsing': return stage === 'spec' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400' : 'opacity-40';
      case 'codegen': return stage === 'codegen' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400' : 'opacity-40';
      case 'testgen': return stage === 'testgen' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'opacity-40';
      case 'sandbox': return stage === 'sandbox' ? 'border-amber-500 bg-amber-950/20 text-amber-400' : 'opacity-40';
      case 'repair': return stage === 'repair' ? 'border-rose-500 bg-rose-950/35 text-rose-400' : 'opacity-40';
      case 'ready': return 'border-emerald-500/40 text-slate-100';
      default: return 'border-slate-800 text-slate-400';
    }
  };

  const startEdit = (idx: number) => {
    if (!architecture) return;
    const comp = architecture.components[idx];
    setEditingIndex(idx);
    setEditName(comp.name);
    setEditDesc(comp.description);
    setEditTech(comp.technology);
  };

  const saveEdit = () => {
    if (!architecture || editingIndex === null) return;
    const updatedComponents = [...architecture.components];
    updatedComponents[editingIndex] = {
      name: editName,
      description: editDesc,
      technology: editTech
    };
    onUpdateArchitecture({
      ...architecture,
      components: updatedComponents
    });
    setEditingIndex(null);
  };

  const deleteComponent = (idx: number) => {
    if (!architecture) return;
    const updatedComponents = architecture.components.filter((_, i) => i !== idx);
    onUpdateArchitecture({
      ...architecture,
      components: updatedComponents
    });
    if (editingIndex === idx) setEditingIndex(null);
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!architecture || !newName || !newDesc || !newTech) return;
    const newComponents = [
      ...architecture.components,
      { name: newName, description: newDesc, technology: newTech }
    ];
    onUpdateArchitecture({
      ...architecture,
      components: newComponents
    });
    setNewName('');
    setNewDesc('');
    setNewTech('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-5 flex flex-col gap-4">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-white font-display">System Architecture Studio</h2>
        </div>
        {architecture && (
          <button
            type="button"
            id="add-custom-component-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Component</span>
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed m-0">
        Trace and edit your solution architecture. Click any component below to tune target definitions, database storage models, or technology specs.
      </p>

      {/* Visual Telemetry Flow maps */}
      <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 pt-3 border-b border-slate-900 pb-3">
        
        {/* Unit 1: Ingest Spec Parser */}
        <div className={`p-3 rounded-lg border text-center transition-all ${getStageHighlight('spec')}`}>
          <Cpu className="h-5 w-5 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold tracking-tight uppercase font-mono">1. Spec Parser</div>
          <p className="text-[9px] text-slate-400 mt-1 leading-normal line-clamp-2">Converts spec to structured task tree</p>
        </div>

        <ArrowRight className="h-5 w-5 text-slate-800 mx-auto rotate-90 md:rotate-0 hidden sm:block" />

        {/* Unit 2: AI Code Generation Engine */}
        <div className={`p-3 rounded-lg border text-center transition-all ${getStageHighlight('codegen')}`}>
          <Zap className="h-5 w-5 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold tracking-tight uppercase font-mono">2. Code Gen Agent</div>
          <p className="text-[9px] text-slate-400 mt-1 leading-normal line-clamp-2">Generates raw typescript or modules</p>
        </div>

        <ArrowRight className="h-5 w-5 text-slate-800 mx-auto rotate-90 md:rotate-0 hidden sm:block" />

        {/* Unit 3: Sandbox Environment & Test runner */}
        <div className={`p-3 rounded-lg border text-center transition-all ${getStageHighlight('sandbox')}`}>
          <Database className="h-5 w-5 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold tracking-tight uppercase font-mono">3. Sandbox VM</div>
          <p className="text-[9px] text-slate-400 mt-1 leading-normal line-clamp-2">Executes code outputs in docker isolate</p>
        </div>

      </div>

      {/* Add new component form popup drawer */}
      {showAddForm && (
        <form onSubmit={handleAddComponent} className="bg-slate-950/60 p-4 rounded-lg border border-cyan-500/20 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white uppercase tracking-wider text-[10px] text-cyan-400">Add Solution Module Component</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Component Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Redis Cache Layer"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Technology / Library:</label>
              <input
                type="text"
                required
                placeholder="e.g. ioredis, Cluster"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Functional Description:</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Temporarily stores hot JSON payloads within a high throughput cache..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-900 text-slate-400 border border-slate-800 px-3 py-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-cyan-500 text-slate-950 font-semibold px-3 py-1.5 rounded hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              Save New Module
            </button>
          </div>
        </form>
      )}

      {/* Editing Drawer inline */}
      {editingIndex !== null && (
        <div className="bg-slate-950/70 p-4 rounded-lg border border-purple-500/20 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">Tuning Component Block Spec</span>
            <button type="button" onClick={() => setEditingIndex(null)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Component Name:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Technology Specs:</label>
              <input
                type="text"
                value={editTech}
                onChange={(e) => setEditTech(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Functional Description:</label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={() => deleteComponent(editingIndex)}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Module</span>
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="bg-slate-900 text-slate-400 border border-slate-800 px-3 py-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="bg-purple-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-purple-500 transition-colors cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Detail Cards from Plan Ingestion */}
      {architecture ? (
        <div className="space-y-4">
          
          {/* Component list */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2.5">
              Identified Solution Modules (Click any module to edit)
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {architecture.components.map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => startEdit(idx)}
                  className={`bg-slate-950/60 rounded-lg p-3 border hover:border-cyan-500/30 flex flex-col justify-between cursor-pointer transition-all group scale-100 hover:scale-[1.02] ${
                    editingIndex === idx ? 'border-purple-500 bg-purple-950/5 ring-1 ring-purple-500/20' : 'border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors font-display m-0">{comp.name}</h4>
                      <Edit2 className="h-2.5 w-2.5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed leading-4 line-clamp-3 select-text">{comp.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-2">
                    <span className="text-[9px] text-cyan-400 font-mono bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-500/10 w-fit">
                      {comp.technology}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteComponent(idx);
                      }}
                      className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sequential Telemetry description flows */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2.5">
              Live Data Flow Sequence
            </div>

            <div className="space-y-1.5">
              {architecture.dataFlow.map((flow, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300">
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-slate-900 border border-slate-800 px-1 rounded">
                    S{idx + 1}
                  </span>
                  <p className="m-0 text-[11px] leading-relaxed select-text">{flow}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center select-none">
          <HelpCircle className="h-6 w-6 text-slate-700 animate-bounce mb-2" />
          <p className="text-[11px] text-slate-500 m-0">No architecture diagrams parsed.</p>
          <p className="text-[10px] text-slate-600 mt-1">Initiate specification code gen above to extract structural maps.</p>
        </div>
      )}

    </div>
  );
}
