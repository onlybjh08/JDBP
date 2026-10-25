/**
 * JDBP (젭대리 Biz.Platform) - 사용자 맞춤형 플로우 엔진
 * 1. 첫 화면: 진행 업무 목록 (To-Do) 완벽 복원
 * 2. 월 모니터링: AI가 매월 찾아놓은 강화/완화 SEG 발굴 큐 ➔ 클릭 시 협의로 연결
 * 3. 업무요건 의뢰: 비정형 분석 요청 (자연어 상황 ➔ LLM 조건 정리 ➔ 접수)
 * 4. 부서간 협의: AI가 찾은 결과(선행 전략 & 게이트) + RAG 협의 기억 사전 브리핑 ➔ 양 부서 조율
 * 5. 기준 모니터링: 분석할 때 정부 규제나 제외했으면 하는 내용 등록 및 적용(ON/OFF) 관리
 */

window.JepDaeriFlow = {
  // 초기 상태 확장 및 동기화
  initState(st) {
    // 1. [월 모니터링] 상태 (AI가 매월 찾아놓은 강화/완화 대상 안건들)
    if (!st.monthlyMonitoring) {
      st.monthlyMonitoring = {
        selectedMonth: '2026-10',
        constraints: {
          maxApprovalDrop: 5.0, // 승인율 하락 상한 (-5.0%p)
          minSampleSize: 1.0,   // 최소 표본 비중 (1.0%)
          requireYearlyReplay: true, // 전년 재현성 검증 필수
          cycle: '매월 1일 정기 자동 배치 탐색'
        },
        stats: {
          totalEvaluated: 34850,
          totalAutoRejected: 28640,
          rejectionRate: '82.2%',
          qualifiedCount: 12,
          targetProducts: 6,
          leadTimeSaved: '20일 ➔ 2일 (90% 단축)'
        },
        items: [
          {
            id: 'REQ-2026-1011-042',
            product: 'PL 신용대출 36개월물',
            category: '강화',
            categoryBadge: '🚨 강화 SEG (거절 대상 발굴)',
            categoryColor: 'rose',
            title: '[긴급] PL 신용대출 36개월물 단기조회 급증 차주군 심사 강화',
            discoveryReason: '최근 3개월 단기 신용조회 3회 이상 & DTI 32% 초과 차주의 연체전이율이 2.80%로 급등 감지',
            conditions: ['DTI ≥ 32%', '최근 6개월 신용조회 ≥ 3회', '2금융권 대출 ≥ 2건'],
            stats: {
              delinqDelta: '-1.50%p',
              delinqFromTo: '2.80% ➔ 1.30%',
              approvalDelta: '-4.20%p',
              profitImpact: '+2.8억원 (부실 손실 방어)',
              targetVolume: '월 58억원',
              sampleCount: '5,820명 (전체의 3.1%)'
            },
            evaluation: {
              evaluated: 9445,
              rejected: 7803,
              passed: 1642,
              selectedRank: '파레토 1위 최적안'
            },
            status: 'ready_for_collab',
            statusLabel: '협의 준비 완료 (RAG 사전 브리핑 탑재)',
            urgency: '긴급'
          },
          {
            id: 'REQ-2026-1010-040',
            product: 'JB 오토론 (신차/중고차)',
            category: '완화',
            categoryBadge: '📈 완화 SEG (받을 우량 고객군)',
            categoryColor: 'emerald',
            title: '[정기] JB 오토론 공무원·대기업 근속 우량 차주군 심사 완화',
            discoveryReason: '공무원·대기업 재직 5년 이상, DTI 35% 이하 차주군의 실측 부실률이 0.18%로 극저 수준',
            conditions: ['공무원/대기업 재직 5년 이상', 'DTI ≤ 35%', '신용평점 KCB 820점 이상'],
            stats: {
              delinqDelta: '+0.03%p',
              delinqFromTo: '0.18% ➔ 0.21%',
              approvalDelta: '+3.80%p',
              profitImpact: '+4.2억원 (취급 수수료 및 이자익 증대)',
              targetVolume: '월 42억원',
              sampleCount: '4,150명 (전체의 2.2%)'
            },
            evaluation: {
              evaluated: 11200,
              rejected: 9410,
              passed: 1790,
              selectedRank: '파레토 1위 최적안'
            },
            status: 'ready_for_collab',
            statusLabel: '협의 준비 완료',
            urgency: '보통'
          },
          {
            id: 'REQ-2026-1011-045',
            product: '중금리 햇살론 대환 48개월물',
            category: '강화',
            categoryBadge: '🛡️ 강화 SEG (리스크 선제 방어)',
            categoryColor: 'amber',
            title: '[정기] 중금리 대환 고위험 다중채무 차주 DSR 40% 차등 강화',
            discoveryReason: '2금융권 신용대출 3건 이상 보유 차주군의 다중채무 부실 연쇄 가능성 감지',
            conditions: ['DSR ≥ 40%', '2금융권 대출 ≥ 3건', '최근 1년 연체이력 1회 이상'],
            stats: {
              delinqDelta: '-0.85%p',
              delinqFromTo: '3.40% ➔ 2.55%',
              approvalDelta: '-2.50%p',
              profitImpact: '+3.2억원 (부실 방어)',
              targetVolume: '월 35억원',
              sampleCount: '3,200명 (전체의 1.7%)'
            },
            evaluation: {
              evaluated: 8750,
              rejected: 7230,
              passed: 1520,
              selectedRank: '파레토 1위 최적안'
            },
            status: 'ready_for_collab',
            statusLabel: '협의 준비 완료',
            urgency: '높음'
          }
        ]
      };
    }

    // 2. [기준 모니터링] 상태 (정부 규제 및 분석 제외 기준 관리 - 적용 여부 On/Off)
    if (!st.ruleMonitoring) {
      st.ruleMonitoring = {
        filterCategory: 'ALL', // 'ALL', 'REGULATION', 'EXCLUSION', 'INTERNAL'
        rules: [
          {
            id: 'REG-DSR-40',
            code: 'REG-2026-DSR40',
            category: 'REGULATION',
            categoryName: '🏛️ 정부 외부 규제',
            title: '금융위원회 전 금융권 차주 단위 DSR 40% 한도 규제',
            target: '가계대출 전 상품',
            description: '차주의 연간 원리금상환액이 연소득의 40%를 초과할 수 없도록 법제화된 규제입니다. AI 분석 및 탐색 시 DSR 40% 초과 차주를 완화 대상으로 선정하는 것을 자동 차단합니다.',
            reason: '금융위 가계부채 관리 강화 방안 및 은행업 감독규정 준수',
            isActive: true,
            updatedAt: '2026-10-01'
          },
          {
            id: 'EXC-GRADE-12',
            code: 'EXC-2026-GRADE12',
            category: 'EXCLUSION',
            categoryName: '🚫 분석 제외 기준',
            title: '1~2등급 최우량 차주 심사 강화(거절) 탐색 제외',
            target: 'PL 신용대출, 오토론',
            description: 'KCB/NICE 1~2등급 최우량 차주는 실측 부실률이 0.08% 미만으로 극저이므로, 리스크 방어 목적의 강화(거절) 조건 조합 생성 시 탐색 대상 모수에서 사전 제외합니다.',
            reason: '우량 차주 거절로 인한 영업 취급 타격 및 고객 이탈 방지',
            isActive: true,
            updatedAt: '2026-10-05'
          },
          {
            id: 'REG-LTV-AUTO',
            code: 'REG-2026-LTVAUTO',
            category: 'REGULATION',
            categoryName: '🏛️ 정부 외부 규제',
            title: '여신금융협회 오토론 담보인정비율(LTV) 70% 상한 규제',
            target: 'JB 오토론 (신차/중고차)',
            description: '차량 기준가액 대비 대출 승인 비율(LTV)이 70%를 초과할 수 없도록 제한합니다. AI 완화 탐색 시 LTV 70% 초과 한도 우대 조건 생성을 원천 필터링합니다.',
            reason: '여전업 건전성 감독 규정 및 담보물 잔존가치 리스크 방어',
            isActive: true,
            updatedAt: '2026-09-15'
          },
          {
            id: 'EXC-DUP-RULES',
            code: 'EXC-2026-DUP01',
            category: 'EXCLUSION',
            categoryName: '🚫 분석 제외 기준',
            title: '기존 사내 운영 중인 심사 Rule과 중복 조건 탐색 제외',
            target: '전 상품 공통',
            description: '이미 사내 내규로 공식 시행 중인 심사 룰(RULE-2026-0814 등)과 정확히 동일하거나 중복되는 조건 조합은 AI 월간 모니터링 게이트 ⑤에서 자동으로 제외하여 올리지 않습니다.',
            reason: '기존 운영 기준과의 충돌 방지 및 신규 차별화 안건 집중',
            isActive: true,
            updatedAt: '2026-10-10'
          },
          {
            id: 'REG-FIN-PROTECT',
            code: 'REG-2026-FINPROT',
            category: 'REGULATION',
            categoryName: '🏛️ 정부 외부 규제',
            title: '금융소비자보호법 대출 적합성 및 적정성 원칙 규제',
            target: '가계대출 전 상품',
            description: '고령자(만 65세 이상) 및 취약 차주 대상 고위험 대출 상품 취급 시 연체 전이 위험도가 높은 조건의 완화 추천을 자동 방어합니다.',
            reason: '금소법 제17조 및 제18조 법적 준수 의무',
            isActive: true,
            updatedAt: '2026-08-20'
          },
          {
            id: 'EXC-SAMPLE-MIN',
            code: 'EXC-2026-SAMPLE',
            category: 'EXCLUSION',
            categoryName: '🚫 분석 제외 기준',
            title: '최소 표본 비중 1.0% 미달 통계적 비유의군 탐색 제외',
            target: '전 상품 공통',
            description: '전체 18.4만 건 빅데이터 중 해당 조건에 부합하는 모수가 1.0%(1,840명) 미만인 극소수 고객군은 통계적 과적합(Overfitting) 방지를 위해 탐색 후보에서 즉시 기각합니다.',
            reason: '통계적 유의성 및 일반화 신뢰도 확보 (게이트 ① 연동)',
            isActive: true,
            updatedAt: '2026-09-01'
          },
          {
            id: 'INT-DELINQ-3M',
            code: 'INT-2026-DELINQ',
            category: 'INTERNAL',
            categoryName: '⚖️ 사내 심사 내규',
            title: '최근 3개월 단기 연체 2회 이상 보유 차주 완화 배제',
            target: '신용대출 24/36개월물',
            description: '단기 연체 이력이 최근 빈발한 차주는 소득 및 신용평점이 양호하더라도 심사 완화(금리인하/한도상향) 대상에서 절대적으로 제외합니다.',
            reason: '단기 연체 차주의 3개월 내 중장기 부실 전이율(68%) 차단',
            isActive: true,
            updatedAt: '2026-09-25'
          },
          {
            id: 'EXC-SOHO-SPEC',
            code: 'EXC-2026-SOHO',
            category: 'EXCLUSION',
            categoryName: '🚫 분석 제외 기준',
            title: '개인사업자 SOHO 특례보증 차주 일반 가계대출 룰 적용 제외',
            target: 'SOHO 보증서 대출',
            description: '신용보증재단 특례보증이 적용된 차주는 일반 개인 차주의 DTI/DSR 산출 공식에서 예외로 분리하여 분석하도록 설정합니다.',
            reason: '정책 보증 대출의 별도 건전성 관리 규정 준수',
            isActive: false, // 기본값: 미적용(OFF)
            updatedAt: '2026-10-12'
          }
        ]
      };
    }

    // 3. [RAG 협의 기억] 브리핑 데이터 (협의 화면 상단에 녹여 넣을 데이터)
    if (!st.ragCollaborationBriefing) {
      st.ragCollaborationBriefing = {
        analyzedCasesCount: 4,
        summary: '과거 4건의 유사 대출 심사전략 협의 기록을 RAG 메모리에서 검색 및 분석했습니다.',
        salesTendency: '영업기획팀은 월 취급액 원안 감소분의 35% 이하 유지를 강력 요구하는 패턴 (확률 94%)',
        creditTendency: '신용관리팀은 엔지원안의 연체율 개선 효과 중 65% 이상은 반드시 사수하려는 패턴 (확률 98%)',
        aiPreSettlement: {
          title: '젭대리 AI 선제 절충안 (Golden Ratio)',
          conditions: 'DTI 33% 적용 + 1~2등급 우량차주 예외 심사 허용',
          approvalDrop: '-2.80%p (영업 취급액 18억원 회복)',
          delinqImprove: '-1.30%p (신용관리 연체 방어율 87% 보존)',
          suitabilityScore: 96.5,
          matchRate: '영업 요구 92% 충족 / 신용관리 요구 96% 충족'
        },
        preQnA: [
          {
            q: '영업기획팀 예상 질문: "승인율 -4.2%p 타격이 너무 큽니다. 취급액을 일부라도 살릴 수 있는 방안은 없나요?"',
            a: '젭대리 답변 준비: "1~2등급 우량차주(전체의 32%)를 거절 조건에서 예외 처리하면 월 취급액 18억 원이 즉시 회복되며, 연체율 상승은 0.15%p에 그쳐 연체 개선폭 -1.30%p가 견고히 유지됩니다."'
          },
          {
            q: '신용관리팀 예상 질문: "우량차주를 예외로 풀어주면 연체율 개선 효과가 너무 희석되지 않나요?"',
            a: '젭대리 답변 준비: "연체 전이의 84%는 3~6등급 다중채무 구간에 집중되어 있으므로, 1~2등급 예외 시에도 연체 개선 목표치(-1.50%p)의 87%에 달하는 -1.30%p를 안정적으로 달성할 수 있습니다."'
          }
        ]
      };
    }
  },

  // -------------------------------------------------------------
  // [월 정기 모니터링] 팝업 모달 래퍼
  // -------------------------------------------------------------
  renderMonthlyMonitoringModal() {
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
        <!-- 모달 컨테이너 (스크롤 분리 및 최대 높이 94vh) -->
        <div class="bg-white border-2 border-blue-500 rounded-3xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
          
          <!-- 1. 모달 헤더 (JB우리캐피탈 다크 네이비 테마) -->
          <div class="bg-gradient-to-r from-[#0B1B33] via-[#0F2445] to-[#15315C] text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-[#233D66] shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📊</span>
              <div>
                <h2 class="text-lg sm:text-xl font-black text-white">
                  월 정기 모니터링: AI 자동 발굴 강화 · 완화 대상 안건
                </h2>
              </div>
            </div>
            
            <div class="flex items-center gap-2 shrink-0">
              <!-- 우측 상단 닫기 X 버튼 -->
              <button
                type="button"
                onclick="closeMonthlyMonitoringModal();"
                class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-rose-300 flex items-center justify-center font-black text-lg transition-all border border-white/20 shrink-0"
                title="팝업 닫기"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 2. 모달 바디 (스크롤 영역) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
            ${this.renderMonthlyMonitoringScreen()}
          </div>

          <!-- 3. 모달 푸터 바 -->
          <div class="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>매월 초 자동 탐색 배치 완료 상태 · 원하는 SEG의 [협의 시작하기]를 선택하면 담당자 확인 후 즉시 부서간 협의로 상정됩니다.</span>
            </div>
            <button
              type="button"
              onclick="closeMonthlyMonitoringModal();"
              class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-95"
            >
              닫기
            </button>
          </div>

        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 1. [월 모니터링] 화면 렌더러
  // AI 에이전트가 매월 모니터링을 통해 강화/완화 대상들을 찾아놓은 화면
  // -------------------------------------------------------------
  renderMonthlyMonitoringScreen() {
    const mm = state.monthlyMonitoring;
    return `
      <div class="space-y-6 animate-fadeIn">
        <!-- 담당자가 설정하는 제약조건 컨트롤 바 -->
        <div class="bg-gradient-to-r from-[#0B1B33] via-[#0F2445] to-[#15315C] text-white border border-[#233D66] rounded-2xl p-4 shadow-sm">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-blue-900/60">
            <span class="text-xs font-black text-blue-200">⚙️ AI 자동 탐색 제약조건 (담당자 지정 기준)</span>
            <span class="text-[11px] text-slate-400">18.4만 건 빅데이터 전수 평가 적용</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="bg-[#0B192C]/80 border border-[#233D66] rounded-xl p-3.5">
              <span class="text-[11px] text-blue-300 font-bold block mb-1">🎯 승인율 하락 상한 제약</span>
              <div class="flex items-center justify-between">
                <span class="text-base font-black text-white">-5.0%p 이내 방어</span>
                <span class="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/40">영업 타격 방어</span>
              </div>
            </div>

            <div class="bg-[#0B192C]/80 border border-[#233D66] rounded-xl p-3.5">
              <span class="text-[11px] text-blue-300 font-bold block mb-1">👥 최소 표본 비중 제약</span>
              <div class="flex items-center justify-between">
                <span class="text-base font-black text-white">전체 대비 1.0% 이상</span>
                <span class="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/40">통계적 유의성</span>
              </div>
            </div>

            <div class="bg-[#0B192C]/80 border border-[#233D66] rounded-xl p-3.5">
              <span class="text-[11px] text-blue-300 font-bold block mb-1">🔄 전년 재현성 검증</span>
              <div class="flex items-center justify-between">
                <span class="text-base font-black text-emerald-400">필수 통과 (3개년)</span>
                <span class="text-[10px] bg-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded border border-cyan-400/40">과적합 방지</span>
              </div>
            </div>

            <div class="bg-[#0B192C]/80 border border-[#233D66] rounded-xl p-3.5">
              <span class="text-[11px] text-blue-300 font-bold block mb-1">⏱️ 탐색 주기 및 관리</span>
              <div class="flex items-center justify-between">
                <span class="text-base font-black text-white">매월 1일 정기 배치</span>
                <button type="button" onclick="showToast('설정된 제약조건으로 월간 탐색 배치를 즉시 재실행합니다.', 'info');" class="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-1 rounded transition-colors">
                  재실행 ↻
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 당월 AI 탐색 성과 KPI 카드 4종 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-slate-500 block">수만 개 전수 평가 후보</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-slate-900">${mm.stats.totalEvaluated.toLocaleString()}</span>
              <span class="text-xs font-bold text-slate-500">개 조합</span>
            </div>
            <span class="text-[11px] text-blue-600 font-bold block mt-1">파레토 프론티어 곡선 도출</span>
          </div>

          <div class="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-slate-500 block">검증 게이트 자동 기각</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-rose-600">${mm.stats.totalAutoRejected.toLocaleString()}</span>
              <span class="text-xs font-bold text-slate-500">개 (${mm.stats.rejectionRate})</span>
            </div>
            <span class="text-[11px] text-rose-500 font-bold block mt-1">표본·수익·규제 미달 탈락</span>
          </div>

          <div class="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-slate-500 block">당월 발굴 최적 SEG 안건</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-emerald-600">${mm.stats.qualifiedCount}</span>
              <span class="text-xs font-bold text-slate-500">건 (${mm.stats.targetProducts}개 상품)</span>
            </div>
            <span class="text-[11px] text-emerald-600 font-bold block mt-1">강화 7건 / 완화 5건 발굴</span>
          </div>

          <div class="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-slate-500 block">협의 리드타임 목표</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-[#0565F0]">2일</span>
              <span class="text-xs font-bold text-slate-500">(기존 20일)</span>
            </div>
            <span class="text-[11px] text-[#0565F0] font-bold block mt-1">선제 발굴로 90% 단축</span>
          </div>
        </div>

        <!-- AI 발굴 안건 리스트 (클릭 시 부서 협의로 직행) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black text-slate-900">2026년 10월 AI 자동 발굴 안건 큐 (Queue)</h2>
              <span class="text-xs font-bold text-slate-500">| 강화 대상(거절) · 완화 대상(받을)</span>
            </div>
            <span class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              안건을 선택하면 AI 분석 결과 및 RAG 협의 기억을 장착하고 [부서간 협의]로 이동합니다.
            </span>
          </div>

          <div class="grid grid-cols-1 gap-4">
            ${mm.items.map((item, idx) => `
              <div class="bg-white border-2 ${
                item.category === '강화' ? 'border-rose-300 hover:border-rose-500' : 'border-emerald-300 hover:border-emerald-500'
              } rounded-2xl p-5 shadow-sm transition-all hover:shadow-md space-y-4">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-black px-3 py-1 rounded-full border ${
                        item.category === '강화'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }">
                        ${item.categoryBadge}
                      </span>
                      <span class="text-xs font-bold font-mono text-slate-500">${item.id}</span>
                      <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        ${item.product}
                      </span>
                      <span class="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        ${item.urgency}
                      </span>
                    </div>
                    <h3 class="text-base font-black text-slate-900 mt-2">${item.title}</h3>
                    <p class="text-xs text-slate-600 font-medium mt-1">
                      🔍 <strong>발굴 사유:</strong> ${item.discoveryReason}
                    </p>
                  </div>

                  <!-- 액션 버튼: 해당 안건 내용으로 [협의 안건 작성] 화면 이동 (자동 Pre-fill) -->
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onclick="JepDaeriFlow.prepareTaskProposalFromMonitoring('${item.id}');"
                      class="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-blue-400 flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <span class="text-base">🚀</span>
                      <span>협의 시작하기 (안건 작성 팝업)</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>

                <!-- 발굴 조건 & 주요 영향도 지표 바 -->
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- 발굴 조건 태그 -->
                  <div>
                    <span class="text-[11px] font-bold text-slate-500 block mb-1.5">발굴 조건 조합 (SEG 규칙)</span>
                    <div class="flex flex-wrap gap-1.5">
                      ${item.conditions.map(c => `
                        <span class="text-xs font-bold font-mono bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
                          ${c}
                        </span>
                      `).join('')}
                    </div>
                  </div>

                  <!-- 예상 영향도 (연체율 & 승인율) -->
                  <div>
                    <span class="text-[11px] font-bold text-slate-500 block mb-1.5">예상 효과 (연체율 & 승인율)</span>
                    <div class="flex items-center gap-3">
                      <div>
                        <span class="text-[10px] text-slate-500 block">연체율 개선</span>
                        <span class="text-sm font-black ${item.category === '강화' ? 'text-rose-600' : 'text-emerald-600'}">
                          ${item.stats.delinqDelta}
                        </span>
                        <span class="text-[10px] text-slate-500 font-mono block">(${item.stats.delinqFromTo})</span>
                      </div>
                      <div class="border-l border-slate-300 pl-3">
                        <span class="text-[10px] text-slate-500 block">승인율 변동</span>
                        <span class="text-sm font-black text-slate-800">${item.stats.approvalDelta}</span>
                        <span class="text-[10px] text-blue-600 font-bold block">${item.stats.targetVolume}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 게이트 평가 & 상태 -->
                  <div>
                    <span class="text-[11px] font-bold text-slate-500 block mb-1.5">검증 게이트 평가 결과</span>
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="text-xs font-black text-slate-900">${item.evaluation.selectedRank}</span>
                        <span class="text-[11px] text-slate-600 block">후보 ${item.evaluation.evaluated.toLocaleString()}개 중 ${item.evaluation.rejected.toLocaleString()}개 기각 통과</span>
                      </div>
                      <span class="text-[11px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
                        ${item.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        ${this.renderTrustFooter()}
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 월 모니터링 안건으로 [협의 안건 작성] 서식 자동 입력 및 이동
  // -------------------------------------------------------------
  prepareTaskProposalFromMonitoring(itemId) {
    const item = state.monthlyMonitoring.items.find(it => it.id === itemId);
    if (!item) return;

    // 현재 로그인 인원에 따라 기안 부서와 수신 부서가 무조건 픽스!
    const currentAccount = (typeof ACCOUNTS !== 'undefined' && ACCOUNTS[state.currentRoleId]) || { dept: '영업기획팀', name: '최기획 대리' };
    const isSalesUser = currentAccount.dept.includes('영업');
    const requesterDept = isSalesUser ? '영업기획팀' : '신용관리팀';
    const requesterName = currentAccount.name;
    const assigneeDept = isSalesUser ? '신용관리팀' : '영업기획팀';
    const assigneeName = isSalesUser ? '이신용 대리' : '최기획 대리';
    const assignedTo = `${assigneeDept} ${assigneeName}`;

    state.taskRequest = {
      id: item.id || ('REQ-2026-10' + Math.floor(Math.random() * 80 + 10)),
      title: item.title,
      requesterDept: requesterDept,
      requesterName: requesterName,
      requestDate: new Date().toISOString().split('T')[0] + ' 10:00',
      urgency: item.urgency || '정기',
      targetProduct: item.product,
      targetMetric: isSalesUser ? 'profit' : 'delinquency',
      maxApprovalDrop: parseFloat(item.stats.approvalDelta.replace(/[^0-9.]/g, '')) || 4.2,
      minSampleSize: 1.0,
      backgroundReason: `[AI 월간 모니터링 발굴 안건 자동 연동]\n- 발굴 사유: ${item.discoveryReason}\n- 제안 조건: ${item.conditions.join(', ')}\n- 예상 영향도: 연체율 ${item.stats.delinqDelta} (${item.stats.delinqFromTo}), 승인율 ${item.stats.approvalDelta}, 손익 ${item.stats.profitImpact}\n위 모니터링 분석 내용을 바탕으로 [${requesterDept}]에서 [${assigneeDept}]으로 심사전략 협의를 공식 상정하오니 검토 및 접수 바랍니다.`,
      assignedTo: assignedTo,
      status: 'pending_receipt',
      direction: isSalesUser ? 'SALES_TO_CREDIT' : 'CREDIT_TO_SALES'
    };

    state.selectedTaskId = state.taskRequest.id;

    // tasks 목록에 해당 안건 동기화
    let existingTask = state.tasks.find(t => t.id === state.taskRequest.id);
    if (!existingTask) {
      existingTask = {
        id: state.taskRequest.id,
        title: state.taskRequest.title,
        product: state.taskRequest.targetProduct,
        requesterDept: state.taskRequest.requesterDept,
        requesterName: state.taskRequest.requesterName,
        assigneeDept: assigneeDept,
        assigneeName: assigneeName,
        requestDate: state.taskRequest.requestDate,
        urgency: state.taskRequest.urgency,
        stepNum: 1,
        stepBadge: `1단계: ${assigneeDept} 접수 대기 중`,
        status: 'pending_receipt',
        goalText: `연체율 ${item.stats.delinqDelta} / 승인율 ${item.stats.approvalDelta} 방어`,
        actionInfo: {
          CREDIT_STAFF: {
            actionName: isSalesUser ? '📥 접수 처리하기' : '📝 안건 확인 및 상정',
            targetTab: isSalesUser ? 'collaboration' : 'request',
            isMyAction: isSalesUser,
            desc: isSalesUser ? '영업기획팀 안건 접수 필요' : '신용관리팀 기안 안건'
          },
          SALES_STAFF: {
            actionName: isSalesUser ? '📝 안건 확인 및 상정' : '📥 접수 처리하기',
            targetTab: isSalesUser ? 'request' : 'collaboration',
            isMyAction: !isSalesUser,
            desc: isSalesUser ? '영업기획팀 기안 안건' : '신용관리팀 안건 접수 필요'
          },
          CREDIT_LEADER: { actionName: '검토', targetTab: 'collaboration', isMyAction: false, desc: '협의 대기' },
          RISK_HEAD: { actionName: '조회', targetTab: 'collaboration', isMyAction: false, desc: '협의 대기' },
        }
      };
      state.tasks.unshift(existingTask);
    }

    // [사용자 요청] 월 모니터링 팝업 닫고 협의 안건 작성 팝업 모달로 바로 전환!
    state.isMonthlyMonitoringModalOpen = false;
    state.isAgendaModalOpen = true;
    renderApp();
    showToast(`월 모니터링 안건 내용이 [${requesterDept} ➔ ${assigneeDept}] 협의 안건 작성 팝업에 자동 입력되었습니다.`, 'success');
  },

  // -------------------------------------------------------------
  // 안건 선택 후 협의 화면(collaboration)으로 이동
  // -------------------------------------------------------------
  startCollaborationForTask(taskId) {
    if (typeof selectTask === 'function') {
      selectTask(taskId, 'collaboration');
    } else {
      state.selectedTaskId = taskId;
      switchTab('collaboration');
    }
    showToast('선택하신 안건의 AI 분석 결과와 RAG 협의 기억을 장착하고 부서간 협의 화면으로 이동했습니다.', 'success');
  },

  // -------------------------------------------------------------
  // [분석 기준관리 (규제·제외 관리)] 팝업 모달 래퍼
  // -------------------------------------------------------------
  renderRuleMonitoringModal() {
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
        <!-- 모달 컨테이너 (스크롤 분리 및 최대 높이 94vh) -->
        <div class="bg-white border-2 border-indigo-500 rounded-3xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
          
          <!-- 1. 모달 헤더 (JB우리캐피탈 다크 네이비 테마) -->
          <div class="bg-gradient-to-r from-[#0B1B33] via-[#0F2445] to-[#15315C] text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-[#233D66] shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🛡️</span>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="bg-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border border-indigo-400 shadow-sm">
                    신용관리팀 전용 · 기준 관리 센터
                  </span>
                  <span class="text-xs font-bold text-blue-200">정부 규제(DSR·LTV) 및 사내 탐색 제외 기준 상시 관리</span>
                </div>
                <h2 class="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
                  <span>분석 기준관리: 규제 및 제외 기준 관리</span>
                </h2>
              </div>
            </div>
            
            <div class="flex items-center gap-3 shrink-0">
              <!-- 신규 기준 등록 버튼 -->
              <button
                type="button"
                onclick="JepDaeriFlow.openNewRuleModal();"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md border border-emerald-400 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>➕</span>
                <span>신규 기준 등록</span>
              </button>

              <!-- 우측 상단 닫기 X 버튼 -->
              <button
                type="button"
                onclick="closeRuleMonitoringModal();"
                class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-rose-300 flex items-center justify-center font-black text-lg transition-all border border-white/20 shrink-0"
                title="팝업 닫기"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 2. 모달 바디 (스크롤 영역) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
            ${this.renderRuleMonitoringScreen()}
          </div>

          <!-- 3. 모달 푸터 바 -->
          <div class="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>각 기준 우측 [적용 여부] 토글 스위치로 AI 전수 탐색 및 What-If 시뮬레이션 적용 여부(ON/OFF)를 즉시 변경할 수 있습니다.</span>
            </div>
            <button
              type="button"
              onclick="closeRuleMonitoringModal();"
              class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-95"
            >
              닫기
            </button>
          </div>

        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 2. [기준 모니터링] 화면 렌더러
  // 분석할 때 정부 규제나 분석 시 제외했으면 하는 내용들을 등록하고 적용할지 말지 정하는 화면
  // -------------------------------------------------------------
  renderRuleMonitoringScreen() {
    const rm = state.ruleMonitoring;
    const filteredRules = rm.rules.filter(r => {
      if (rm.filterCategory === 'ALL') return true;
      return r.category === rm.filterCategory;
    });

    const totalCount = rm.rules.length;
    const activeCount = rm.rules.filter(r => r.isActive).length;
    const regCount = rm.rules.filter(r => r.category === 'REGULATION').length;
    const excCount = rm.rules.filter(r => r.category === 'EXCLUSION').length;

    return `
      <div class="space-y-6 animate-fadeIn">
        <!-- KPI 요약 카드 4종 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-slate-500 block">총 등록된 기준</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-slate-900">${totalCount}</span>
              <span class="text-xs font-bold text-slate-500">건</span>
            </div>
            <span class="text-[11px] text-blue-600 font-bold block mt-1">규제 및 제외 룰 통합 관리</span>
          </div>

          <div class="bg-white border-2 border-emerald-300 bg-emerald-50/20 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-emerald-700 block">현재 적용 중 (ON)</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-emerald-600">${activeCount}</span>
              <span class="text-xs font-bold text-emerald-700">건 활성화</span>
            </div>
            <span class="text-[11px] text-emerald-600 font-bold block mt-1">AI 탐색 게이트 자동 반영</span>
          </div>

          <div class="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-slate-500 block">정부 외부 규제</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-indigo-600">${regCount}</span>
              <span class="text-xs font-bold text-slate-500">건</span>
            </div>
            <span class="text-[11px] text-indigo-600 font-bold block mt-1">DSR, LTV, 금소법 적정성 등</span>
          </div>

          <div class="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
            <span class="text-xs font-bold text-slate-500 block">사내 분석 제외 기준</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-purple-600">${excCount}</span>
              <span class="text-xs font-bold text-slate-500">건</span>
            </div>
            <span class="text-[11px] text-purple-600 font-bold block mt-1">우량고객 예외, 기운영 중복 방지</span>
          </div>
        </div>

        <!-- 기준 목록 및 카테고리 필터 바 -->
        <div class="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <h3 class="text-base font-black text-slate-900">등록된 규제 및 분석 제외 기준 목록</h3>
              <p class="text-xs text-slate-600 font-medium mt-0.5">스위치를 클릭하여 AI 분석 시 적용할지 말지를 즉시 결정할 수 있습니다.</p>
            </div>

            <!-- 카테고리 필터 탭 -->
            <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              ${[
                { id: 'ALL', name: '전체' },
                { id: 'REGULATION', name: '정부 규제' },
                { id: 'EXCLUSION', name: '분석 제외' },
                { id: 'INTERNAL', name: '사내 내규' }
              ].map(f => `
                <button
                  type="button"
                  onclick="state.ruleMonitoring.filterCategory='${f.id}'; renderApp();"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    rm.filterCategory === f.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }"
                >
                  ${f.name}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 테이블 목록 -->
          <div class="border-2 border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3.5 w-32">구분</th>
                  <th class="px-4 py-3.5 w-32">기준 코드</th>
                  <th class="px-4 py-3.5">기준 명칭 및 규제/제외 내용</th>
                  <th class="px-4 py-3.5 w-36">적용 대상 상품</th>
                  <th class="px-4 py-3.5 w-28 text-center">적용 여부</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                ${filteredRules.map(r => `
                  <tr class="hover:bg-slate-50/80 transition-colors ${r.isActive ? '' : 'opacity-60 bg-slate-50/40'}">
                    <td class="px-4 py-4">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-black ${
                        r.category === 'REGULATION' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                        r.category === 'EXCLUSION' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }">
                        ${r.categoryName}
                      </span>
                    </td>
                    <td class="px-4 py-4 font-mono font-bold text-slate-700">${r.code}</td>
                    <td class="px-4 py-4 space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-black text-slate-900">${r.title}</span>
                      </div>
                      <p class="text-slate-600 leading-relaxed">${r.description}</p>
                      <span class="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block font-bold">
                        사유: ${r.reason}
                      </span>
                    </td>
                    <td class="px-4 py-4 font-bold text-slate-800">${r.target}</td>
                    <td class="px-4 py-4 text-center">
                      <!-- 인터랙티브 토글 스위치 -->
                      <button
                        type="button"
                        onclick="JepDaeriFlow.toggleRuleActive('${r.id}');"
                        class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 mx-auto shadow-sm border ${
                          r.isActive
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                        }"
                      >
                        <span class="w-2 h-2 rounded-full ${r.isActive ? 'bg-white animate-pulse' : 'bg-slate-400'}"></span>
                        <span>${r.isActive ? '적용 중 (ON)' : '미적용 (OFF)'}</span>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        ${this.renderTrustFooter()}
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 기준 활성화/비활성화 토글 핸들러
  // -------------------------------------------------------------
  toggleRuleActive(ruleId) {
    const r = state.ruleMonitoring.rules.find(item => item.id === ruleId);
    if (r) {
      r.isActive = !r.isActive;
      showToast(
        r.isActive
          ? `[${r.title}] 기준이 AI 분석 적용 대상으로 활성화(ON)되었습니다.`
          : `[${r.title}] 기준이 AI 분석 적용에서 제외(OFF)되었습니다.`,
        r.isActive ? 'success' : 'info'
      );
      renderApp();
    }
  },

  // -------------------------------------------------------------
  // 신규 기준 등록 팝업 모달
  // -------------------------------------------------------------
  openNewRuleModal() {
    const title = prompt('등록할 정부 규제 또는 사내 분석 제외 기준 명칭을 입력하세요:\n(예: 청년층 우대대출 DTI 산출 예외 기준)');
    if (!title || !title.trim()) return;

    const desc = prompt('상세 내용 또는 AI 탐색 시 제외할 사유를 입력하세요:\n(예: 만 34세 이하 청년층에 대해 전세대출 DTI 5%p 완화 허용)');
    if (!desc || !desc.trim()) return;

    const newRule = {
      id: 'USR-' + Date.now(),
      code: 'USR-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900 + 100),
      category: 'EXCLUSION',
      categoryName: '🚫 분석 제외 기준',
      title: title.trim(),
      target: '가계대출 신규 적용',
      description: desc.trim(),
      reason: '사용자 수동 추가 규제 및 분석 제외 룰',
      isActive: true,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    state.ruleMonitoring.rules.unshift(newRule);
    showToast(`신규 기준 [${newRule.title}]이(가) 등록되어 AI 분석에 즉시 적용(ON)되었습니다.`, 'success');
    renderApp();
  },

  // -------------------------------------------------------------
  // 3. [부서간 협의] 상단에 삽입될 RAG 협의 기억 브리핑 렌더러
  // 기존 협의 화면의 상단에 녹아들어 PDF의 "이 서비스의 킥"을 실현!
  // -------------------------------------------------------------
  renderRagBriefingBanner() {
    const sc = state.ragCollaborationBriefing;
    return `
      <!-- ★ 이 서비스의 킥: 협의할수록 다음 협의가 짧아집니다 (PDF 요약본 핵심) -->
      <div class="bg-gradient-to-r from-[#0B1B33] via-[#142D54] to-[#0B1B33] text-white border-2 border-[#0565F0] rounded-2xl p-6 shadow-xl space-y-4 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
                ⭐ 이 서비스의 킥 (The KICK)
              </span>
              <span class="text-xs font-bold text-amber-300">지난 협의 기억(RAG) 기반 사전 준비 시스템</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white mt-2">협의할수록 다음 협의가 짧아집니다</h2>
            <p class="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed max-w-3xl">
              합의된 협의를 기록으로 쌓고, 비슷한 안이 오면 그 기록을 근거로 부서별 요구를 미리 짚어
              <strong>대응안 · 절충안을 먼저 내놓습니다.</strong> 근거가 그대로 보이는 기록이라 왜 그렇게 제안했는지 언제든 확인할 수 있습니다.
            </p>
          </div>

          <!-- 성과 지표 뱃지 -->
          <div class="bg-[#0B192C]/90 border border-[#3A8BFD]/40 rounded-xl p-4 text-center shrink-0">
            <span class="text-[11px] text-blue-300 font-bold block">대출 심사전략 리드타임</span>
            <div class="flex items-baseline justify-center gap-2 mt-1">
              <span class="text-slate-400 line-through text-sm font-bold">20일</span>
              <span class="text-2xl font-black text-emerald-400">➔ 2일</span>
            </div>
            <span class="text-[10px] text-emerald-300 font-bold block mt-0.5">첫 만남에서 바로 절충안 검토</span>
          </div>
        </div>

        <!-- 4단계 선순환 인포그래픽 바 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#1E3456]">
          <div class="bg-[#0B192C] border border-[#233D66] rounded-xl p-3 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
              <h4 class="text-xs font-black text-white">협의: 요구 교환</h4>
            </div>
            <p class="text-[11px] text-slate-300 leading-tight">영업 "취급액 감소 축소" ↔ 리스크 "연체 개선 고수"</p>
          </div>

          <div class="bg-[#0B192C] border border-[#233D66] rounded-xl p-3 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
              <h4 class="text-xs font-black text-white">기억: 부서 요구 누적</h4>
            </div>
            <p class="text-[11px] text-slate-300 leading-tight">영업 취급액 35% 이하 방어, 리스크 개선 65% 유지 (지난 4건)</p>
          </div>

          <div class="bg-[#0B192C] border border-[#233D66] rounded-xl p-3 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
              <h4 class="text-xs font-black text-white">준비: 절충안 선제 제시</h4>
            </div>
            <p class="text-[11px] text-slate-300 leading-tight">예상 요구 · 대응안 · 절충안 · 예상 질문 답을 젭대리가 먼저 제시</p>
          </div>

          <div class="bg-[#0B192C] border border-amber-500/50 rounded-xl p-3 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-[10px] font-black">4</span>
              <h4 class="text-xs font-black text-amber-300">단축: 첫 만남 절충안 검토</h4>
            </div>
            <p class="text-[11px] text-slate-300 leading-tight">왕복 핑퐁이 줄고, 결과는 다시 기억에 쌓여 다음 협의 준비!</p>
          </div>
        </div>

        <!-- 젭대리 AI 선제 절충안 & Q&A 카드 -->
        <div class="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 border border-blue-500/50 rounded-xl p-4 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-base">🤖</span>
              <div>
                <span class="text-xs font-black text-cyan-300">젭대리 AI 선제 절충안 (Golden Ratio)</span>
                <span class="text-[11px] text-slate-300 block">DTI 33% 적용 + 1~2등급 우량차주 예외 심사 허용</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-blue-200 block">양 부서 요구 적합도</span>
              <span class="text-base font-black text-emerald-400">96.5점 (영업 92% / 신용 96% 충족)</span>
            </div>
          </div>

          <!-- 예상 질문 & 즉답 카드 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-900/60">
            ${sc.preQnA.map(qa => `
              <div class="bg-black/30 rounded-lg p-2.5 space-y-1 border border-blue-500/20">
                <p class="font-bold text-amber-300">${qa.q}</p>
                <p class="text-slate-200 text-[11px] leading-relaxed">${qa.a}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 하단 공통 배너: 믿을 수 있는 이유 (PDF 하단 6대 원칙)
  // -------------------------------------------------------------
  renderTrustFooter() {
    const reasons = [
      { icon: '🔢', title: '숫자는 엔진만', desc: 'LLM은 말 ↔ 조건 변환 및 요약만. 모든 정밀 수치 연산과 시뮬레이션은 전수 엔진만 수행합니다.' },
      { icon: '📋', title: '버린 후보엔 사유', desc: '기각된 7,803개 조건 조합마다 5대 게이트별 탈락 사유(표본/연체/수익 등)를 100% 투명 공개합니다.' },
      { icon: '👤', title: '사람이 확인 후 실행', desc: 'AI 분석 결과는 담당자가 검토 및 확인 버튼을 누른 후에만 전수 탐색 및 부서 협의로 상정됩니다.' },
      { icon: '🔒', title: '자동 반영 없음', desc: '시스템 임의 기준 변경 금지. 채택된 기준은 정식 사내 전자결재 승인을 통해서만 조직의 기준으로 등록됩니다.' },
      { icon: '🎯', title: '같은 질문 = 같은 숫자', desc: '결정론적 알고리즘으로 백테스트 및 시뮬레이션을 수행하므로, 언제나 동일한 입력엔 동일한 결과를 보장합니다.' },
      { icon: '📊', title: '실측 빅데이터 기준', desc: 'K-캐피탈 18.4만 건 실제 차주 빅데이터 파레토 프론티어 곡선을 기준으로 검증된 최적안만 제시합니다.' }
    ];

    return `
      <div class="mt-8 bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">신뢰와 투명성</span>
            <h3 class="text-sm font-black text-slate-900">젭대리를 믿을 수 있는 6가지 이유</h3>
          </div>
          <span class="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            수치는 시연용 가상 데이터 (K-캐피탈) 기준
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          ${reasons.map(r => `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-blue-400 transition-all">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-base">${r.icon}</span>
                <h4 class="text-xs font-black text-slate-900">${r.title}</h4>
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed font-medium">${r.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};
