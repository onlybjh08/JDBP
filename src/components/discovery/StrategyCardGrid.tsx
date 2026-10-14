import React from 'react';
import { CandidateStrategy } from '../../types';

interface StrategyCardGridProps {
  strategies: CandidateStrategy[];
  selectedId: string;
  onSelect: (strategy: CandidateStrategy) => void;
  onStartCollaboration: (strategy: CandidateStrategy) => void;
}

export const StrategyCardGrid: React.FC<StrategyCardGridProps> = ({
  strategies,
  selectedId,
  onSelect,
  onStartCollaboration,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <span>AI 도출 후보 전략 비교 (Top 3 Candidates)</span>
          <span className="text-xs font-normal text-slate-400">
            * 통계 검증을 통과한 파레토 최적 전략군
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((strat) => {
          const isSelected = strat.id === selectedId;
          const isRec = strat.isRecommended;

          return (
            <div
              key={strat.id}
              onClick={() => onSelect(strat)}
              className={`relative rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/40 shadow-xl shadow-blue-950/60'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              {/* Recommended Ribbon / Badge */}
              {isRec && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-blue-400/50">
                  <span className="text-amber-300">★</span> AI 강력 추천안
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {strat.name}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    모수 {strat.targetCount.toLocaleString()}건
                  </span>
                </div>

                {/* Rule Description Box */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 mb-3.5">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                    적용 심사 규칙 (Cut-off Rule):
                  </span>
                  <p className="text-xs font-mono text-blue-300 font-medium leading-relaxed">
                    {strat.ruleDescription}
                  </p>
                </div>

                {/* Impact Badges Grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-3.5">
                  {/* Approval Diff */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-center">
                    <span className="text-[10px] text-slate-400 block">승인율 변동</span>
                    <span
                      className={`text-xs font-extrabold ${
                        strat.approvalDiff < -4 ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {strat.approvalDiff > 0 ? `+${strat.approvalDiff}` : strat.approvalDiff}%p
                    </span>
                  </div>

                  {/* Delinquency Diff */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-center">
                    <span className="text-[10px] text-slate-400 block">연체율 개선</span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      {strat.delinquencyDiff}%p
                    </span>
                  </div>

                  {/* Profit Diff */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-center">
                    <span className="text-[10px] text-slate-400 block">예상 순손익</span>
                    <span className="text-xs font-extrabold text-blue-400">
                      +{strat.profitDiff.toFixed(1)}억원
                    </span>
                  </div>
                </div>

                {/* Validation Checklist Badges */}
                <div className="space-y-1 mb-4 pt-2 border-t border-slate-800/70">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                    통계 신뢰도 및 모델 검증:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        strat.validations.sampleValid
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      ✓ 표본 1% 통과
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        strat.validations.ootValid
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {strat.validations.ootValid ? '✓ OOT 검증 통과' : '⚠ OOT 경고'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        strat.validations.maturityValid
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      ✓ 성숙도 충족
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartCollaboration(strat);
                }}
                className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>이 안으로 협의 시작</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
