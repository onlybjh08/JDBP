import React, { useState } from 'react';
import { VariableDefinition } from '../../types';

interface VariableDictionaryProps {
  variables: VariableDefinition[];
}

export const VariableDictionary: React.FC<VariableDictionaryProps> = ({ variables }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedVariable, setSelectedVariable] = useState<VariableDefinition | null>(null);

  const categories = ['전체', '부채비율', '신용조회', '소득/재직', '다중채무', '금융이력'];

  const filtered = variables.filter((v) => {
    const matchesCategory = selectedCategory === '전체' || v.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      v.id.toLowerCase().includes(q) ||
      v.nameKo.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 text-slate-100">
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            신용평가 및 심사 규칙 변수 사전 (Risk Feature Store)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            단조성 검증(Monotonicity), IV(Information Value), PSI가 사전 검증된 피처 정의서
          </p>
        </div>

        {/* Search input & Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="변수명, 코드(VAR_...) 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-56"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Variable Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">변수 코드 & 한글명</th>
                <th className="px-4 py-3">분류</th>
                <th className="px-4 py-3">산출 로직 / 정의</th>
                <th className="px-4 py-3 text-center">단조성 검증</th>
                <th className="px-4 py-3 text-right">IV (예측력)</th>
                <th className="px-4 py-3 text-right">PSI (안정성)</th>
                <th className="px-4 py-3 text-center">표본 적합도</th>
                <th className="px-4 py-3 text-center">상세 분석</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors text-slate-200 cursor-pointer"
                  onClick={() => setSelectedVariable(item)}
                >
                  {/* ID & Name */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] text-blue-400 font-bold block">
                      {item.id}
                    </span>
                    <span className="font-bold text-white text-xs">{item.nameKo}</span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium">
                      {item.category}
                    </span>
                  </td>

                  {/* Description & Calc Logic */}
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="text-slate-300 line-clamp-1">{item.description}</p>
                    <code className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                      {item.calcLogic}
                    </code>
                  </td>

                  {/* Monotonicity */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-block bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ {item.monotonicityStatus}
                    </span>
                  </td>

                  {/* IV */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span className="font-extrabold text-blue-400">{item.iv.toFixed(3)}</span>
                    <span className="text-[9px] text-slate-500 block">
                      {item.iv > 0.3 ? '강력' : '보통'}
                    </span>
                  </td>

                  {/* PSI */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span className="font-extrabold text-emerald-400">{item.psi.toFixed(3)}</span>
                    <span className="text-[9px] text-slate-500 block">
                      {item.psi < 0.05 ? '안정' : '모니터링'}
                    </span>
                  </td>

                  {/* Sample Adequacy */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="bg-slate-950 text-slate-300 border border-slate-800 text-[10px] px-2 py-0.5 rounded font-mono">
                      {item.sampleAdequacy}
                    </span>
                  </td>

                  {/* Details Button */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVariable(item);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] rounded font-semibold border border-slate-700 transition-colors"
                    >
                      분포 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variable Details Modal */}
      {selectedVariable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {selectedVariable.id}
                </span>
                <h3 className="font-extrabold text-white text-base">
                  {selectedVariable.nameKo} 구간별 연체율 및 WoE 분석
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVariable(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">변수 설명 및 산출식:</div>
                <p className="text-slate-200">{selectedVariable.description}</p>
                <code className="text-blue-300 font-mono text-[11px] block mt-1">
                  {selectedVariable.calcLogic}
                </code>
              </div>

              {/* Bins Table */}
              <div>
                <h4 className="font-bold text-slate-300 mb-2">
                  구간별(Bin) 표본수 및 연체경험률 단조성 검정
                </h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2 text-left">구간 (Bin)</th>
                        <th className="px-3 py-2 text-right">표본 건수 (건)</th>
                        <th className="px-3 py-2 text-right">구간 연체율 (%)</th>
                        <th className="px-3 py-2 text-right">WoE (Weight of Evidence)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedVariable.bins.map((b, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2 font-mono font-bold text-white">{b.bin}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-300">
                            {b.count.toLocaleString()}건
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-rose-400 font-bold">
                            {b.delinquencyRate.toFixed(2)}%
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-blue-400">
                            {b.woe > 0 ? `+${b.woe.toFixed(2)}` : b.woe.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVariable(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
