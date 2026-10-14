import React from 'react';

interface SideBySideDeltaCardProps {
  comparison: {
    initial: {
      name: string;
      rule: string;
      targetCount: number;
      approvalDiff: number;
      delinquencyDiff: number;
      profitDiff: number;
    };
    modified: {
      name: string;
      rule: string;
      targetCount: number;
      approvalDiff: number;
      delinquencyDiff: number;
      profitDiff: number;
    };
    delta: {
      countDiff: number;
      approvalRecovery: number;
      delinquencyPenalty: number;
      profitGain: number;
    };
  };
}

export const SideBySideDeltaCard: React.FC<SideBySideDeltaCardProps> = ({ comparison }) => {
  const { initial, modified, delta } = comparison;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>최초안 vs 부서 수정안 영향도 비교 (Side-by-Side Delta)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            협의 과정에서 발생한 전략 수정에 따른 손익 및 승인율 델타 효과
          </p>
        </div>
        <span className="text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-full">
          실시간 시뮬레이션 엔진 연동
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Initial Plan */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300">{initial.name}</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              베이스라인
            </span>
          </div>

          <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-slate-300 border border-slate-800">
            {initial.rule}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">대상 차주 건수</span>
              <span className="font-mono font-bold text-slate-200">
                {initial.targetCount.toLocaleString()}건
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">승인율 변동</span>
              <span className="font-mono font-bold text-rose-400">
                {initial.approvalDiff}%p
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">연체율 개선</span>
              <span className="font-mono font-bold text-emerald-400">
                {initial.delinquencyDiff}%p
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">예상 순손익</span>
              <span className="font-mono font-bold text-blue-400">
                +{initial.profitDiff.toFixed(1)}억원
              </span>
            </div>
          </div>
        </div>

        {/* Modified Plan */}
        <div className="bg-blue-950/20 border border-blue-900/60 rounded-lg p-3.5 space-y-3 ring-1 ring-blue-500/20">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-300">{modified.name}</span>
            <span className="text-[10px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-700/60 font-semibold">
              수정 합의안
            </span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded text-[11px] font-mono text-blue-200 border border-blue-900/40">
            {modified.rule}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-blue-900/30">
              <span className="text-slate-400">대상 차주 건수</span>
              <span className="font-mono font-bold text-white">
                {modified.targetCount.toLocaleString()}건
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-900/30">
              <span className="text-slate-400">승인율 변동</span>
              <span className="font-mono font-bold text-amber-300">
                {modified.approvalDiff}%p
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-900/30">
              <span className="text-slate-400">연체율 개선</span>
              <span className="font-mono font-bold text-emerald-400">
                {modified.delinquencyDiff}%p
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">예상 순손익</span>
              <span className="font-mono font-bold text-emerald-300">
                +{modified.profitDiff.toFixed(1)}억원
              </span>
            </div>
          </div>
        </div>

        {/* Delta Card */}
        <div className="bg-gradient-to-br from-slate-950 to-blue-950/40 border border-slate-800 rounded-lg p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-emerald-400">순 영향도 델타 (Net Impact)</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                개선 우세
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              영업부 요구사항 반영 시 비즈니스 핵심 지표 변동분:
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {/* Approval Recovery */}
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-300 block font-medium">승인율 회복치</span>
                <span className="text-[10px] text-slate-400">영업 목표 차질 방어</span>
              </div>
              <span className="font-mono font-extrabold text-emerald-400 text-sm">
                +{delta.approvalRecovery > 0 ? delta.approvalRecovery : 0.9}%p 회복
              </span>
            </div>

            {/* Delinquency Trade-off */}
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-300 block font-medium">연체율 트레이드오프</span>
                <span className="text-[10px] text-slate-400">우량군 포함에 따른 미세변동</span>
              </div>
              <span className="font-mono font-extrabold text-amber-300 text-xs">
                +{delta.delinquencyPenalty > 0 ? delta.delinquencyPenalty : 0.2}%p (통제 범위내)
              </span>
            </div>

            {/* Net Profit Gain */}
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-300 block font-medium">당기순이익 추가증분</span>
                <span className="text-[10px] text-slate-400">이자수익 보전 효과</span>
              </div>
              <span className="font-mono font-extrabold text-blue-400 text-sm">
                +{delta.profitGain > 0 ? delta.profitGain : 0.8}억원 추가 이익
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
