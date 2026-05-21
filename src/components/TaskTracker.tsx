import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Loader2, XCircle, Layers, ArrowRight } from 'lucide-react';

interface TaskTrackerProps {
  tasks: Task[];
  activeTaskCategory: string | null;
  onSelectTask: (task: Task) => void;
  selectedTaskId: string | null;
}

export default function TaskTracker({ tasks, activeTaskCategory, onSelectTask, selectedTaskId }: TaskTrackerProps) {
  
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 stroke-[2.5]" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-rose-500 stroke-[2.5]" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-cyan-400 stroke-[2.5] animate-spin" />;
      default:
        return <Circle className="h-5 w-5 text-slate-700 stroke-[2]" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'success':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono">COMPLETE</span>;
      case 'failed':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono">FAILED</span>;
      case 'running':
        return <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono animate-pulse">EXECUTING</span>;
      default:
        return <span className="bg-slate-800/50 text-slate-500 border border-slate-800 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono">QUEUED</span>;
    }
  };

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-5 flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-cyan-400" />
        <h2 className="text-base font-semibold text-white font-display">2. Agentic Workflow Orchestrator</h2>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed m-0">
        Trace the autonomous stages designed by the Spec Parser and completed inside the secure sandbox environment.
      </p>

      {/* Task List */}
      <div className="flex flex-col gap-2.5 mt-2">
        {tasks.map((task, idx) => {
          const isSelected = selectedTaskId === task.id;
          const isRunning = task.status === 'running';
          
          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              id={`task-item-${task.id}`}
              className={`group flex items-start gap-3.5 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/50 border-cyan-500'
                  : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80'
              }`}
            >
              
              {/* Checkbox indicator */}
              <div className="mt-0.5">{getStatusIcon(task.status)}</div>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-white truncate font-display group-hover:text-cyan-400 transition-colors m-0">
                    {task.name}
                  </h3>
                  <div>{getStatusBadge(task.status)}</div>
                </div>
                
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-1">
                  {task.details}
                </p>

                {task.dependencies.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 mb-0.5 text-[9px] text-slate-500 font-mono">
                    <span>DEPENDS ON:</span> 
                    {task.dependencies.map((depId) => (
                      <span key={depId} className="bg-slate-900 border border-slate-800 px-1 rounded uppercase">
                        {depId}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pointer indicator */}
              <ArrowRight className={`h-3.5 w-3.5 self-center text-slate-600 transition-transform ${
                isSelected ? 'translate-x-1 text-cyan-400' : 'group-hover:translate-x-0.5 group-hover:text-slate-400'
              }`} />

            </div>
          );
        })}
      </div>

    </div>
  );
}
