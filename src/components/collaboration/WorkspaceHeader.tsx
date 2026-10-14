import React from 'react';
import { CandidateStrategy } from '../../types';

interface WorkspaceHeaderProps {
  strategy: CandidateStrategy;
  isAgreed: boolean;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ strategy, isAgreed }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Current Active Rule */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60 px-2.5 py-0.5 rounded-full">
              현재 협의 기준 전략
            </span>
            <h2 className="text-base font-extrabold text-white">{strategy.name}</h2>
            {isAgreed ? (
              <span className="text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                전 부서 합의 완료 (결재 대기)
              </span>
            ) : (
              <span className="text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                부서간 What-If 조율 진행 중
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">기준 룰:</span>
            <code className="bg-slate-950 border border-slate-800 text-blue-300 px-2.5 py-1 rounded font-mono font-semibold">
              {strategy.ruleDescription}
            </code>
          </div>
        </div>

        {/* Right: Key Metric Summary Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg min-w-[110px]">
            <span className="text-[10px] text-slate-400 block font-medium">승인율 영향</span>
            <span className="text-sm font-extrabold text-rose-400">
              {strategy.approvalDiff > 0 ? `+${strategy.approvalDiff}` : strategy.approvalDiff}%p
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg min-w-[110px]">
            <span className="text-[10px] text-slate-400 block font-medium">연체율 개선</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {strategy.delinquencyDiff}%p
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg min-w-[110px]">
            <span className="text-[10px] text-slate-400 block font-medium">예상 당기손익</span>
            <span className="text-sm font-extrabold text-blue-400">
              +{strategy.profitDiff.toFixed(1)}억원
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg min-w-[110px]">
            <span className="text-[10px] text-slate-400 block font-medium">대상 차주 모수</span>
            <span className="text-sm font-extrabold text-slate-200">
              {strategy.targetCount.toLocaleString()}건
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
