import React, { useEffect, useState } from 'react';
import { AgentLog } from '../../types';

interface AgentTerminalProps {
  logs: AgentLog[];
  isSearching: boolean;
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs, isSearching }) => {
  const [visibleLogCount, setVisibleLogCount] = useState<number>(logs.length);

  useEffect(() => {
    if (isSearching) {
      setVisibleLogCount(1);
      const timer1 = setTimeout(() => setVisibleLogCount(2), 200);
      const timer2 = setTimeout(() => setVisibleLogCount(3), 400);
      const timer3 = setTimeout(() => setVisibleLogCount(4), 600);
      const timer4 = setTimeout(() => setVisibleLogCount(5), 800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      setVisibleLogCount(logs.length);
    }
  }, [isSearching, logs]);

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'PLAN':
        return <span className="bg-sky-950 text-sky-400 border border-sky-700/60 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">PLAN</span>;
      case 'SCAN':
        return <span className="bg-purple-950 text-purple-400 border border-purple-700/60 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">SCAN</span>;
      case 'DECISION':
        return <span className="bg-amber-950 text-amber-400 border border-amber-700/60 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">DECISION</span>;
      case 'EVAL':
        return <span className="bg-indigo-950 text-indigo-400 border border-indigo-700/60 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">EVAL</span>;
      case 'DONE':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-700/60 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">DONE</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono">INFO</span>;
    }
  };

  return (
    <div className="bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Terminal Header */}
      <div className="bg-[#0F172A] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 ml-2">
            jepdaeri-ai-agent :: simulation_terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {isSearching ? 'EXPLORING SPACE' : 'READY (ENGINE IDLE)'}
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 text-slate-300">
        {logs.slice(0, visibleLogCount).map((log, index) => (
          <div key={log.id || index} className="flex items-start gap-2.5 leading-relaxed animate-fadeIn">
            <span className="text-slate-500 text-[10px] select-none">{log.timestamp}</span>
            {getStageBadge(log.stage)}
            <span
              className={`flex-1 ${
                log.stage === 'DONE'
                  ? 'text-emerald-300 font-semibold'
                  : log.stage === 'DECISION'
                  ? 'text-amber-200'
                  : 'text-slate-300'
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}

        {isSearching && (
          <div className="flex items-center gap-2 text-blue-400 pt-1">
            <span className="inline-block w-2 h-3.5 bg-blue-500 animate-pulse"></span>
            <span className="text-[11px]">AI 탐색 파이프라인 수행 중...</span>
          </div>
        )}
      </div>
    </div>
  );
};
