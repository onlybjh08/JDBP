import React from 'react';
import { BreakdownRow } from '../../types';

interface BreakdownTableProps {
  rows: BreakdownRow[];
  filterMode: string;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ rows, filterMode }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>심사등급별 세부 영향도 분해 (Segment Breakdown Table)</span>
            <span className="text-[11px] font-normal text-slate-400">
              * 차주 등급별 리스크 및 수익 기여도
            </span>
          </h3>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          <span>필터 모드: {filterMode === 'exclude_grade_1_2' ? '1~2등급 예외 검토' : filterMode === 'dti_32' ? 'DTI 32% 완화안' : '기본 등급 분해'}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="px-4 py-3">심사등급 (Segment)</th>
              <th className="px-4 py-3 text-right">해당 건수 (건)</th>
              <th className="px-4 py-3 text-right">구성 비중 (%)</th>
              <th className="px-4 py-3 text-right">연체율 (%)</th>
              <th className="px-4 py-3 text-right">손익 기여 (억원)</th>
              <th className="px-4 py-3 text-center">심사 판정 (Action)</th>
              <th className="px-4 py-3 text-center">표본 검증 상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {rows.map((row, index) => {
              const isMuted = row.isInsufficientSample === true;

              return (
                <tr
                  key={row.groupName || index}
                  className={`transition-colors ${
                    isMuted
                      ? 'bg-slate-950/40 text-slate-500 hover:bg-slate-950/60'
                      : 'text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Group Name */}
                  <td className="px-4 py-3.5 flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        isMuted ? 'text-slate-400' : 'text-white'
                      }`}
                    >
                      {row.groupName}
                    </span>
                  </td>

                  {/* Count */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span className={isMuted ? 'text-slate-400' : 'text-slate-100'}>
                      {row.count.toLocaleString()}
                    </span>
                  </td>

                  {/* Ratio */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span className={isMuted ? 'text-slate-400' : 'text-slate-300'}>
                      {row.ratio.toFixed(2)}%
                    </span>
                  </td>

                  {/* Delinquency Rate */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        isMuted
                          ? 'text-slate-400'
                          : row.delinquencyRate > 3.0
                          ? 'text-rose-400'
                          : row.delinquencyRate < 1.0
                          ? 'text-emerald-400'
                          : 'text-amber-300'
                      }`}
                    >
                      {row.delinquencyRate.toFixed(2)}%
                    </span>
                  </td>

                  {/* Profit Contribution */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        isMuted
                          ? 'text-slate-400'
                          : row.profitContribution > 0
                          ? 'text-blue-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {row.profitContribution > 0 ? `+${row.profitContribution.toFixed(2)}` : row.profitContribution.toFixed(2)}
                    </span>
                  </td>

                  {/* Action Verdict */}
                  <td className="px-4 py-3.5 text-center">
                    {row.actionVerdict === '부결' && (
                      <span className="inline-block bg-rose-950/80 text-rose-300 border border-rose-800/70 text-[11px] font-bold px-2 py-0.5 rounded">
                        부결
                      </span>
                    )}
                    {row.actionVerdict === '유지' && (
                      <span className="inline-block bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold px-2 py-0.5 rounded">
                        유지
                      </span>
                    )}
                    {row.actionVerdict === '제외 검토' && (
                      <span className="inline-block bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 text-[11px] font-bold px-2 py-0.5 rounded ring-1 ring-emerald-500/40">
                        제외 검토 (예외)
                      </span>
                    )}
                  </td>

                  {/* Sample Status */}
                  <td className="px-4 py-3.5 text-center">
                    {isMuted ? (
                      <span className="inline-flex items-center gap-1 bg-amber-950/70 text-amber-300 border border-amber-800/80 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span>⚠️</span> 표본 부족 (비중 {row.ratio.toFixed(2)}% &lt; 1%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-950/50 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <span>✓</span> 표본 유효 ({row.ratio.toFixed(1)}%)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div>
          <span className="text-amber-400 font-semibold">참고 안내:</span> 비중 1.0% 미만 그룹(회색 표시)은 소표본 오차로 인해 통계적 일반화 시 주의가 요구되며, 수기 심사 또는 별도 예외 심사 프로세스가 권고됩니다.
        </div>
        <div className="font-mono text-slate-400">
          합계: {rows.reduce((sum, r) => sum + r.count, 0).toLocaleString()}건 (100%)
        </div>
      </div>
    </div>
  );
};
