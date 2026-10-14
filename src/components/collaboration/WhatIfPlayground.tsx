import React from 'react';

interface WhatIfPlaygroundProps {
  activeFilter: string;
  onFilterChange: (mode: string) => void;
  customDti: number;
  onCustomDtiChange: (val: number) => void;
  customInquiry: number;
  onCustomInquiryChange: (val: number) => void;
  onAgree: () => void;
  isAgreed: boolean;
}

export const WhatIfPlayground: React.FC<WhatIfPlaygroundProps> = ({
  activeFilter,
  onFilterChange,
  customDti,
  onCustomDtiChange,
  customInquiry,
  onCustomInquiryChange,
  onAgree,
  isAgreed,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Top Filter Chips & Trigger Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-300 mr-1">시나리오 퀵 필터:</span>

          <button
            type="button"
            onClick={() => onFilterChange('grade')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeFilter === 'grade'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            심사등급별 기본 분해
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('exclude_grade_1_2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
              activeFilter === 'exclude_grade_1_2'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span>★ 1~2등급 제외 시뮬레이션</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-200 px-1 rounded border border-emerald-700">
              영업추진부 요청
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('dti_32')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeFilter === 'dti_32'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            DTI 32%로 완화 시뮬레이션
          </button>
        </div>

        {/* Agreement Trigger Button */}
        <div>
          <button
            type="button"
            onClick={onAgree}
            disabled={isAgreed}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg ${
              isAgreed
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60 cursor-default'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 active:scale-95'
            }`}
          >
            {isAgreed ? (
              <>
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>영업추진부/상품개발부 동의 완료 (협의 확정)</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>영업추진부/상품개발부 동의 완료 (협의 확정)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Micro-Tuning Sliders Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DTI Threshold Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <span>미세조정: DTI Cut-off 임계치</span>
            </span>
            <span className="font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              {customDti}% 초과 부결
            </span>
          </div>
          <input
            type="range"
            min="26"
            max="38"
            step="1"
            value={customDti}
            onChange={(e) => onCustomDtiChange(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>26% (보수적)</span>
            <span>30% (권장)</span>
            <span>38% (공격적)</span>
          </div>
        </div>

        {/* Inquiry Count Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <span>미세조정: 최근 6개월 CB 신용조회건수 기준</span>
            </span>
            <span className="font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
              {customInquiry}건 이상 부결
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="6"
            step="1"
            value={customInquiry}
            onChange={(e) => onCustomInquiryChange(parseInt(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>2건 (엄격 차단)</span>
            <span>3건 (균형)</span>
            <span>6건 (최소 차단)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
