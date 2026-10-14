import React from 'react';
import { SearchConstraint } from '../../types';

interface ConstraintFormProps {
  constraint: SearchConstraint;
  onChange: (updated: Partial<SearchConstraint>) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const ConstraintForm: React.FC<ConstraintFormProps> = ({
  constraint,
  onChange,
  onSearch,
  isLoading,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            전략 탐색 조건 설정
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            목표 지표 및 심사 제약 조건을 정의합니다.
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-blue-950 text-blue-400 px-2.5 py-1 rounded-full border border-blue-800/60">
          신용리스크 AI 엔진 v2.6
        </span>
      </div>

      <div className="space-y-5">
        {/* Target Metric Selection Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            최적화 목표 지표 (Target Metric)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'delinquency', label: '연체경험률 ↓', desc: '건전성 극대화' },
              { id: 'profit', label: '당기손익 ↑', desc: '순마진 극대화' },
              { id: 'conversion', label: '회수율 ↑', desc: '부실채권 회수' },
            ].map((item) => {
              const active = constraint.targetMetric === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange({ targetMetric: item.id as any })}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs transition-all ${
                    active
                      ? 'bg-blue-600/30 border-blue-500 text-white ring-1 ring-blue-500 shadow-lg shadow-blue-950'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold">{item.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Product Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            대상 여신 상품 (Target Product)
          </label>
          <select
            value={constraint.targetProduct}
            onChange={(e) => onChange({ targetProduct: e.target.value })}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="PL 신용대출 36개월물">PL 신용대출 36개월물 (기본 모수 184,200건)</option>
            <option value="직장인 프라임 신용대출">직장인 프라임 신용대출 (우량군 72,000건)</option>
            <option value="중금리 햇살론 대환 48개월물">중금리 햇살론 대환 48개월물 (정책형 41,500건)</option>
          </select>
        </div>

        {/* Max Approval Drop Slider */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>승인율 하락 상한선</span>
              <span className="text-[10px] text-slate-400 font-normal">(Max Approval Drop)</span>
            </label>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/60">
              -{constraint.maxApprovalDrop.toFixed(1)}%p 이내
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={constraint.maxApprovalDrop}
            onChange={(e) => onChange({ maxApprovalDrop: parseFloat(e.target.value) })}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>-1.0%p (엄격)</span>
            <span>-5.0%p (표준 권장)</span>
            <span>-10.0%p (공격적)</span>
          </div>
        </div>

        {/* Min Sample Size Input */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>최소 표본 비중</span>
              <span className="text-[10px] text-slate-400 font-normal">(Min Sample Size)</span>
            </label>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
              {constraint.minSampleSize.toFixed(1)}% 이상
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.5"
            value={constraint.minSampleSize}
            onChange={(e) => onChange({ minSampleSize: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 mt-1.5">
            * 통계적 신뢰도 보장을 위해 타깃 그룹 최소 {constraint.minSampleSize}% (약 1,840건) 이상 필수
          </p>
        </div>

        {/* Search Submit Button */}
        <button
          type="button"
          onClick={onSearch}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>AI 전략 탐색 연산 중 (단조성 & OOT 스캔)...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>전략 탐색 시작 (AI Impact Engine)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
