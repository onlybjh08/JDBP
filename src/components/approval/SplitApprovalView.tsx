import React, { useState } from 'react';
import { ApprovalDraft, CandidateStrategy } from '../../types';

interface SplitApprovalViewProps {
  draft: ApprovalDraft;
  strategy: CandidateStrategy;
  onEditDraft: () => void;
  onSubmitApproval: () => void;
  isSubmitting: boolean;
  docNumber?: string;
}

export const SplitApprovalView: React.FC<SplitApprovalViewProps> = ({
  draft,
  strategy,
  onEditDraft,
  onSubmitApproval,
  isSubmitting,
  docNumber,
}) => {
  const isSubmitted = draft.status === 'submitted';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT: 협의 및 감사 이력 타임라인 (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Final Agreed Rule Summary Box */}
        <div className="bg-gradient-to-br from-blue-950/70 to-slate-900 border border-blue-800/80 rounded-xl p-4 shadow-xl text-slate-100 ring-1 ring-blue-500/30">
          <div className="flex items-center justify-between pb-2.5 border-b border-blue-900/60 mb-3">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              최종 합의 규칙 요약 (Final Agreed Rule)
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-extrabold">
              전 부서 서명 완료
            </span>
          </div>

          <p className="text-xs font-mono font-bold text-white bg-slate-950/90 border border-slate-800 p-3 rounded-lg leading-relaxed mb-3">
            {draft.finalRule}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">승인율 최종 변동</span>
              <span className="font-mono font-bold text-amber-400">
                {draft.expectedImpact.approvalDiff}%p
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">연체율 최종 개선</span>
              <span className="font-mono font-bold text-emerald-400">
                {draft.expectedImpact.delinquencyDiff}%p
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">예상 순이익 증분</span>
              <span className="font-mono font-bold text-blue-400">
                +{draft.expectedImpact.profitDiff}억원
              </span>
            </div>
          </div>
        </div>

        {/* Audit & Discussion Timeline Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>협의 및 감사 이력 타임라인 (Audit Trail)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Audit-Log-Trace</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {/* Step 1: Initial AI Strategy */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900"></span>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-blue-400">1. AI 엔진 초기 최적화</span>
                  <span>10:14</span>
                </div>
                <p className="text-slate-300 font-medium">
                  36개월물 대상 3개 전략안 자동 도출 및 단조성/OOT 사전 검증 통과
                </p>
              </div>
            </div>

            {/* Step 2: Sales Department Inquiry */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-900"></span>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-amber-400">2. 영업추진부 보완 요청</span>
                  <span>10:25</span>
                </div>
                <p className="text-slate-300 font-medium">
                  "1~2등급 우량차주 이탈 방지를 위한 DTI 30% 일괄 부결 예외 처리 시뮬레이션 요구"
                </p>
              </div>
            </div>

            {/* Step 3: AI Engine Recalculation */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-emerald-400">3. AI 재집계 및 델타 산출</span>
                  <span>10:26</span>
                </div>
                <p className="text-slate-300 font-medium">
                  1~2등급 제외 시 승인율 0.9%p 회복, 이자수익 증대로 순이익 +0.8억원 추가 개선 입증
                </p>
              </div>
            </div>

            {/* Step 4: Product Development Dept Agreement */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900"></span>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-indigo-400">4. 상품개발부 최종 합의</span>
                  <span>10:32</span>
                </div>
                <p className="text-slate-300 font-medium">
                  수정안 B-2 채택 시 분기 잔액 목표 및 마진(NIM) 유지 확인, 부서간 최종 동의 완료
                </p>
              </div>
            </div>

            {/* Step 5: Risk Department Sign-off */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-900"></span>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-purple-400">5. 리스크관리부 종합 의결</span>
                  <span>10:40</span>
                </div>
                <p className="text-slate-300 font-medium">
                  OOT 검증 및 단조성 기준 유지 확인, 전자결재 본 품의서 자동 작성 완료
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: 전자결재 심사전략 변경 품의서 미리보기 (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Action Header Buttons */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>전자결재 심사전략 변경 품의서 미리보기</span>
            </span>
            {isSubmitted && (
              <span className="text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded animate-pulse">
                결재 상신 완료 (문서번호: {docNumber || 'JB-RM-2026-1011-042'})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEditDraft}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>내용 직접 수정</span>
            </button>

            <button
              type="button"
              onClick={onSubmitApproval}
              disabled={isSubmitting || isSubmitted}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg ${
                isSubmitted
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/50 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>전자서명 상신 처리 중...</span>
                </>
              ) : isSubmitted ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>결재 상신 완료</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>결재 상신 (전자서명)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Paper Document Representation */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden font-sans text-slate-200">
          {/* Watermark / Digital Seal when submitted */}
          {isSubmitted && (
            <div className="absolute right-8 top-16 pointer-events-none transform rotate-12 z-20 border-4 border-rose-600/90 text-rose-500 rounded-lg px-4 py-2 font-mono font-extrabold text-sm tracking-widest bg-rose-950/20 shadow-2xl animate-stamp">
              전자결재 상신완료
              <div className="text-[9px] text-rose-400 text-center font-normal">
                {new Date().toISOString().slice(0, 10)} 리스크관리부
              </div>
            </div>
          )}

          {/* Official Document Header */}
          <div className="border-b-2 border-slate-700 pb-4 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block tracking-wider">
                  문서번호: {docNumber || 'JB-RM-2026-1011-042'} | 보존연한: 5년
                </span>
                <h1 className="text-lg font-black text-white mt-1">
                  심 사 전 략 변 경 품 의 서
                </h1>
              </div>

              {/* Approval Line Table */}
              <div className="border border-slate-700 rounded overflow-hidden text-[10px] text-center bg-slate-900/90">
                <div className="grid grid-cols-4 bg-slate-800 border-b border-slate-700 font-bold text-slate-300">
                  <div className="px-2 py-1">기안</div>
                  <div className="px-2 py-1">검토</div>
                  <div className="px-2 py-1">합의</div>
                  <div className="px-2 py-1">승인</div>
                </div>
                <div className="grid grid-cols-4 divide-x divide-slate-700 py-1.5 px-0.5">
                  <div className="text-emerald-400 font-bold">김대리<br /><span className="text-[9px] text-slate-400">[서명]</span></div>
                  <div className="text-emerald-400 font-bold">박팀장<br /><span className="text-[9px] text-slate-400">[서명]</span></div>
                  <div className="text-blue-400 font-bold">정부장<br /><span className="text-[9px] text-slate-400">[합의]</span></div>
                  <div className={isSubmitted ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                    {isSubmitted ? '최본부장\n[상신]' : '최본부장\n[대기]'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Metadata Table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden text-xs mb-5">
            <div className="grid grid-cols-4 bg-slate-900 border-b border-slate-800">
              <div className="p-2 text-slate-400 font-bold bg-slate-900/80 border-r border-slate-800">기안 부서</div>
              <div className="p-2 text-slate-200">리스크관리부 심사전략팀</div>
              <div className="p-2 text-slate-400 font-bold bg-slate-900/80 border-r border-slate-800">기안 일자</div>
              <div className="p-2 text-slate-200 font-mono">2026년 10월 11일</div>
            </div>
            <div className="grid grid-cols-4 bg-slate-950">
              <div className="p-2 text-slate-400 font-bold bg-slate-900/80 border-r border-slate-800">품의 건명</div>
              <div className="p-2 col-span-3 text-white font-bold">{draft.title}</div>
            </div>
          </div>

          {/* Document Section 1: 변경 사유 */}
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-extrabold text-blue-400 text-xs mb-1.5 flex items-center gap-1.5">
                <span>1. 변경 사유 (배경 및 목적)</span>
              </h4>
              <p className="bg-slate-900/60 p-3 rounded border border-slate-800 text-slate-300 leading-relaxed">
                {draft.reason}
              </p>
            </div>

            {/* Document Section 2: 변경 내용 */}
            <div>
              <h4 className="font-extrabold text-blue-400 text-xs mb-1.5 flex items-center gap-1.5">
                <span>2. 변경 내용 (심사 규칙 고도화안)</span>
              </h4>
              <div className="bg-slate-900/60 p-3 rounded border border-slate-800 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="text-slate-400">대상 여신 상품:</div>
                  <div className="col-span-2 font-bold text-white">PL 신용대출 36개월물</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="text-slate-400">현행 심사 기준:</div>
                  <div className="col-span-2 text-slate-400 font-mono">DTI 40% 초과 부결 (단기조회 규칙 미반영)</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-800">
                  <div className="text-emerald-400 font-bold">변경 후 심사 기준:</div>
                  <div className="col-span-2 font-mono font-bold text-emerald-300">
                    {draft.finalRule}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Section 3: 예상 효과 */}
            <div>
              <h4 className="font-extrabold text-blue-400 text-xs mb-1.5 flex items-center gap-1.5">
                <span>3. 예상 효과 (재무 및 건전성 영향)</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">승인율 영향</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {draft.expectedImpact.approvalDiff}%p
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">(영업 허용한도 내 방어)</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">연체경험률 개선</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {draft.expectedImpact.delinquencyDiff}%p
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">(부실채권 예방)</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">연간 당기순손익</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    +{draft.expectedImpact.profitDiff}억원
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">(이자마진 보전)</span>
                </div>
              </div>
            </div>

            {/* Document Section 4: 통계 및 모델 검증 결과 */}
            <div>
              <h4 className="font-extrabold text-blue-400 text-xs mb-1.5 flex items-center gap-1.5">
                <span>4. 통계 및 모델 검증 결과</span>
              </h4>
              <ul className="bg-slate-900/60 p-3 rounded border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                {draft.validationSummary.map((val, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{val}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Document Section 5: 협의 경과 */}
            <div>
              <h4 className="font-extrabold text-blue-400 text-xs mb-1.5 flex items-center gap-1.5">
                <span>5. 부서간 협의 경과 및 조율 사항</span>
              </h4>
              <div className="bg-slate-900/60 p-3 rounded border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                {draft.discussionHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
            본 문서는 JB금융그룹 젭대리 AI 거버넌스 프레임워크에 의해 생성되었으며, 전자서명법에 따른 법적 효력을 지닙니다.
          </div>
        </div>
      </div>
    </div>
  );
};
