/**
 * 젭대리 (Biz.Platform) - AI 여신심사전략 운영 플랫폼
 * [영업기획팀 의뢰 ➔ 신용관리팀 AI 탐색 & 자연어 튜닝 ➔ 부서간 협의 ➔ 전자결재 상신]
 * 역할별(5개 계정) 메뉴 접근제어 & JDBP 브랜딩 적용 엔터프라이즈 에디션
 */

// 4대 사용자 계정 및 부서별 메뉴 권한 정의 (Role-Based Access Control)
const ACCOUNTS = {
  SALES_STAFF: {
    id: 'SALES_STAFF',
    name: '최기획 대리',
    dept: '영업기획팀',
    roleLabel: '영업기획팀 최기획 대리',
    avatar: '최',
    avatarBg: 'bg-amber-600',
    allowedTabs: ['taskList', 'collaboration'],
    tabTitles: {
      taskList: { num: '목록', tag: '업무현황', title: '진행 업무 목록 (To-Do)' },
      collaboration: { num: 1, tag: '다자간 협의', title: '부서간 협의 (AI 시뮬레이션 & 토의)' },
    },
    defaultTab: 'taskList',
  },
  CREDIT_STAFF: {
    id: 'CREDIT_STAFF',
    name: '이신용 대리',
    dept: '신용관리팀',
    roleLabel: '신용관리팀 이신용 대리',
    avatar: '이',
    avatarBg: 'bg-blue-600',
    allowedTabs: ['taskList', 'collaboration', 'approval'],
    tabTitles: {
      taskList: { num: '목록', tag: '업무현황', title: '진행 업무 목록 (To-Do)' },
      collaboration: { num: 1, tag: '다자간 협의', title: '부서간 협의 (AI 시뮬레이션 & 토의)' },
      approval: { num: 2, tag: '협의완료', title: '심사전략 품의서 초안' },
    },
    defaultTab: 'taskList',
  },
  CREDIT_LEADER: {
    id: 'CREDIT_LEADER',
    name: '박심사 팀장',
    dept: '신용관리팀',
    roleLabel: '신용관리팀 박심사 팀장',
    avatar: '박',
    avatarBg: 'bg-blue-700',
    allowedTabs: ['taskList', 'collaboration'],
    tabTitles: {
      taskList: { num: '목록', tag: '업무현황', title: '진행 업무 목록 (To-Do)' },
      collaboration: { num: 1, tag: '다자간 협의', title: '부서간 협의 (검토 및 의견 제시)' },
    },
    defaultTab: 'taskList',
  },
  RISK_HEAD: {
    id: 'RISK_HEAD',
    name: '최본부장',
    dept: '신용관리본부',
    roleLabel: '신용관리본부 최본부장',
    avatar: '최',
    avatarBg: 'bg-purple-700',
    allowedTabs: ['taskList', 'collaboration'],
    tabTitles: {
      taskList: { num: '목록', tag: '업무현황', title: '진행 업무 목록 (To-Do)' },
      collaboration: { num: 1, tag: '다자간 협의', title: '부서간 협의 (본부 검토의견·지시)' },
    },
    defaultTab: 'taskList',
  },
};

// Application Central Store
const state = {
  currentRoleId: 'SALES_STAFF', // Default to 영업기획팀 담당자 (최기획 대리)
  currentTab: 'taskList', // 첫 화면은 진행 업무 목록 (To-Do) 복원!
  taskFilter: 'ALL', // ALL, STEP1, STEP2, STEP3
  selectedTaskId: 'REQ-2026-1011-042',
  isAccountMenuOpen: false, // 계정 전환 메뉴 팝오버 상태
  isAgendaModalOpen: false, // [신규] 협의 안건 작성 전용 팝업 모달 상태
  isMonthlyMonitoringModalOpen: false, // [신규] 월 정기 모니터링 발굴 안건 전용 팝업 모달 상태
  isRuleMonitoringModalOpen: false, // [신규] 분석 기준관리(규제·제외 관리) 전용 팝업 모달 상태
  isMobileModalOpen: false, // 모바일 접속 QR/URL 안내 모달
  isAgreed: false,
  isSubmitted: false,
  docNumber: 'JB-CR-2026-1011-042',
  collabSegChartMetric: 'combo', // SEG 분포 차트 탭: 'combo', 'ratio', 'delinquency', 'profit'

  // 상세 검색 조건 (등록일자, 진행상태 다중선택 콤보박스, 내 처리 대기건)
  searchFilter: {
    dateFrom: '2026-10-01', // 등록일자 From (기본값: 이번달 당월)
    dateTo: '2026-10-31',   // 등록일자 To (기본값: 이번달 당월)
    datePreset: 'CURRENT_MONTH', // 'CURRENT_MONTH', 'LAST_3_MONTHS', 'ALL', 'CUSTOM'
    statusInProgress: true, // 진행상태: 진행중
    statusCompleted: true,  // 진행상태: 완료
    isStatusDropdownOpen: false, // 진행상태 다중선택 콤보박스 열림 여부
    onlyMyAction: false,    // 내가 처리해야 할 건 (Action) 검색조건
  },

  // 전 부서 진행 업무 현황 (To-Do 목록, 다자간 협의 중심 파이프라인)
  tasks: [
    {
      id: 'REQ-2026-1011-042',
      title: '[긴급] PL 신용대출 36개월물 연체율 급등 대응 및 심사기준 개편 의뢰',
      product: 'PL 신용대출 36개월물',
      requesterDept: '영업기획팀',
      requesterName: '최기획 대리',
      assigneeDept: '신용관리팀',
      assigneeName: '이신용 대리',
      requestDate: '2026-10-11 10:10',
      urgency: '긴급',
      stepNum: 2,
      stepBadge: '2단계: 다자간 부서 협의 진행 중',
      status: 'collaborating',
      goalText: '연체율 -1.5%p 감소 / 승인율 -5.0%p 이내 방어',
      actionInfo: {
        CREDIT_STAFF: { actionName: '🤝 다자간 부서 협의 참여 (What-If)', targetTab: 'collaboration', isMyAction: true, desc: 'AI 5대 최적안 검토 및 다자간 의견 조율' },
        SALES_STAFF: { actionName: '💬 영업의견 조율 참여', targetTab: 'collaboration', isMyAction: true, desc: '1~2등급 우량차주 예외 적용 시뮬레이션 참여' },
        CREDIT_LEADER: { actionName: '📋 부서 협의안 검토', targetTab: 'collaboration', isMyAction: false, desc: '다자간 의견 조율 및 전략 타당성 검토' },
        RISK_HEAD: { actionName: '📊 전 부서 합의 현황 조회', targetTab: 'collaboration', isMyAction: false, desc: '협의 진행 경과 확인' },
      }
    },
    {
      id: 'REQ-2026-1010-040',
      title: '[협의진행] 중금리 대환대출 DSR 40% 차등 적용 및 우대금리 협의',
      product: '중금리 햇살론 대환 48개월물',
      requesterDept: '영업기획팀',
      requesterName: '최기획 대리',
      assigneeDept: '신용관리팀',
      assigneeName: '이신용 대리',
      requestDate: '2026-10-10 15:30',
      urgency: '높음',
      stepNum: 2,
      stepBadge: '2단계: 다자간 부서 협의 진행 중',
      status: 'collaborating',
      goalText: '승인율 +2.5%p 확대 / 연체율 +0.2%p 이내 방어',
      actionInfo: {
        SALES_STAFF: { actionName: '💬 영업의견 조율 참여', targetTab: 'collaboration', isMyAction: true, desc: '우량차주 예외 적용 시뮬레이션 참여' },
        CREDIT_STAFF: { actionName: '📊 What-If 시뮬레이션 산출', targetTab: 'collaboration', isMyAction: true, desc: '영업기획팀 완화 요청안 영향도 산출 중' },
        CREDIT_LEADER: { actionName: '📋 부서 협의안 검토', targetTab: 'collaboration', isMyAction: false, desc: '부서간 최종 합의안 검토 대기' },
        RISK_HEAD: { actionName: '📊 전 부서 합의 현황 조회', targetTab: 'collaboration', isMyAction: false, desc: '다자간 협의 진행 경과 확인' },
      }
    },
    {
      id: 'REQ-2026-1008-038',
      title: '[정기] 2026년 하반기 직장인 신용대출 KCB/NICE 신용점수 컷오프(Cut-off) 재조정',
      product: '직장인 스마트 신용대출',
      requesterDept: '영업기획팀',
      requesterName: '최기획 대리',
      assigneeDept: '신용관리팀',
      assigneeName: '이신용 대리',
      requestDate: '2026-10-08 14:20',
      urgency: '완료',
      stepNum: 2,
      stepBadge: '2단계: 다자간 부서 협의 완료 (합의 확정)',
      status: 'agreed',
      goalText: '승인율 +1.8%p 확대 / 연체율 +0.1%p 이내 방어',
      actionInfo: {
        CREDIT_STAFF: { actionName: '📝 품의서 초안 작성하기', targetTab: 'approval', isMyAction: true, desc: '부서간 최종 합의 완료 ➔ 심사전략 품의서 초안 작성 진행' },
        CREDIT_LEADER: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '부서간 최종 합의 완료됨' },
        RISK_HEAD: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '전 부서 최종 합의 완료 확인' },
        SALES_STAFF: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '영업 합의 반영 완료' },
      }
    },
    {
      id: 'REQ-2026-1011-045',
      title: '[신상품] 청년·신혼부부 전세자금대출 특화 DSR 우대 심사규칙 신설 의뢰',
      product: '청년 맞춤형 버팀목 전세대출',
      requesterDept: '영업기획팀',
      requesterName: '최기획 대리',
      assigneeDept: '신용관리팀',
      assigneeName: '이신용 대리',
      requestDate: '2026-10-11 11:30',
      urgency: '높음',
      stepNum: 1,
      stepBadge: '1단계: 업무요건 의뢰 및 접수 (AI 최적안 분석완료)',
      status: 'submitted',
      goalText: '취급액 500억 달성 / 청년층 우대 DSR 45% 허용',
      actionInfo: {
        SALES_STAFF: { actionName: '⏳ 상대방 접수 대기', targetTab: 'collaboration', isMyAction: false, desc: '신용관리팀 접수 대기 중' },
        CREDIT_STAFF: { actionName: '📥 협의 안건 접수 처리하기', targetTab: 'collaboration', isMyAction: true, desc: '영업기획팀 상정 안건 확인 ➔ 다자간 협의에서 접수 처리' },
        CREDIT_LEADER: { actionName: '접수 대기', targetTab: 'collaboration', isMyAction: false, desc: '신용관리팀 담당자 접수 처리 대기' },
        RISK_HEAD: { actionName: '안건 조회', targetTab: 'collaboration', isMyAction: false, desc: '초기 요건 검토 중' },
      }
    },
    {
      id: 'REQ-2026-0925-029',
      title: '[제도변경] 자동차 오토론 다중채무 차주 DTI 한도 차등 적용안',
      product: 'JB 오토론 (신차/중고차)',
      requesterDept: '영업기획팀',
      requesterName: '최기획 대리',
      assigneeDept: '신용관리팀',
      assigneeName: '이신용 대리',
      requestDate: '2026-09-25 09:15',
      urgency: '완료',
      stepNum: 2,
      stepBadge: '2단계: 다자간 부서 협의 완료',
      status: 'agreed',
      goalText: '연체율 -0.8%p 개선 / 최종 합의 확정',
      actionInfo: {
        CREDIT_STAFF: { actionName: '📜 품의서 초안 확인', targetTab: 'approval', isMyAction: false, desc: '부서 합의 완료안 품의서 초안 확인 가능' },
        RISK_HEAD: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '다자간 부서 합의 완료' },
        CREDIT_LEADER: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '다자간 부서 합의 완료' },
        SALES_STAFF: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '다자간 부서 합의 완료' },
      }
    },
    {
      id: 'REQ-2026-0918-015',
      title: '[사후관리] 개인사업자 SOHO 보증서 대출 부결 축소 및 금리우대 전략',
      product: 'SOHO 희망보증대출',
      requesterDept: '영업기획팀',
      requesterName: '최기획 대리',
      assigneeDept: '신용관리팀',
      assigneeName: '박심사 팀장',
      requestDate: '2026-09-18 16:00',
      urgency: '완료',
      stepNum: 2,
      stepBadge: '2단계: 다자간 부서 협의 완료',
      status: 'agreed',
      goalText: '승인율 +3.2%p 확대 / 손익 +3.5억원 달성',
      actionInfo: {
        CREDIT_STAFF: { actionName: '📜 품의서 초안 확인', targetTab: 'approval', isMyAction: false, desc: '부서 합의 완료안 품의서 초안 확인 가능' },
        RISK_HEAD: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '다자간 부서 합의 완료' },
        CREDIT_LEADER: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '다자간 부서 합의 완료' },
        SALES_STAFF: { actionName: '🤝 부서 합의안 확인', targetTab: 'collaboration', isMyAction: false, desc: '다자간 부서 합의 완료' },
      }
    }
  ],
  
  // 1. 업무 요청 (영업기획팀 ➔ 신용관리팀)
  taskRequest: {
    id: 'REQ-2026-1011-042',
    title: '[긴급] PL 신용대출 36개월물 연체율 급등 대응 및 심사기준 개편 의뢰',
    requesterDept: '영업기획팀',
    requesterName: '최기획 대리',
    requestDate: '2026-10-11 10:10',
    urgency: '긴급',
    targetProduct: 'PL 신용대출 36개월물',
    targetMetric: 'delinquency',
    maxApprovalDrop: 5.0,
    minSampleSize: 1.0,
    backgroundReason: '최근 다중채무 차주의 단기 신용조회 급증으로 36개월물 신용대출의 연체전이율이 2.8%로 상승세에 있습니다. 영업 취급 타격을 최소화(-5.0%p 이내 방어)하면서 연체율을 선제 차단할 수 있는 심사기준 개편안을 신용관리팀에서 검토해 주시기 바랍니다.',
    assignedTo: '신용관리팀 이신용 대리',
    status: 'ai_completed',
  },
  isAiPreAnalyzing: false,
  showAssigneeAlert: false,

  // 2. 전략 탐색 및 자연어 대화 (신용관리팀 워크스페이스)
  constraint: {
    targetMetric: 'delinquency',
    maxApprovalDrop: 5.0,
    minSampleSize: 1.0,
    targetProduct: 'PL 신용대출 36개월물',
  },
  isSearching: false,
  selectedStrategyId: 'strat-2',
  strategies: [
    {
      id: 'strat-1',
      name: '안 1 · 건전성 최우선안',
      subtitle: '연체율을 가장 강력하게 낮추는 리스크 선제 방어 기준',
      ruleDescription: 'DTI 28% 초과 OR 최근 6개월 조회 4건 이상 ➔ 부결',
      delinquencyDiff: -2.2,
      approvalDiff: -4.8,
      profitDiff: 2.8,
      targetCount: 16840,
      validations: {
        sampleValid: true,
        ootValid: true,
        maturityValid: true,
      },
      isRecommended: false,
      tag: '건전성 방어',
    },
    {
      id: 'strat-2',
      name: '안 2 · 균형 권장안',
      subtitle: '연체율 감소와 영업 실적 방어를 모두 충족하는 황금 밸런스안',
      ruleDescription: 'DTI 30% 초과 AND 최근 6개월 조회 3건 이상 ➔ 부결',
      delinquencyDiff: -1.5,
      approvalDiff: -3.1,
      profitDiff: 4.0,
      targetCount: 14820,
      validations: {
        sampleValid: true,
        ootValid: true,
        maturityValid: true,
      },
      isRecommended: true,
      tag: '★ AI 1순위 추천',
    },
    {
      id: 'strat-3',
      name: '안 3 · 영업수익 보존안',
      subtitle: '취급액을 최대한 유지하여 이자이익을 극대화하는 영업 친화안',
      ruleDescription: 'DTI 34% 초과 AND 최근 6개월 조회 5건 이상 ➔ 부결',
      delinquencyDiff: -0.8,
      approvalDiff: -1.6,
      profitDiff: 5.6,
      targetCount: 11200,
      validations: {
        sampleValid: true,
        ootValid: false,
        maturityValid: true,
      },
      isRecommended: false,
      tag: '수익성 극대화',
    },
    {
      id: 'strat-4',
      name: '안 4 · 1~2등급 우량차주 보호안',
      subtitle: '다중채무는 차단하되 고신용 우량고객 이탈을 방어하는 특화안',
      ruleDescription: 'DTI 30% 초과 & 6개월 조회 3건 이상 부결 (단, 1~2등급 우량고객 예외 허용)',
      delinquencyDiff: -1.3,
      approvalDiff: -2.2,
      profitDiff: 4.8,
      targetCount: 14678,
      validations: {
        sampleValid: true,
        ootValid: true,
        maturityValid: true,
      },
      isRecommended: false,
      tag: '영업기획팀 권장',
    },
    {
      id: 'strat-5',
      name: '안 5 · 다중채무 선제차단안',
      subtitle: '타기관 단기 조회 급증 차주를 집중 통제하는 건전성 특화안',
      ruleDescription: '최근 6개월 타기관 신용조회 3건 이상 차주 원천 차단',
      delinquencyDiff: -1.8,
      approvalDiff: -3.6,
      profitDiff: 3.5,
      targetCount: 13950,
      validations: {
        sampleValid: true,
        ootValid: true,
        maturityValid: true,
      },
      isRecommended: false,
      tag: '다중채무 차단',
    },
  ],

  // 각 부서별 최종 안건 결과 (부서간 협의 화면 표시용)
  departmentProposals: {
    sales: {
      dept: '영업기획팀',
      author: '최기획 대리 / 김영업 팀장',
      badge: '수익·우량고객 보존안',
      badgeColor: 'amber',
      name: '영업기획팀 최종안: 1~2등급 우량고객 예외 허용 및 DTI 32% 완화안',
      rule: 'DTI 32% 초과 & 최근 6개월 조회 3건 이상 부결 (단, 심사등급 1~2등급 우량고객 일괄 예외 승인)',
      rationale: '1~2등급 우량 차주 타행 이탈 방어(142명 보존) 및 DTI 32% 완화를 통한 분기 취급 잔액 및 순이자마진(NIM) 극대화',
      metrics: {
        approvalDiff: -1.9,
        delinquencyDiff: -1.1,
        profitDiff: 4.4,
        targetCount: 14210,
      },
      status: '제안완료',
      updatedAt: '10:28',
    },
    credit: {
      dept: '신용관리팀',
      author: '이신용 대리 / 박심사 팀장',
      badge: '건전성 리스크 선제방어안',
      badgeColor: 'blue',
      name: '신용관리팀 최종안: 단기조회 3건 및 DTI 30% 엄격 차단안',
      rule: 'DTI 30% 초과 & 최근 6개월 조회 3건 이상 ➔ 전체 부결 (예외 없음, 엄격 적용)',
      rationale: '고금리 장기화에 따른 다중채무 차주 부실 전이를 조기 차단하여 연체율 개선폭(-1.5%p)을 극대화하고 리스크 비용 절감',
      metrics: {
        approvalDiff: -3.1,
        delinquencyDiff: -1.5,
        profitDiff: 4.0,
        targetCount: 14820,
      },
      status: '제안완료',
      updatedAt: '10:15',
    },
  },
  selectedFinalSlot: 'sales', // 책정될 최종안 슬롯 ('sales' | 'credit')

  // AI 자연어 분석 & 최종안 도출 팝업 모달 State (What-If Lab 팝업)
  isAiWhatIfModalOpen: false,
  aiWhatIfTargetSlot: 'agreed', // 'sales' | 'credit' | 'agreed'
  aiWhatIfInputText: '',
  aiWhatIfIsRunning: false,
  aiWhatIfHistory: [
    {
      id: 'wh-1',
      sender: 'user',
      query: '1~2등급 우량고객은 예외로 인정해주고 손익과 승인율 다시 계산해줘',
      timestamp: '10:25',
    },
    {
      id: 'wh-2',
      sender: 'ai',
      result: {
        name: '1~2등급 우량고객 예외 허용 절충안',
        rule: 'DTI 30% 초과 & 6개월 조회 3건 이상 부결 (단, 1~2등급 우량 차주 제외 및 정상 승인)',
        approvalDiff: -2.2,
        delinquencyDiff: -1.3,
        profitDiff: 4.8,
        targetCount: 14678,
        summary: '1~2등급 우량고객 142명을 예외 처리하면 승인율이 -3.1%p에서 -2.2%p로 +0.9%p 회복되며, 당기순익은 +4.0억에서 +4.8억(+8천만 원 추가)으로 대폭 개선됩니다. 1~2등급 기대연체율은 0.12%로 전체 건전성에 미치는 악영향이 없습니다.',
        verdict: 'OOT 백테스트 통과 / 단조성 만족 / 표본 검증 완료 (AUC 0.841)',
      },
      timestamp: '10:26',
    },
  ],
  aiWhatIfCandidate: {
    name: '1~2등급 우량고객 예외 허용 절충안',
    rule: 'DTI 30% 초과 & 6개월 조회 3건 이상 부결 (단, 1~2등급 우량 차주 제외 및 정상 승인)',
    rationale: '1~2등급 우량차주 142명 보존으로 이탈 방지 및 순익 +4.8억 확보, 연체율 -1.3%p 개선 달성',
    approvalDiff: -2.2,
    delinquencyDiff: -1.3,
    profitDiff: 4.8,
    targetCount: 14678,
    verdict: '검증 적합 (AUC 0.841, 단조성 정상)',
    sourcePrompt: '1~2등급 우량고객은 예외로 인정해주고 손익과 승인율 다시 계산해줘',
  },

  // 협의 토의방 의견 입력
  collabCommentInput: '',

  // 3. 부서간 협의 State
  filterMode: 'exclude_grade_1_2',
  customDti: 30,
  customInquiry: 3,
  breakdownRows: [
    {
      groupName: '1~2등급 (최우량 고객군)',
      count: 142,
      ratio: 0.95,
      delinquencyRate: 0.12,
      profitContribution: 1.45,
      actionVerdict: '제외 검토',
      isInsufficientSample: true,
      note: '우량 고객군 (일괄 부결 시 타행 이탈 위험)',
    },
    {
      groupName: '3등급 (우량 고객군)',
      count: 2180,
      ratio: 14.71,
      delinquencyRate: 0.88,
      profitContribution: 1.92,
      actionVerdict: '유지',
      isInsufficientSample: false,
      note: '핵심 주력 고객군',
    },
    {
      groupName: '4등급 (일반 고객군)',
      count: 4320,
      ratio: 29.15,
      delinquencyRate: 1.64,
      profitContribution: 1.84,
      actionVerdict: '유지',
      isInsufficientSample: false,
      note: '적정 마진 유지 구간',
    },
    {
      groupName: '5등급 (중위험 고객군)',
      count: 5120,
      ratio: 34.55,
      delinquencyRate: 2.85,
      profitContribution: 0.24,
      actionVerdict: '부결',
      isInsufficientSample: false,
      note: '다중채무 조회 누적 시 연체 전이 가능성 높음',
    },
    {
      groupName: '6등급 (고위험 고객군)',
      count: 2340,
      ratio: 15.79,
      delinquencyRate: 4.95,
      profitContribution: -0.85,
      actionVerdict: '부결',
      isInsufficientSample: false,
      note: '손익 적자 유발 구간으로 차단 필수',
    },
    {
      groupName: '7등급 이하 (초고위험)',
      count: 718,
      ratio: 4.85,
      delinquencyRate: 7.80,
      profitContribution: -0.60,
      actionVerdict: '부결',
      isInsufficientSample: false,
      note: '연체율 7.8%로 즉시 부결 대상',
    },
  ],
  comparison: {
    initial: {
      name: '처음 추천안 (안 2 · 균형)',
      rule: 'DTI 30% 초과 & 6개월 조회 3건 이상 ➔ 전체 부결',
      targetCount: 14820,
      approvalDiff: -3.1,
      delinquencyDiff: -1.5,
      profitDiff: 4.0,
    },
    modified: {
      name: '부서 합의안 (1~2등급 우량고객 예외 허용)',
      rule: 'DTI 30% 초과 & 6개월 조회 3건 이상 부결 (단, 1~2등급 우량고객 제외)',
      targetCount: 14678,
      approvalDiff: -2.2,
      delinquencyDiff: -1.3,
      profitDiff: 4.8,
    },
    delta: {
      countDiff: -142,
      approvalRecovery: 0.9,
      delinquencyPenalty: 0.2,
      profitGain: 0.8,
    },
  },
  discussions: [
    {
      id: 'disc-1',
      department: '영업기획팀',
      userName: '김영업 팀장',
      userRole: '요청부서',
      timestamp: '10:25',
      message: '안 2(균형안)의 건전성 개선 효과는 우수하나, 1~2등급 우량 고객까지 DTI 30%로 일괄 부결 시 타행으로의 고객 이탈이 우려됩니다. 1~2등급 예외 적용 시뮬레이션을 요청합니다.',
      queryType: 'filter_change',
    },
    {
      id: 'disc-2',
      department: '젭대리 AI',
      userName: '리스크엔진',
      userRole: 'AI 분석',
      timestamp: '10:26',
      message: '1~2등급 우량고객 142명 예외 적용 결과: 승인율이 -3.1%p에서 -2.2%p로 0.9%p 회복되며, 이자수익 보전으로 순이익은 +4.8억 원으로 0.8억 원 추가 개선됩니다. 1~2등급 기대연체율은 0.12%로 전체 건전성에 미치는 영향은 미미합니다.',
      queryType: 'drill_down',
    },
    {
      id: 'disc-3',
      department: '상품개발팀',
      userName: '박상품 팀장',
      userRole: '협의부서',
      timestamp: '10:32',
      message: '우량고객 예외 적용 시 분기 대출 취급 잔액 및 순이자마진(NIM) 방어가 가능합니다. 상품개발팀은 해당 수정안에 동의합니다.',
      queryType: 'agreement',
    },
    {
      id: 'disc-4',
      department: '신용관리팀',
      userName: '이신용 대리',
      userRole: '담당부서',
      timestamp: '10:40',
      message: '1~2등급은 표본 부족 구간이므로 예외 심사 규정을 두는 것이 통계적으로도 유의미합니다. 전 부서 합의에 따라 최종 품의서를 작성하겠습니다.',
      queryType: 'agreement',
    },
  ],

  // 4. 전자결재 품의서 State
  draft: {
    title: '[심사전략 변경 품의] PL 신용대출 36개월물 DTI 및 단기신용조회 심사기준 개편(안)',
    reason: '고금리 장기화에 따른 다중채무 차주의 부실 연체를 선제 차단하고, 1~2등급 우량 차주 이탈을 방지하여 연체율 개선과 당기순이익 극대화를 동시에 달성하고자 함.',
    finalRule: 'DTI 30% 초과 AND 최근 6개월 조회 3건 이상 ➔ 부결 (단, 심사등급 1~2등급 우량 차주는 제외 검토 및 정상 취급)',
    expectedImpact: {
      approvalDiff: -2.2,
      delinquencyDiff: -1.3,
      profitDiff: 4.8,
    },
    validationSummary: [
      '표본 대표성 검증: 모수 14,678건 (취급액 대비 7.97% 충족, 최소 기준 1.0% 초과)',
      'OOT 백테스트 검증: 2025Q4~2026Q1 표본 대상 예측 일치도 AUC 0.841 기록',
      '성숙도 검정: 대출 실행 후 6개월 경과 코호트 연체전이율 이상 징후 없음 확인',
      '단조성 검정: DTI 및 신용조회건수 증가에 따른 연체율 상승 단조 원칙 정상 충족',
    ],
    discussionHistory: [
      '영업기획팀: 1~2등급 우량차주 이탈 방지 요청 ➔ AI 시뮬레이션 반영 (승인율 +0.9%p 회복, 순익 +8천만 원 확보)',
      '상품개발팀: 분기 취급 잔액 및 순이자마진(NIM) 유지 요건 확인 후 최종 동의',
      '신용관리팀: OOT 및 통계적 유의성 재검증 통과, 전 부서 합의 완료에 따라 결재 상신',
    ],
    effectiveDate: '2026년 11월 1일(일) 00:00 부',
    status: 'draft',
  },
  approvalGraphTab: 'all', // 'all', 'grades', 'impact'
  isEditModalOpen: false,
  isAiEditModalOpen: false, // 초안 내용 AI 자연어 수정 모달
  aiEditStep: 'input', // 'input' (1단계 지시 및 대상 항목 선택) | 'preview' (2단계 수정 전후 비교 및 최종 확인)
  aiEditInputText: '', // AI 수정 자연어 지시 입력 텍스트
  isAiEditingDraft: false, // AI 자연어 수정 진행 중 로딩 상태
  aiEditTargets: {
    title: true,     // 품의 제목 (건명)
    reason: true,    // 변경 사유 (추진 배경 및 목적)
    finalRule: true, // 변경 내용 (심사 규칙 고도화안)
  },
  aiEditProposal: {
    title: '',
    reason: '',
    finalRule: '',
    prompt: '',
  },

  // 6. AI 에이전트 핵심 모듈 I/O 연동 관리 State (상대방 모듈 제작 연계용)
  aiApiConfig: {
    mode: 'MOCK', // 'MOCK' (상대방 제작 중 기본값) | 'API' (실서버 연동 모드)
    baseUrl: 'http://localhost:8000/api/v1',
    apiKey: '',
    timeoutMs: 8000,
    status: 'ready', // 'ready' | 'connected' | 'error' | 'mock'
    autoFallbackToMock: true,
    lastTestedAt: null,
    activeTab: 'specs', // 'specs' (I/O 명세서) | 'config' (연동 설정) | 'packets' (패킷 검사기)
    selectedSpecEndpoint: 'pre-analyze', // 'pre-analyze' | 'simulate-whatif' | 'refine-draft'
  },
  isAiModuleModalOpen: false,
  aiPacketLogs: [
    {
      id: 'pkt-init',
      endpoint: '/api/v1/ai/pre-analyze',
      method: 'POST',
      timestamp: '2026-10-14 10:10:02',
      status: 200,
      mode: 'MOCK',
      latencyMs: 380,
      requestPayload: {
        taskId: 'REQ-2026-1011-042',
        targetProduct: 'PL 신용대출 36개월물',
        targetMetric: 'delinquency',
        constraints: {
          maxApprovalDrop: 3.0,
          minSampleSizeRatio: 1.0,
          ootValidationRequired: true,
        },
        backgroundReason: '고금리 장기화에 따른 다중채무 차주 부실 연체 선제 차단 및 우량차주 이탈 방지',
        requester: { department: '영업기획팀', name: '최기획 대리' }
      },
      responsePayload: {
        status: 'SUCCESS',
        analyzedSampleCount: 184200,
        analysisDurationMs: 380,
        engineVersion: 'JDBP-AI-Core-v2.4',
        strategiesCount: 3,
        summary: '18.4만 건 빅데이터 파레토 최적화 3대 추천 전략 도출 완료'
      }
    }
  ],

  // 5. 변수 사전 State
  varSearch: '',
  varCategory: '전체',
  selectedVariableModal: null,
  variables: [
    {
      id: 'VAR_DTI_RATIO',
      nameKo: '총부채원리금상환비율 (DTI)',
      category: '부채비율',
      easyExplain: '연간 총소득 대비 모든 금융기관 부채 원리금 상환액 비율',
      calcLogic: '(연간 원리금상환예정액 / 연소득) * 100',
      monotonicityStatus: '정상 (수치가 클수록 연체율 증가)',
      sampleAdequacy: '적합 (99.8%)',
      bins: [
        { bin: '0% ~ 20%', count: 48500, delinquencyRate: 0.35, riskLevel: '우량' },
        { bin: '20% ~ 30%', count: 62400, delinquencyRate: 0.82, riskLevel: '안전' },
        { bin: '30% ~ 40%', count: 41200, delinquencyRate: 2.15, riskLevel: '주의 (연체 위험)' },
        { bin: '40% 초과', count: 32100, delinquencyRate: 5.84, riskLevel: '고위험 (부결)' },
      ],
    },
    {
      id: 'VAR_CB_INQ_6M',
      nameKo: '최근 6개월 신용조회건수',
      category: '신용조회',
      easyExplain: '최근 180일간 2금융권 포함 단기 신용조회 발생 횟수',
      calcLogic: 'COUNT(CB_INQUIRY_DATE >= TODAY - 180)',
      monotonicityStatus: '정상 (조회가 잦을수록 연체율 급증)',
      sampleAdequacy: '적합 (99.8%)',
      bins: [
        { bin: '0건 ~ 1건', count: 82000, delinquencyRate: 0.42, riskLevel: '우량' },
        { bin: '2건 ~ 3건', count: 54000, delinquencyRate: 1.45, riskLevel: '정상' },
        { bin: '4건 ~ 5건', count: 28000, delinquencyRate: 3.80, riskLevel: '주의 (연체 급증)' },
        { bin: '6건 이상', count: 20200, delinquencyRate: 8.20, riskLevel: '고위험 (부결)' },
      ],
    },
    {
      id: 'VAR_MULTI_DEBT_CNT',
      nameKo: '다중채무 금융기관수',
      category: '다중채무',
      easyExplain: '현재 대출 잔액이 남아있는 여신 취급 금융기관 총 개수',
      calcLogic: 'COUNT_DISTINCT(INSTITUTION_CODE WHERE BALANCE > 0)',
      monotonicityStatus: '정상 (기관수가 많을수록 부실 위험)',
      sampleAdequacy: '적합 (99.8%)',
      bins: [
        { bin: '1개사', count: 65000, delinquencyRate: 0.51, riskLevel: '안전' },
        { bin: '2개사', count: 58000, delinquencyRate: 1.20, riskLevel: '정상' },
        { bin: '3개사', count: 39000, delinquencyRate: 3.10, riskLevel: '주의' },
        { bin: '4개사 이상', count: 22200, delinquencyRate: 6.90, riskLevel: '고위험' },
      ],
    },
    {
      id: 'VAR_CARD_UTIL_RATE',
      nameKo: '신용카드 한도 소진율',
      category: '금융이력',
      easyExplain: '보유 신용카드 총 부여한도 대비 최근 3개월 평균 이용잔액 비율',
      calcLogic: '(AVG(BALANCE_3M) / TOTAL_LIMIT) * 100',
      monotonicityStatus: '보정완료 (85% 초과 시 급격 부실)',
      sampleAdequacy: '양호 (96.5%)',
      bins: [
        { bin: '0% ~ 30%', count: 55000, delinquencyRate: 0.65, riskLevel: '우량' },
        { bin: '30% ~ 60%', count: 71000, delinquencyRate: 0.95, riskLevel: '정상' },
        { bin: '60% ~ 85%', count: 42000, delinquencyRate: 2.80, riskLevel: '주의' },
        { bin: '85% 초과', count: 16200, delinquencyRate: 7.10, riskLevel: '고위험' },
      ],
    },
    {
      id: 'VAR_EMP_TENURE_M',
      nameKo: '현 직장 근속개월수',
      category: '소득/재직',
      easyExplain: '건강보험공단 자격득실확인서 기준 현 사업장 재직 개월수',
      calcLogic: 'MONTHS_BETWEEN(TODAY, JOIN_DATE)',
      monotonicityStatus: '정상 (오래 다닐수록 연체율 감소)',
      sampleAdequacy: '적합 (99.8%)',
      bins: [
        { bin: '12개월 미만', count: 28000, delinquencyRate: 3.40, riskLevel: '주의' },
        { bin: '12개월 ~ 36개월', count: 62000, delinquencyRate: 1.65, riskLevel: '정상' },
        { bin: '36개월 ~ 84개월', count: 59000, delinquencyRate: 0.85, riskLevel: '우량' },
        { bin: '84개월 초과', count: 35200, delinquencyRate: 0.40, riskLevel: '매우 우량' },
      ],
    },
  ],
};

// Toast 알림
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-blue-800 border-blue-600 text-white';
  toast.className = `${bg} border-2 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-bold transform transition-all duration-300 translate-y-3 opacity-0`;
  toast.innerHTML = `
    <span class="text-xl">${type === 'success' ? '✅' : 'ℹ️'}</span>
    <span class="leading-snug">${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  });
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-3');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ========================================================
// 🤖 AI 에이전트 핵심 모듈 연동 I/O 어댑터 클라이언트 (AiAgentClient)
// --------------------------------------------------------
// 상대방 개발자가 제작 중인 AI 핵심 모듈과 통신하기 위한 I/O 인터페이스
// 1) MOCK 모드: 상대방 개발 중 시연 및 워크플로우 보장 (기본값)
// 2) API 모드: 실제 HTTP REST 통신 (상대방 모듈 완성 시 즉시 연결)
// 3) 자동 폴백: API 연결 실패 시 Mock 데이터로 즉시 폴백하여 프론트엔드 무중단 유지
// ========================================================
const AiAgentClient = {
  endpoints: {
    PRE_ANALYZE: '/api/v1/ai/pre-analyze',
    SIMULATE_WHATIF: '/api/v1/ai/simulate-whatif',
    REFINE_DRAFT: '/api/v1/ai/refine-draft',
    HEALTH: '/api/v1/ai/health',
  },

  // 1. 패킷 로깅 유틸리티 (실시간 검사기 연동)
  logPacket(endpoint, method, mode, status, latencyMs, requestPayload, responsePayload, errorMsg = null) {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const logEntry = {
      id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      endpoint,
      method,
      mode,
      status,
      latencyMs,
      timestamp: timeStr,
      requestPayload,
      responsePayload,
      errorMsg,
    };
    if (!state.aiPacketLogs) state.aiPacketLogs = [];
    state.aiPacketLogs.unshift(logEntry);
    if (state.aiPacketLogs.length > 50) state.aiPacketLogs.pop(); // 최대 50건 보관
    return logEntry;
  },

  // 2. HTTP 요청 공통 래퍼 (Fetch + Abort Timeout + Mock Fallback)
  async request(endpoint, requestPayload, mockGenerator) {
    const config = state.aiApiConfig;
    const startTime = performance.now();

    // [Mode 1] MOCK 모드 (상대방 제작 중 기본 모드)
    if (config.mode === 'MOCK') {
      await new Promise(r => setTimeout(r, 350 + Math.random() * 200)); // 현실적인 분석 레이턴시(350~550ms)
      const mockRes = mockGenerator(requestPayload);
      const latencyMs = Math.round(performance.now() - startTime);
      this.logPacket(endpoint, 'POST', 'MOCK', 200, latencyMs, requestPayload, mockRes);
      return mockRes;
    }

    // [Mode 2] API 모드 (상대방 모듈 실제 HTTP 연동)
    const targetUrl = `${config.baseUrl.replace(/\/$/, '')}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 8000);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - startTime);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const responseData = await res.json();
      this.logPacket(endpoint, 'POST', 'API', res.status, latencyMs, requestPayload, responseData);
      config.status = 'connected';
      return responseData;
    } catch (err) {
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);
      console.warn(`[AiAgentClient] API Error on ${endpoint}:`, err);

      // 자동 폴백 처리
      if (config.autoFallbackToMock) {
        const mockRes = mockGenerator(requestPayload);
        this.logPacket(endpoint, 'POST', 'FALLBACK_MOCK', 503, latencyMs, requestPayload, mockRes, `실서버 오류(${err.message}) ➔ Mock 데이터로 자동 폴백 완료`);
        config.status = 'error';
        showToast(`⚠️ [AI 모듈 연동] 상대방 모듈 미응답(${err.message}). Mock 데이터로 안전하게 처리되었습니다.`, 'info');
        return mockRes;
      } else {
        this.logPacket(endpoint, 'POST', 'API_FAILED', 500, latencyMs, requestPayload, null, err.message);
        config.status = 'error';
        throw err;
      }
    }
  },

  // ========================================================
  // [I/O Endpoint 1] 선행 3~5대 전략 도출 (pre-analyze)
  // Request: { taskId, targetProduct, targetMetric, constraints, backgroundReason, requester }
  // Response: { status, analyzedSampleCount, analysisDurationMs, engineVersion, strategies: [...], breakdownRows: [...], summary }
  // ========================================================
  async preAnalyze(params) {
    return this.request(this.endpoints.PRE_ANALYZE, params, (req) => {
      return {
        status: 'SUCCESS',
        analyzedSampleCount: 184200,
        analysisDurationMs: 420,
        engineVersion: 'JDBP-AI-Core-v2.4 (OOT-Evaluated)',
        taskId: req.taskId,
        recommendedStrategyId: 'STRAT_B',
        summary: `184,200건의 차주 빅데이터 파레토 프론티어 분석 결과, 승인율 하락폭 -${req.constraints?.maxApprovalDrop || 3.0}%p 제약 내에서 최적의 건전성 개선 효과를 내는 5대 대안이 도출되었습니다.`,
        strategies: [
          {
            id: 'STRAT_A',
            rank: 1,
            name: '연체율 최소화형 (극단적 건전성 방어)',
            tag: '리스크 집중형',
            approvalRate: 31.2,
            approvalDiff: -4.3,
            delinquencyRate: 0.95,
            delinquencyDiff: -1.75,
            netProfitImpact: 3.1,
            sampleSizePercent: 2.1,
            verdict: 'OOT 백테스트 통과 / 표본 3,868건 (단조성 완벽 충족)',
            ruleSummary: 'DTI 28% 초과 & 단기조회 3건 이상 부결',
            pros: '연체율 -1.75%p 급감으로 부실채권 리스크 원천 차단',
            cons: '승인율 -4.3%p 급락으로 영업기획팀 목표 달성 차질',
          },
          {
            id: 'STRAT_B',
            rank: 2,
            name: '파레토 최적 균형형 (젭대리 AI 기본 추천안)',
            tag: '젭대리 AI 추천',
            isRecommended: true,
            approvalRate: 32.4,
            approvalDiff: -3.1,
            delinquencyRate: 1.25,
            delinquencyDiff: -1.45,
            netProfitImpact: 5.2,
            sampleSizePercent: 1.8,
            verdict: 'OOT 백테스트 통과 / 표본 3,315건 (이익 극대화 균형점)',
            ruleSummary: 'DTI 30% 초과 & 최근 6개월 조회 3건 이상 부결 (다중채무자 집중 제어)',
            pros: '당기순익 +5.2억 원 극대화 및 건전성-수익성 완벽 밸런스',
            cons: '영업기획팀 승인율 하락 저항 최소화를 위한 절충 필요',
          },
          {
            id: 'STRAT_C',
            rank: 3,
            name: '영업 취급액 보전형 (수익 방어 절충안)',
            tag: '영업 친화형',
            approvalRate: 33.7,
            approvalDiff: -1.8,
            delinquencyRate: 1.55,
            delinquencyDiff: -1.15,
            netProfitImpact: 4.6,
            sampleSizePercent: 1.4,
            verdict: 'OOT 백테스트 통과 / 표본 2,578건 (승인율 타격 최소)',
            ruleSummary: 'DTI 32% 초과 & 최근 6개월 조회 4건 이상 부결',
            pros: '승인율 하락 -1.8%p로 제한하여 영업 잔액 목표 유지',
            cons: '연체율 개선폭이 -1.15%p로 다소 둔화됨',
          },
          {
            id: 'STRAT_D',
            rank: 4,
            name: '우량차주 예외 인정형 (신용등급 연계형)',
            tag: '세그먼트 정밀형',
            approvalRate: 33.3,
            approvalDiff: -2.2,
            delinquencyRate: 1.40,
            delinquencyDiff: -1.30,
            netProfitImpact: 4.8,
            sampleSizePercent: 1.6,
            verdict: 'OOT 백테스트 통과 / 표본 2,947건 (1~2등급 예외 세그먼트)',
            ruleSummary: 'DTI 30% 초과 & 6개월 조회 3건 이상 차단 (단, 1~2등급 우량차주 예외 적용)',
            pros: '우량고객 이탈 원천 차단으로 이자수익 +8천만 원 보전',
            cons: '예외 기준 전산 룰 엔진 반영 시 추가 인터페이스 설정 소요',
          },
          {
            id: 'STRAT_E',
            rank: 5,
            name: '다중채무 기관수 결합형 (다차원 차단형)',
            tag: '다차원 통제형',
            approvalRate: 32.9,
            approvalDiff: -2.6,
            delinquencyRate: 1.30,
            delinquencyDiff: -1.40,
            netProfitImpact: 4.2,
            sampleSizePercent: 1.7,
            verdict: 'OOT 백테스트 통과 / 표본 3,130건 (다중채무 3개사 이상)',
            ruleSummary: '다중채무 3개사 이상 보유 AND DTI 30% 초과 차주 집중 부결',
            pros: '카드론/대부업 다중채무 부실 전이율 42% 선제적 차단',
            cons: '기관수 산출 배치 연동 확인 필요',
          },
        ],
        breakdownRows: [
          {
            metricName: '승인율 (Approval Rate)',
            asIs: '35.5%',
            toBe: '32.4%',
            diff: '-3.1%p',
            impactPositive: false,
            comment: '최대 허용 한도(-3.5%p) 이내 통제',
          },
          {
            metricName: '예상 연체율 (Delinquency Rate)',
            asIs: '2.70%',
            toBe: '1.25%',
            diff: '-1.45%p',
            impactPositive: true,
            comment: '연체율 53% 감소 (건전성 대폭 강화)',
          },
          {
            metricName: '연간 충당금 전입액 절감',
            asIs: '18.4억 원',
            toBe: '9.2억 원',
            diff: '+9.2억 원 절감',
            impactPositive: true,
            comment: '대손비용 급감으로 재무 건전성 기여',
          },
          {
            metricName: '연간 예상 순익 (NIM 반영)',
            asIs: '142.5억 원',
            toBe: '147.7억 원',
            diff: '+5.2억 원 개선',
            impactPositive: true,
            comment: '이자수익 감소분 대비 대손비용 절감이 더 큼',
          },
          {
            metricName: '차단 대상 고객 표본수',
            asIs: '0건',
            toBe: '3,315건',
            diff: '전체 1.80%',
            impactPositive: true,
            comment: '표본 유의성(1.0% 이상) 충족',
          },
        ],
      };
    });
  },

  // ========================================================
  // [I/O Endpoint 2] What-If 가설 실시간 시뮬레이션 (simulate-whatif)
  // Request: { taskId, baseStrategyId, userPrompt, department, currentRole, parameters }
  // Response: { status, latencyMs, candidate: { name, rule, rationale, approvalDiff, delinquencyDiff, profitDiff, targetCount, verdict, sourcePrompt, metricsDetail } }
  // ========================================================
  async simulateWhatIf(params) {
    return this.request(this.endpoints.SIMULATE_WHATIF, params, (req) => {
      const p = (req.userPrompt || '').toLowerCase();
      let name = '';
      let rule = '';
      let rationale = '';
      let approvalDiff = -2.2;
      let delinquencyDiff = -1.3;
      let profitDiff = 4.8;
      let targetCount = 14678;
      let summary = '';
      let verdict = 'OOT 백테스트 통과 / 단조성 만족 (AUC 0.841)';

      if (p.includes('1~2등급') || p.includes('우량') || p.includes('예외') || p.includes('제외')) {
        name = '1~2등급 우량고객 예외 인정 절충안';
        rule = 'DTI 30% 초과 & 6개월 조회 3건 이상 부결 (단, 1~2등급 우량고객 예외 허용 및 정상 승인)';
        rationale = '1~2등급 우량고객 142명 취급 유지로 이탈 방어, 이자수익 +8천만 원 보전 및 건전성 악영향 무시 가능(연체율 0.12%)';
        approvalDiff = -2.2;
        delinquencyDiff = -1.3;
        profitDiff = 4.8;
        targetCount = 14678;
        summary = '1~2등급 우량고객 142명을 예외 처리하면 승인율이 -3.1%p에서 -2.2%p로 +0.9%p 회복되며, 당기순이익은 +4.8억 원으로 +0.8억 원 추가 개선됩니다.';
        verdict = '검증 통과: 1~2등급 표본부족(0.95%) 구간으로 예외 심사 규정 부여 적합';
      } else if (p.includes('32%') || p.includes('dti') || p.includes('완화')) {
        name = 'DTI 32% 완화 및 영업 취급액 방어안';
        rule = 'DTI 32% 초과 & 최근 6개월 조회 3건 이상 부결 (DTI 기준 +2%p 완화)';
        rationale = 'DTI 기준을 32%로 완화하여 영업 취급 잔액 및 승인율을 대폭 회복하고 마진 확보';
        approvalDiff = -1.9;
        delinquencyDiff = -1.1;
        profitDiff = 4.4;
        targetCount = 13100;
        summary = 'DTI 32% 적용 시 승인율 하락폭이 -1.9%p로 최소화(+1.2%p 회복)되어 영업 취급 목표 달성에 매우 유리합니다.';
        verdict = '검증 통과: 연체율 개선폭 -1.1%p로 다소 둔화되나 NIM 방어 효과 뚜렷';
      } else if (p.includes('4건') || p.includes('조회') || p.includes('강화')) {
        name = '단기 신용조회 4건 이상 집중 차단안';
        rule = 'DTI 30% 초과 AND 최근 6개월 조회 4건 이상 ➔ 부결 (조회 요건 강화)';
        rationale = '단기 다중채무 조회 차주 부실 전이를 원천 차단하여 포트폴리오 건전성 극대화';
        approvalDiff = -3.8;
        delinquencyDiff = -1.7;
        profitDiff = 3.6;
        targetCount = 15400;
        summary = '단기 신용조회 4건 이상 기준 적용 시 연체율 개선폭이 -1.7%p로 극대화되나, 승인율 하락(-3.8%p)에 따른 영업부서 협의 필요.';
        verdict = '검증 통과: OOT 예측력 우수하나 영업 취급량 감소에 따른 수익 보전 대책 검토 권장';
      } else if (p.includes('다중채무') || p.includes('기관') || p.includes('3개사')) {
        name = '다중채무 3개사 이상 선제 차단안';
        rule = '다중채무 3개사 이상 보유 & DTI 30% 초과 ➔ 부결';
        rationale = '금융기관 3개사 이상 여신 보유 다중채무자의 연체 전이를 조기 차단';
        approvalDiff = -2.6;
        delinquencyDiff = -1.4;
        profitDiff = 4.2;
        targetCount = 14350;
        summary = '다중채무 기관수 3개사 이상 보유 차주를 차단하여 부실 전이율 42% 감소 확인.';
        verdict = '검증 통과: 단조성 원칙 충족, 기관수 증가 시 연체율 비례 상승 검증 완료';
      } else {
        name = `자연어 맞춤 최적화안 ("${req.userPrompt.slice(0, 15)}...")`;
        rule = `${req.userPrompt} 조건 반영 고도화 심사규칙`;
        rationale = '사용자 자연어 요구조건을 18.4만 건 빅데이터에 매핑하여 산출된 파레토 최적점';
        approvalDiff = -2.3;
        delinquencyDiff = -1.35;
        profitDiff = 4.6;
        targetCount = 14500;
        summary = `입력하신 조건("${req.userPrompt}")을 184,200건 DB에 대입한 결과, 연체율 -1.35%p 개선 및 당기순익 +4.6억 원 달성이 가능합니다.`;
        verdict = '검증 통과: AUC 0.838, 표본 유의성 충족';
      }

      return {
        status: 'SUCCESS',
        latencyMs: 380,
        candidate: {
          name,
          rule,
          rationale,
          approvalDiff,
          delinquencyDiff,
          profitDiff,
          targetCount,
          verdict,
          summary,
          sourcePrompt: req.userPrompt,
          metricsDetail: {
            approvalRate: 33.3,
            delinquencyRate: 1.40,
            sampleSize: targetCount,
            backtestAuc: 0.841,
          }
        }
      };
    });
  },

  // ========================================================
  // [I/O Endpoint 3] 품의서 초안 자연어 문안 정제 (refine-draft)
  // Request: { currentDraft: { title, reason, finalRule, effectiveDate }, targets: { title, reason, finalRule }, prompt, requesterDept }
  // Response: { status, latencyMs, proposal: { title, reason, finalRule }, rationale, confidenceScore }
  // ========================================================
  async refineDraft(params) {
    return this.request(this.endpoints.REFINE_DRAFT, params, (req) => {
      const { title, reason, finalRule } = req.targets || { title: true, reason: true, finalRule: true };
      const prompt = req.prompt || '';
      let propTitle = req.currentDraft?.title || state.draft.title;
      let propReason = req.currentDraft?.reason || state.draft.reason;
      let propRule = req.currentDraft?.finalRule || state.draft.finalRule;

      if (prompt.includes('두괄식') || prompt.includes('간결') || prompt.includes('임원') || prompt.includes('요약')) {
        if (title) propTitle = '[임원보고] PL 신용대출 36개월물 DTI·신용조회 심사기준 개편안 요약';
        if (reason) propReason = '【핵심 요약】 최근 다중채무 차주의 신용조회 급증에 따른 연체전이율 상승 압력을 선제 차단(-1.3%p 감소)하고, 1~2등급 우량차주 이탈 방지를 병행하여 당기순이익 +4.8억 원을 동시 달성하는 최적 개편안임. (영업기획팀-신용관리팀 전 부서 최종 합의 완료)';
        if (finalRule) propRule = '▶ 기본원칙: DTI 30% 초과 & 최근 6개월 조회 3건 이상 ➔ 부결\n▶ 예외원칙: KCB/NICE 1~2등급 우량차주 ➔ 정상 취급 (취급 타격 -2.2%p 방어)';
      } else if (prompt.includes('리스크') || prompt.includes('감사') || prompt.includes('금리') || prompt.includes('선제')) {
        if (title) propTitle = '[리스크 선제대응] PL 신용대출 36개월물 고위험 다중채무자 심사기준 강화 및 모니터링 체계 수립';
        if (reason) propReason = '【리스크 선제 방어】 시장 금리 변동성 및 다중채무자 단기 대출 증가에 적극 대응하고자, 고위험 차주군 진입을 조기 차단하고 금융감독 가이드라인상 건전성 지표를 선제적으로 방어하고자 함. (18.4만 건 OOT 백테스트 AUC 0.841 검증 완료)';
        if (finalRule) propRule = 'DTI 30% 초과 AND 최근 6개월 타기관 조회 3건 이상 차주 원천 차단 (단, 소득 증빙 우수 1~2등급 차주는 심사역 전결 예외 적용)';
      } else if (prompt.includes('합의') || prompt.includes('영업') || prompt.includes('우량') || prompt.includes('조율')) {
        if (title) propTitle = '[부서합의 확정] 영업기획팀-신용관리팀 공동 합의에 따른 PL 36개월물 심사기준 개정(안)';
        if (reason) propReason = '【부서간 상호 합의】 영업기획팀의 우량차주 이탈 방지 요구와 신용관리팀의 연체율 방어 목표를 다자간 What-If 시뮬레이션으로 종합 조율하여, 승인율 하락을 최소화(-2.2%p)하면서 연체율 -1.3%p를 개선하는 최적 합의안을 확정 상신함.';
        if (finalRule) propRule = 'DTI 30% 초과 차주 진입 통제하되, 1~2등급 우량차주는 DSR 40% 우대 및 예외 취급 허용 (양 부서 전원 합의 확정)';
      } else {
        if (title) propTitle = `[심사전략 개편] PL 신용대출 36개월물 심사기준 정밀 개정안`;
        if (reason) propReason = `【AI 자연어 반영: ${prompt.slice(0, 18)}...】 요청 취지에 따라 다중채무 차주 부실 전이는 선제 차단하면서, 우량 차주군을 보호하여 연체율 개선(-1.3%p)과 당기순이익 극대화(+4.8억 원)를 균형 있게 달성하고자 함.`;
        if (finalRule) propRule = `DTI 30% 초과 AND 단기조회 3건 이상 부결 (단, ${prompt.includes('우량') ? '1~2등급 우량차주 예외 적용' : 'AI 검증 통과 차주 선별 취급'})`;
      }

      return {
        status: 'SUCCESS',
        latencyMs: 310,
        confidenceScore: 0.96,
        rationale: '금융 공문서 표준 서식 및 금융감독원 여신심사 모범규준에 부합하도록 문안 재구성',
        proposal: {
          title: propTitle,
          reason: propReason,
          finalRule: propRule,
        }
      };
    });
  },

  // ========================================================
  // [Health Check] 상대방 서버 생존 여부 핑 테스트
  // ========================================================
  async pingHealthCheck() {
    const config = state.aiApiConfig;
    const targetUrl = `${config.baseUrl.replace(/\/$/, '')}${this.endpoints.HEALTH}`;
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);
      if (res.ok) {
        config.status = 'connected';
        config.lastTestedAt = new Date().toLocaleTimeString();
        showToast(`✅ [연결 성공] AI 에이전트 모듈 서버 응답 정상 (${latencyMs}ms)`, 'success');
        renderApp();
        return true;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      config.status = 'error';
      config.lastTestedAt = new Date().toLocaleTimeString();
      showToast(`❌ [연결 실패] AI 모듈 서버(${targetUrl})가 응답하지 않습니다. MOCK 모드를 사용하세요.`, 'warning');
      renderApp();
      return false;
    }
  }
};

// ========================================================
// AI 모듈 I/O 센터 UI 제어 헬퍼 함수들
// ========================================================
function openAiModuleConfigModal() {
  state.isAiModuleModalOpen = true;
  renderApp();
}

function closeAiModuleConfigModal() {
  state.isAiModuleModalOpen = false;
  renderApp();
}

function setAiModuleConfigTab(tab) {
  state.aiApiConfig.activeTab = tab;
  renderApp();
}

function setAiModuleSpecEndpoint(endpointKey) {
  state.aiApiConfig.selectedSpecEndpoint = endpointKey;
  renderApp();
}

function setAiModuleMode(mode) {
  state.aiApiConfig.mode = mode;
  state.aiApiConfig.status = mode === 'MOCK' ? 'ready' : 'ready';
  renderApp();
  showToast(`AI 엔진 모드가 [${mode === 'MOCK' ? 'MOCK (모의 응답)' : 'API (실서버 연동)'}]로 전환되었습니다.`, 'info');
}

function saveAiModuleConfig(baseUrl, apiKey, timeoutMs, autoFallback) {
  state.aiApiConfig.baseUrl = baseUrl.trim();
  state.aiApiConfig.apiKey = apiKey.trim();
  state.aiApiConfig.timeoutMs = parseInt(timeoutMs, 10) || 8000;
  state.aiApiConfig.autoFallbackToMock = !!autoFallback;
  renderApp();
  showToast('AI 모듈 연동 설정이 저장되었습니다.', 'success');
}

function clearAiPacketLogs() {
  state.aiPacketLogs = [];
  renderApp();
  showToast('패킷 검사기 로그가 초기화되었습니다.', 'info');
}

function copyTextToClipboard(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast(successMsg || '클립보드에 복사되었습니다.', 'success');
}

// 각 역할(영업 담당자, 신용관리 담당자, 신용관리 팀장, 신용관리 본부장)별
// 본인이 처리하는 화면/단계까지 도달한 안건만 필터링 (1단계: 의뢰/접수, 2단계: 다자간 부서협의)
function isTaskVisibleForRole(task, roleId) {
  if (!task) return false;
  // 1. 영업 담당자 (SALES_STAFF):
  //    1단계: 업무요건 의뢰서 작성 (request)
  //    2단계: 다자간 부서 협의 (collaboration)
  if (roleId === 'SALES_STAFF') {
    return task.stepNum === 1 || task.stepNum === 2;
  }
  // 2. 신용관리 담당자 (CREDIT_STAFF):
  //    1단계(접수) ~ 2단계(다자간 부서협의 및 품의초안 작성)
  //    전 단계 화면을 직접 실무 처리
  if (roleId === 'CREDIT_STAFF') {
    return task.stepNum >= 1;
  }
  // 3. 신용관리 팀장 (CREDIT_LEADER):
  //    2단계(다자간 부서협의 검토 및 합의)
  if (roleId === 'CREDIT_LEADER') {
    return task.stepNum >= 2;
  }
  // 4. 신용관리 본부장 (RISK_HEAD):
  //    2단계(다자간 부서협의 총괄 및 최종 합의)
  if (roleId === 'RISK_HEAD') {
    return task.stepNum >= 2;
  }
  return true;
}

// 각 역할별로 처리/조회하는 단계(Step) 필터 버튼 노출 여부 (최대 2단계: 부서협의까지)
function isStepVisibleForRole(stepNum, roleId) {
  if (stepNum > 2) return false;
  if (roleId === 'SALES_STAFF') return stepNum === 1 || stepNum === 2;
  if (roleId === 'CREDIT_STAFF') return true;
  if (roleId === 'CREDIT_LEADER') return stepNum >= 2;
  if (roleId === 'RISK_HEAD') return stepNum >= 2;
  return true;
}

// 계정 전환 핸들러 (Role Switcher)
function switchAccount(roleId) {
  if (!ACCOUNTS[roleId]) return;
  state.currentRoleId = roleId;
  state.isAccountMenuOpen = false;
  state.taskFilter = 'ALL';
  state.currentTab = 'taskList'; // 계정 변경 시에도 첫 화면은 진행 업무 목록(taskList)에서 시작
  const account = ACCOUNTS[roleId];

  // 선택된 안건이 해당 계정에서 처리 화면에 도달하지 않은 안건이면, 도달한 첫 안건으로 자동 전환
  const reachableTasks = state.tasks.filter(t => isTaskVisibleForRole(t, roleId));
  if (!reachableTasks.some(t => t.id === state.selectedTaskId) && reachableTasks.length > 0) {
    state.selectedTaskId = reachableTasks[0].id;
  }
  
  renderApp();
  showToast(`[${account.dept} ${account.name}] 계정으로 전환되었습니다.`, 'info');
}

function toggleAccountMenu(event) {
  if (event) {
    event.stopPropagation();
  }
  state.isAccountMenuOpen = !state.isAccountMenuOpen;
  renderApp();
}

// 탭 이동
function switchTab(tab) {
  // [월 정기 모니터링] 메뉴 요청 시 전용 팝업 모달로 오픈
  if (tab === 'monthlyMonitoring') {
    openMonthlyMonitoringModal();
    return;
  }

  // [분석 기준관리 (규제·제외 관리)] 메뉴 요청 시 전용 팝업 모달로 오픈
  if (tab === 'ruleMonitoring') {
    if (state.currentRoleId !== 'CREDIT_STAFF') {
      showToast('분석 기준관리(규제·제외 관리) 메뉴는 신용관리팀 담당자 전용 기능입니다.', 'info');
      return;
    }
    openRuleMonitoringModal();
    return;
  }

  const account = ACCOUNTS[state.currentRoleId];
  // 5 참고정보 변수 사전 메뉴 제거
  if (tab === 'dictionary') {
    return;
  }
  // 신용관리팀 담당자만 부서협의 완료 후 품의서 초안 작성 가능
  if (tab === 'approval') {
    if (state.currentRoleId !== 'CREDIT_STAFF') {
      showToast('품의서 초안 작성은 신용관리팀 담당자 전용 기능입니다.', 'info');
      return;
    }
    const currentTask = state.tasks.find(t => t.id === state.selectedTaskId);
    const isAgreed = state.isAgreed || currentTask?.status === 'agreed';
    if (!isAgreed) {
      showToast('2단계 부서간 협의가 완료된 후에 품의서 초안을 작성할 수 있습니다.', 'info');
      return;
    }
  }

  // 상대 부서는 협의 안건 작성 화면을 거치지 않고 다자간 협의(collaboration) 화면에서 바로 접수 가능


  if (!account.allowedTabs.includes(tab)) {
    showToast(`현재 [${account.dept} ${account.name}] 계정에서는 접근 권한이 없는 메뉴입니다.`, 'info');
    return;
  }
  state.currentTab = tab;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 안건 선택 및 화면 이동 (이미 상정된 안건은 상대 부서 접수 및 토의를 위해 무조건 'collaboration' 다자간 협의 화면으로 직행!)
function selectTask(taskId, targetTab) {
  state.selectedTaskId = taskId;
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    state.taskRequest.id = task.id;
    state.taskRequest.title = task.title;
    state.taskRequest.targetProduct = task.product;
    state.taskRequest.requesterName = task.requesterName;
    state.taskRequest.requesterDept = task.requesterDept;
    state.taskRequest.requestDate = task.requestDate;
    state.taskRequest.urgency = task.urgency;
    state.isAgreed = task.status === 'agreed';
  }

  // 사용자의 핵심 요건: 상대 부서는 협의 안건 작성 화면을 거치지 않고, 다자간 협의 화면에서 바로 접수할 수 있게 함!
  if (targetTab === 'approval') {
    switchTab('approval');
  } else {
    // 안건 접수 대기 또는 협의 진행 중인 모든 안건은 다자간 협의 화면으로 직행!
    switchTab('collaboration');
  }
}

// 신규 협의 안건 작성 시작 (업무 목록에서 신규 작성 버튼 클릭 시에만 진입)
function createNewTaskRequest() {
  const currentAcc = ACCOUNTS[state.currentRoleId] || ACCOUNTS.SALES_STAFF;
  const isSalesUser = currentAcc.dept.includes('영업');
  const requesterDept = isSalesUser ? '영업기획팀' : '신용관리팀';
  const requesterName = currentAcc.name;
  const assigneeDept = isSalesUser ? '신용관리팀' : '영업기획팀';
  const assigneeName = isSalesUser ? '이신용 대리' : '최기획 대리';

  state.taskRequest = {
    id: `REQ-2026-1011-${Math.floor(Math.random() * 800 + 100)}`,
    title: isSalesUser ? '[취급확대] 신규 심사완화 협의 안건' : '[리스크선제방어] 신규 심사강화 협의 안건',
    requesterDept: requesterDept,
    requesterName: requesterName,
    requestDate: new Date().toISOString().split('T')[0] + ' 10:00',
    urgency: '보통',
    targetProduct: 'PL 신용대출 36개월물',
    targetMetric: isSalesUser ? 'profit' : 'delinquency',
    maxApprovalDrop: 4.2,
    minSampleSize: 1.0,
    backgroundReason: '',
    assignedTo: `${assigneeDept} ${assigneeName}`,
    direction: isSalesUser ? 'SALES_TO_CREDIT' : 'CREDIT_TO_SALES',
    status: 'draft',
  };
  state.isAiPreAnalyzing = false;
  state.showAssigneeAlert = false;
  state.isAgendaModalOpen = true; // [사용자 요청] 팝업 모달로 열기!
  renderApp();
  showToast(`[${requesterDept}]의 신규 협의 안건 작성 팝업이 열렸습니다.`, 'info');
}

// [신규] 안건 작성 모달 열기/닫기 제어기
function openAgendaModal() {
  state.isAgendaModalOpen = true;
  renderApp();
}

function closeAgendaModal() {
  state.isAgendaModalOpen = false;
  renderApp();
}

// [신규] 월 정기 모니터링 팝업 모달 제어기
function openMonthlyMonitoringModal() {
  state.isMonthlyMonitoringModalOpen = true;
  renderApp();
}

function closeMonthlyMonitoringModal() {
  state.isMonthlyMonitoringModalOpen = false;
  renderApp();
}

// [신규] 분석 기준관리(규제·제외 관리) 팝업 모달 제어기
function openRuleMonitoringModal() {
  if (state.currentRoleId !== 'CREDIT_STAFF') {
    showToast('분석 기준관리(규제·제외 관리)은 신용관리팀 담당자 전용 기능입니다.', 'info');
    return;
  }
  state.isRuleMonitoringModalOpen = true;
  renderApp();
}

function closeRuleMonitoringModal() {
  state.isRuleMonitoringModalOpen = false;
  renderApp();
}

// 업무 목록 필터 변경 (전체, 1단계, 2단계, 3단계)
function setTaskFilter(filter) {
  state.taskFilter = filter;
  renderApp();
}

// ----------------------------------------------------
// 안건 상세 검색조건 핸들러 (등록일자, 진행상태 다중선택, 내 처리 대기건)
// ----------------------------------------------------
function setSearchDate(field, val) {
  state.searchFilter[field] = val;
  state.searchFilter.datePreset = 'CUSTOM';
  renderApp();
}

function setDatePreset(preset) {
  state.searchFilter.datePreset = preset;
  if (preset === 'CURRENT_MONTH') {
    state.searchFilter.dateFrom = '2026-10-01';
    state.searchFilter.dateTo = '2026-10-31';
  } else if (preset === 'LAST_3_MONTHS') {
    state.searchFilter.dateFrom = '2026-08-01';
    state.searchFilter.dateTo = '2026-10-31';
  } else if (preset === 'ALL') {
    state.searchFilter.dateFrom = '';
    state.searchFilter.dateTo = '';
  }
  renderApp();
  showToast('등록일자 조회 기간이 변경되었습니다.');
}

function toggleStatusDropdown(event) {
  if (event) {
    event.stopPropagation();
  }
  state.searchFilter.isStatusDropdownOpen = !state.searchFilter.isStatusDropdownOpen;
  renderApp();
}

function closeStatusDropdown() {
  state.searchFilter.isStatusDropdownOpen = false;
  renderApp();
}

function toggleAllStatus() {
  const allChecked = state.searchFilter.statusInProgress && state.searchFilter.statusCompleted;
  state.searchFilter.statusInProgress = !allChecked;
  state.searchFilter.statusCompleted = !allChecked;
  renderApp();
}

function toggleStatusChoice(type) {
  if (type === 'IN_PROGRESS') {
    state.searchFilter.statusInProgress = !state.searchFilter.statusInProgress;
  } else if (type === 'COMPLETED') {
    state.searchFilter.statusCompleted = !state.searchFilter.statusCompleted;
  }
  renderApp();
}

function toggleOnlyMyAction() {
  state.searchFilter.onlyMyAction = !state.searchFilter.onlyMyAction;
  renderApp();
  if (state.searchFilter.onlyMyAction) {
    showToast('🔴 내 즉시 처리 대기(Action) 안건만 조회합니다.');
  } else {
    showToast('전체 진행 안건 조회로 전환되었습니다.');
  }
}

function resetSearchFilters() {
  state.searchFilter.dateFrom = '2026-10-01';
  state.searchFilter.dateTo = '2026-10-31';
  state.searchFilter.datePreset = 'CURRENT_MONTH';
  state.searchFilter.statusInProgress = true;
  state.searchFilter.statusCompleted = true;
  state.searchFilter.onlyMyAction = false;
  state.searchFilter.isStatusDropdownOpen = false;
  state.taskFilter = 'ALL';
  renderApp();
  showToast('검색조건이 당월 기본값으로 초기화되었습니다.');
}

// ----------------------------------------------------
// 모바일 단말 접속 안내 모달 핸들러
// ----------------------------------------------------
function openMobileAccessModal() {
  state.isMobileModalOpen = true;
  renderApp();
}

function closeMobileAccessModal() {
  state.isMobileModalOpen = false;
  renderApp();
}

function copyMobileUrlToClipboard() {
  const mobileUrl = 'http://125.141.49.113:3000';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(mobileUrl).then(() => {
      showToast('모바일 접속 URL이 클립보드에 복사되었습니다: ' + mobileUrl);
    }).catch(() => {
      prompt('모바일 접속 URL을 복사하세요:', mobileUrl);
    });
  } else {
    prompt('모바일 접속 URL을 복사하세요:', mobileUrl);
  }
}

// 협의 안건 기안 방향 전환 함수 (영업기획팀 ➔ 신용관리팀 vs 신용관리팀 ➔ 영업기획팀)
function setProposalDirection(direction) {
  state.taskRequest.direction = direction;
  const isCreditToSales = direction === 'CREDIT_TO_SALES';

  if (isCreditToSales) {
    state.taskRequest.requesterDept = '신용관리팀';
    state.taskRequest.requesterName = '이신용 대리';
    state.taskRequest.assignedTo = '영업기획팀 최기획 대리';
    state.taskRequest.targetMetric = 'delinquency';
    if (!state.taskRequest.fromMonitoring) {
      state.taskRequest.title = '[리스크 선제방어] ' + (state.taskRequest.targetProduct || 'PL 신용대출 36개월물') + ' 고위험군 심사기준 강화 제안';
      state.taskRequest.backgroundReason = '최근 연체율 상승 추세에 따른 건전성 선제 방어 및 고위험 다중채무 차주군 심사 강화 제안 건입니다. 영업기획팀의 접수 및 완충 조건(우량 차주 예외 적용 등) 협의를 요청합니다.';
    }
  } else {
    state.taskRequest.requesterDept = '영업기획팀';
    state.taskRequest.requesterName = '최기획 대리';
    state.taskRequest.assignedTo = '신용관리팀 이신용 대리';
    state.taskRequest.targetMetric = 'profit';
    if (!state.taskRequest.fromMonitoring) {
      state.taskRequest.title = '[영업 취급확대] ' + (state.taskRequest.targetProduct || 'PL 신용대출 36개월물') + ' 우량 차주군 심사 완화 제안';
      state.taskRequest.backgroundReason = '영업 목표 달성 및 우량 고객 유치를 위해 승인율을 방어하면서 취급을 확대할 수 있는 심사 완화 전략을 제안합니다. 신용관리팀의 접수 및 리스크 영향도 시뮬레이션 협의를 요청합니다.';
    }
  }
  renderApp();
  showToast(`기안 방향이 [${state.taskRequest.requesterDept} ➔ ${state.taskRequest.assignedTo}]으로 전환되었습니다.`, 'info');
}

// 1. 협의 안건 작성 및 공식 상정 (현재 로그인 인원 부서에서 상대방 부서로 요청 확정)
function submitTaskRequest() {
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.SALES_STAFF;
  const isSalesUser = currentAccount.dept.includes('영업');
  const requesterDept = isSalesUser ? '영업기획팀' : '신용관리팀';
  const requesterName = currentAccount.name;
  const assigneeDept = isSalesUser ? '신용관리팀' : '영업기획팀';
  const assigneeName = isSalesUser ? '이신용 대리' : '최기획 대리';

  const req = state.taskRequest;
  req.status = 'submitted';
  req.requesterDept = requesterDept;
  req.requesterName = requesterName;
  req.assignedTo = `${assigneeDept} ${assigneeName}`;
  req.direction = isSalesUser ? 'SALES_TO_CREDIT' : 'CREDIT_TO_SALES';

  // 업무 목록에도 1단계(접수 대기) 상태로 등록/반영
  const existing = state.tasks.find(t => t.id === req.id);
  const taskData = {
    id: req.id,
    title: req.title,
    product: req.targetProduct,
    requesterDept: requesterDept,
    requesterName: requesterName,
    assigneeDept: assigneeDept,
    assigneeName: assigneeName,
    requestDate: req.requestDate || new Date().toISOString().split('T')[0] + ' 10:00',
    urgency: req.urgency || '보통',
    stepNum: 1,
    stepBadge: `1단계: ${assigneeDept} 접수 대기 중`,
    status: 'submitted',
    goalText: `승인율 ${req.maxApprovalDrop || 4.2}%p 이내 방어`,
    actionInfo: {
      CREDIT_STAFF: {
        actionName: isSalesUser ? '📥 안건 접수 처리하기' : '⏳ 상대방 접수 대기',
        targetTab: 'collaboration',
        isMyAction: isSalesUser,
        desc: isSalesUser ? '영업기획팀 상정 안건 확인 후 공식 접수 처리' : '영업기획팀의 안건 접수 대기 중'
      },
      SALES_STAFF: {
        actionName: isSalesUser ? '⏳ 상대방 접수 대기' : '📥 안건 접수 처리하기',
        targetTab: 'collaboration',
        isMyAction: !isSalesUser,
        desc: isSalesUser ? '신용관리팀의 안건 접수 대기 중' : '신용관리팀 상정 안건 확인 후 공식 접수 처리'
      },
      CREDIT_LEADER: { actionName: '접수 대기', targetTab: 'collaboration', isMyAction: false, desc: '담당자 접수 처리 대기' },
      RISK_HEAD: { actionName: '안건 조회', targetTab: 'collaboration', isMyAction: false, desc: '상정 안건 검토 대기' },
    }
  };

  if (existing) {
    Object.assign(existing, taskData);
  } else {
    state.tasks.unshift(taskData);
  }

  state.selectedTaskId = req.id;
  state.isAgendaModalOpen = false; // [팝업 닫기] 상정 완료 시 모달 닫기
  // 안건 상정 후 다자간 협의 화면으로 이동하여 접수 대기 배너와 상태를 직관적으로 확인
  state.currentTab = 'collaboration';
  renderApp();
  showToast(`[${requesterDept} ${requesterName}] ➔ [${assigneeDept}] 협의 안건이 공식 상정되었습니다. 상대방 부서(${assigneeDept})에서 접수 처리 후 부서간 협의가 시작됩니다.`, 'success');
}

// 2. 상대방 부서: 협의 안건 접수 처리 핸들러 (AI 선행 분석 연계 ➔ 2단계 다자간 부서 협의 시작)
async function acceptTaskRequest(taskId) {
  const task = state.tasks.find(t => t.id === taskId) || state.tasks.find(t => t.id === state.selectedTaskId) || state.tasks[0];
  if (!task) return;

  state.isAiPreAnalyzing = true;
  renderApp();

  const reqPayload = {
    taskId: task.id,
    targetProduct: task.product,
    targetMetric: state.taskRequest.targetMetric || 'delinquency',
    constraints: {
      maxApprovalDrop: state.taskRequest.maxApprovalDrop || 3.0,
      minSampleSizeRatio: (state.taskRequest.minSampleSize || 1.0) / 100,
      ootValidationRequired: true,
    },
    backgroundReason: state.taskRequest.backgroundReason,
    requester: { department: task.requesterDept, name: task.requesterName }
  };

  try {
    const res = await AiAgentClient.preAnalyze(reqPayload);
    if (res && res.strategies && res.strategies.length > 0) {
      state.strategies = res.strategies;
      if (res.breakdownRows) state.breakdownRows = res.breakdownRows;
      if (res.recommendedStrategyId) state.selectedStrategyId = res.recommendedStrategyId;
    }
  } catch (err) {
    console.error('AI Pre-Analyze error, continuing with fallback:', err);
  } finally {
    state.isAiPreAnalyzing = false;
  }

  task.stepNum = 2;
  task.status = 'collaborating';
  task.stepBadge = '2단계: 다자간 부서 협의 진행 중';
  
  // 액션 정보 갱신
  task.actionInfo.CREDIT_STAFF = {
    actionName: '🤝 다자간 부서 협의 참여 (What-If)',
    targetTab: 'collaboration',
    isMyAction: true,
    desc: 'AI 5대 최적안 검토 및 다자간 의견 조율'
  };
  task.actionInfo.SALES_STAFF = {
    actionName: '💬 영업의견 조율 참여',
    targetTab: 'collaboration',
    isMyAction: true,
    desc: '우량차주 예외 및 한도 시뮬레이션 참여'
  };
  task.actionInfo.CREDIT_LEADER = {
    actionName: '📋 부서 협의안 검토',
    targetTab: 'collaboration',
    isMyAction: false,
    desc: '다자간 의견 조율 및 전략 타당성 검토'
  };
  task.actionInfo.RISK_HEAD = {
    actionName: '📊 전 부서 합의 현황 조회',
    targetTab: 'collaboration',
    isMyAction: false,
    desc: '협의 진행 경과 확인'
  };

  // 상태 동기화
  state.taskRequest.id = task.id;
  state.taskRequest.title = task.title;
  state.taskRequest.targetProduct = task.product;
  state.taskRequest.status = 'collaborating';
  state.selectedTaskId = task.id;
  state.currentTab = 'collaboration';

  renderApp();
  showToast(`[접수 완료] 상대방 부서(${task.assigneeDept})에서 안건을 공식 접수하였습니다. AI 에이전트의 5대 최적안을 장착하고 부서간 협의를 시작합니다!`, 'success');
}

// 신용관리팀 워크스페이스 열기
function openAssigneeWorkspace() {
  state.showAssigneeAlert = false;
  state.currentRoleId = 'CREDIT_STAFF'; // 신용관리팀 이신용 대리로 자동 전환
  state.currentTab = 'collaboration';
  renderApp();
  showToast('신용관리팀 이신용 대리 워크스페이스(다자간 부서 협의)가 활성화되었습니다.', 'info');
}

// 자연어 대화 전송 핸들러
function handleSendAgentChat(userText) {
  const query = (userText || state.chatInputText).trim();
  if (!query) return;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  state.agentChat.push({
    id: `chat-${Date.now()}`,
    sender: 'user',
    message: query,
    timestamp: timeStr,
  });
  state.chatInputText = '';
  renderApp();

  setTimeout(() => {
    let aiReply = '';
    const q = query.toLowerCase();

    if (q.includes('1~2등급') || q.includes('우량') || q.includes('제외') || q.includes('예외')) {
      changeFilterMode('exclude_grade_1_2');
      aiReply = `[명령 반영: 1~2등급 우량고객 예외 허용]\n\n1~2등급 우량차주(142명)를 부결 대상에서 제외 시뮬레이션했습니다.\n• 승인율: -3.1%p ➔ -2.2%p (+0.9%p 회복)\n• 당기순익: +4.8억 원 (+0.8억 원 추가 이익)\n• 연체율 영향: 1~2등급 자체 연체율 0.12%로 건전성에 미치는 영향 미미\n\n하단 추천 카드 및 3단계 협의 테이블에 반영 완료되었습니다.`;
    } else if (q.includes('32%') || q.includes('dti') || q.includes('완화')) {
      state.customDti = 32;
      changeFilterMode('dti_32');
      aiReply = `[명령 반영: DTI 32%로 완화 조정]\n\nDTI 기준을 32%로 상향하여 재산출했습니다.\n• 승인율: -1.9%p (+1.2%p 대폭 회복)\n• 당기순익: +4.4억 원 달성\n• 연체율 개선폭: -1.1%p로 다소 둔화되나, 영업 취급액 방어에 유리합니다.`;
    } else {
      aiReply = `[시뮬레이션 의견]\n\n입력하신 "${query}" 조건을 반영하여 184,200건 표본을 재검토했습니다.\n영업기획팀의 승인율 하락 방어 요청(-5.0%p 이내)을 고려할 때, [안 2 · 균형 권장안]에 1~2등급 예외를 결합하는 것이 최적의 파레토 해입니다.`;
    }

    state.agentChat.push({
      id: `chat-${Date.now() + 1}`,
      sender: 'agent',
      message: aiReply,
      timestamp: timeStr,
    });
    renderApp();
  }, 500);
}

// 전략 선택 및 Side-by-Side 영향도 자동 연동
function selectStrategy(id) {
  state.selectedStrategyId = id;
  const strat = state.strategies.find(s => s.id === id);
  if (strat) {
    state.comparison.initial.name = `선택안 (${strat.name})`;
    state.comparison.initial.rule = strat.ruleDescription;
    state.comparison.initial.targetCount = strat.targetCount;
    state.comparison.initial.approvalDiff = strat.approvalDiff;
    state.comparison.initial.delinquencyDiff = strat.delinquencyDiff;
    state.comparison.initial.profitDiff = strat.profitDiff;
  }
  renderApp();
}

// 상단 5대 AI 사전분석 추천안 원클릭 전환
function selectStrategyAndCompare(id) {
  selectStrategy(id);
  const strat = state.strategies.find(s => s.id === id);
  if (strat) {
    state.comparison.initial = {
      name: `처음 추천안 (${strat.name})`,
      rule: strat.ruleDescription,
      targetCount: strat.targetCount,
      approvalDiff: strat.approvalDiff,
      delinquencyDiff: strat.delinquencyDiff,
      profitDiff: strat.profitDiff,
    };
    if (id === 'strat-4') {
      changeFilterMode('exclude_grade_1_2');
    } else {
      const recovery = 0.9;
      const profitBoost = 0.8;
      state.comparison.modified = {
        name: `부서 합의안 (1~2등급 우량고객 예외 허용)`,
        rule: `${strat.ruleDescription} (단, 1~2등급 우량고객 예외 허용)`,
        targetCount: Math.round(strat.targetCount * 0.99),
        approvalDiff: +(strat.approvalDiff + recovery).toFixed(1),
        delinquencyDiff: +(strat.delinquencyDiff + 0.2).toFixed(1),
        profitDiff: +(strat.profitDiff + profitBoost).toFixed(1),
      };
      state.comparison.delta = {
        countDiff: -142,
        approvalRecovery: recovery,
        delinquencyPenalty: 0.2,
        profitGain: profitBoost,
      };
      state.draft.finalRule = `${strat.ruleDescription} (단, 심사등급 1~2등급 우량 차주는 제외 검토 및 정상 취급)`;
      state.draft.expectedImpact = {
        approvalDiff: +(strat.approvalDiff + recovery).toFixed(1),
        delinquencyDiff: +(strat.delinquencyDiff + 0.2).toFixed(1),
        profitDiff: +(strat.profitDiff + profitBoost).toFixed(1),
      };
    }
  }
  renderApp();
  showToast(`[${strat?.name}] 안건이 협의 기준안으로 선택되었습니다.`, 'info');
}

// AI What-If Lab 팝업 모달 열기/닫기
function openAiWhatIfModal(targetSlot) {
  const defaultSlot = state.currentRoleId === 'SALES_STAFF' ? 'sales' : 'credit';
  state.isAiWhatIfModalOpen = true;
  state.aiWhatIfTargetSlot = targetSlot || defaultSlot;
  renderApp();
}

function closeAiWhatIfModal() {
  state.isAiWhatIfModalOpen = false;
  state.aiWhatIfIsRunning = false;
  renderApp();
}

// 다자간 협의 실시간 의견 등록 (현재 접속된 역할 명의로 등록)
function sendCollabComment(commentText) {
  const text = (commentText || state.collabCommentInput || '').trim();
  if (!text) {
    showToast('토의 의견을 입력해 주세요.', 'info');
    return;
  }
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  state.discussions.push({
    id: `disc-${Date.now()}`,
    department: currentAccount.dept,
    userName: currentAccount.name,
    userRole: currentAccount.roleLabel,
    timestamp: timeStr,
    message: text,
    queryType: 'comment',
  });
  state.collabCommentInput = '';
  renderApp();
  showToast(`[${currentAccount.name}] 님의 의견이 토의방에 등록되었습니다.`, 'success');
}

// 팝업 내 자연어 시뮬레이션 분석 요청 실행 (AI 핵심 모듈 simulateWhatIf 호출 연동)
async function runAiWhatIfModalSimulation(userPrompt) {
  const prompt = (userPrompt || state.aiWhatIfInputText || '').trim();
  if (!prompt) {
    showToast('시뮬레이션 분석 조건을 자연어로 입력해 주세요.', 'info');
    return;
  }
  state.aiWhatIfInputText = prompt;
  state.aiWhatIfIsRunning = true;
  renderApp();

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // 사용자 질의 기록 추가
  state.aiWhatIfHistory.push({
    id: `wh-${Date.now()}-u`,
    sender: 'user',
    query: prompt,
    timestamp: timeStr,
  });

  const currentStrat = state.strategies.find(s => s.id === state.selectedStrategyId) || state.strategies[1];
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;

  const simPayload = {
    taskId: state.selectedTaskId,
    baseStrategyId: currentStrat.id,
    userPrompt: prompt,
    department: currentAccount.dept,
    currentRole: state.currentRoleId,
    parameters: {
      dtiThreshold: 30,
      cbInquiryThreshold: 3,
      allowVipException: prompt.includes('1~2등급') || prompt.includes('우량') || prompt.includes('예외'),
    }
  };

  let candidate = null;
  try {
    const res = await AiAgentClient.simulateWhatIf(simPayload);
    if (res && res.candidate) {
      candidate = res.candidate;
    }
  } catch (err) {
    console.error('AI What-If simulation error:', err);
  } finally {
    state.aiWhatIfIsRunning = false;
  }

  if (candidate) {
    state.aiWhatIfHistory.push({
      id: `wh-${Date.now()}-a`,
      sender: 'ai',
      result: candidate,
      timestamp: timeStr,
    });
    state.aiWhatIfCandidate = candidate;
    state.aiWhatIfInputText = '';
    renderApp();
    showToast('새로운 시뮬레이션 최종 후보안이 도출되었습니다!', 'success');
  } else {
    renderApp();
  }
}

// 도출된 후보안을 협의 화면의 특정 부서 안(sales 또는 credit)으로 반영
function applyAiCandidateToDepartmentProposal(slotKey) {
  const candidate = state.aiWhatIfCandidate;
  if (!candidate) {
    showToast('반영할 시뮬레이션 결과가 없습니다.', 'warning');
    return;
  }

  // 부서별 수정 권한 체크 (영업기획팀은 영업기획팀 안만, 신용관리팀은 신용관리팀 안만 수정 가능)
  if (slotKey === 'sales' && state.currentRoleId !== 'SALES_STAFF') {
    showToast('영업기획팀 안은 영업기획팀(최기획 대리)만 수정할 수 있습니다.', 'warning');
    return;
  }
  if (slotKey === 'credit' && state.currentRoleId === 'SALES_STAFF') {
    showToast('신용관리팀 안은 신용관리팀(이신용 대리/박심사 팀장)만 수정할 수 있습니다.', 'warning');
    return;
  }

  const slot = state.departmentProposals[slotKey];
  if (!slot) return;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;

  // 슬롯 데이터 업데이트
  slot.name = candidate.name;
  slot.rule = candidate.rule;
  slot.rationale = candidate.rationale;
  slot.metrics = {
    approvalDiff: candidate.approvalDiff,
    delinquencyDiff: candidate.delinquencyDiff,
    profitDiff: candidate.profitDiff,
    targetCount: candidate.targetCount,
  };
  slot.status = 'AI 분석 반영 완료';
  slot.updatedAt = timeStr;

  // 이미 해당 안건이 최종안으로 책정되어 있는 상태라면 draft도 동기화
  if (state.isAgreed && state.selectedFinalSlot === slotKey) {
    state.draft.finalRule = candidate.rule;
    state.draft.expectedImpact = {
      approvalDiff: candidate.approvalDiff,
      delinquencyDiff: candidate.delinquencyDiff,
      profitDiff: candidate.profitDiff,
    };
  }

  // 부서간 실시간 토의방에 자동 공지 메시지 등록
  const announcementMessage = `🤖 [AI What-If 분석 결과 반영 알림]\n` +
    `• 반영 부서: 【${slot.dept} 안】\n` +
    `• 안건명: ${candidate.name}\n` +
    `• 적용 규칙: ${candidate.rule}\n` +
    `• 예측 성과: 연체율 ${candidate.delinquencyDiff}%p | 승인율 ${candidate.approvalDiff}%p | 순익 +${candidate.profitDiff}억원\n` +
    `• 분석 가설: "${candidate.sourcePrompt}" (${currentAccount.dept} ${currentAccount.name} 반영)`;

  state.discussions.push({
    id: `disc-${Date.now()}`,
    department: '젭대리 AI',
    userName: `AI 엔진 (${slot.dept} 안 업데이트)`,
    userRole: '자동 반영',
    timestamp: timeStr,
    message: announcementMessage,
    queryType: 'drill_down',
  });

  // 모달 닫기 및 화면 재렌더링
  state.isAiWhatIfModalOpen = false;
  renderApp();
  showToast(`[${slot.dept}] 안에 성공적으로 반영되어 협의 화면에 업데이트되었습니다!`, 'success');
}

function startCollaborationWithStrategy(id) {
  selectStrategyAndCompare(id);
  state.currentTab = 'collaboration';
  renderApp();
  showToast(`[${state.strategies.find(s => s.id === id)?.name}] 안으로 부서간 협의를 시작합니다.`, 'info');
}

function changeFilterMode(mode) {
  state.filterMode = mode;
  if (mode === 'exclude_grade_1_2') {
    state.breakdownRows = state.breakdownRows.map(r => {
      if (r.groupName.includes('1~2등급')) {
        return { ...r, actionVerdict: '제외 검토', profitContribution: 1.65, isInsufficientSample: true };
      }
      return r;
    });
    state.comparison.modified = {
      name: '부서 합의안 (1~2등급 우량고객 예외 허용)',
      rule: 'DTI 30% 초과 & 6개월 조회 3건 이상 부결 (단, 1~2등급 우량고객 제외)',
      targetCount: 14678,
      approvalDiff: -2.2,
      delinquencyDiff: -1.3,
      profitDiff: 4.8,
    };
    state.comparison.delta = {
      countDiff: -142,
      approvalRecovery: 0.9,
      delinquencyPenalty: 0.2,
      profitGain: 0.8,
    };
    state.draft.finalRule = 'DTI 30% 초과 AND 최근 6개월 조회 3건 이상 ➔ 부결 (단, 심사등급 1~2등급 우량 차주는 제외 검토 및 정상 취급)';
    state.draft.expectedImpact = { approvalDiff: -2.2, delinquencyDiff: -1.3, profitDiff: 4.8 };
  } else if (mode === 'dti_32') {
    state.comparison.modified = {
      name: '수정안 (DTI 32% 완화안)',
      rule: 'DTI 32% 초과 AND 최근 6개월 조회 3건 이상 ➔ 부결',
      targetCount: 13100,
      approvalDiff: -1.9,
      delinquencyDiff: -1.1,
      profitDiff: 4.4,
    };
    state.comparison.delta = {
      countDiff: -1720,
      approvalRecovery: 1.2,
      delinquencyPenalty: 0.4,
      profitGain: 0.4,
    };
    state.draft.finalRule = 'DTI 32% 초과 AND 최근 6개월 조회 3건 이상 ➔ 부결';
    state.draft.expectedImpact = { approvalDiff: -1.9, delinquencyDiff: -1.1, profitDiff: 4.4 };
  }
  renderApp();
}

// 두 부서(영업기획팀 vs 신용관리팀) 안 중 하나를 최종안으로 책정하고 합의 완료 처리
function finalizeProposal(slotKey) {
  // 최종안 책정 권한 체크: 신용관리팀 담당자만 책정 가능
  if (state.currentRoleId !== 'CREDIT_STAFF') {
    showToast('최종안 책정 권한은 신용관리팀 담당자(이신용 대리)에게만 있습니다.', 'warning');
    return;
  }

  const chosenSlot = state.departmentProposals[slotKey] || state.departmentProposals.sales;
  state.selectedFinalSlot = slotKey;
  state.isAgreed = true;

  // 심사전략 품의서(draft)에 최종 책정된 안건의 심사 규칙과 지표 자동 연동
  state.draft.finalRule = chosenSlot.rule;
  state.draft.expectedImpact = {
    approvalDiff: chosenSlot.metrics.approvalDiff,
    delinquencyDiff: chosenSlot.metrics.delinquencyDiff,
    profitDiff: chosenSlot.metrics.profitDiff,
  };
  state.draft.reason = `${chosenSlot.dept} 및 전 부서 간 심도 있는 협의(핑퐁)를 거쳐, ${chosenSlot.rationale}`;

  const currentTask = state.tasks.find(t => t.id === state.selectedTaskId);
  if (currentTask) {
    currentTask.stepNum = 2;
    currentTask.status = 'agreed';
    currentTask.stepBadge = `2단계: 부서 협의 완료 (${chosenSlot.dept} 안 최종 책정)`;
    currentTask.actionInfo.CREDIT_STAFF = {
      actionName: '📝 품의서 초안 작성하기',
      targetTab: 'approval',
      isMyAction: true,
      desc: `부서간 협의 완료 (${chosenSlot.dept} 안 최종 책정) ➔ 심사전략 품의서 초안 작성`
    };
    currentTask.actionInfo.SALES_STAFF = {
      actionName: '🤝 최종안 확인',
      targetTab: 'collaboration',
      isMyAction: false,
      desc: `부서간 협의 완료 (${chosenSlot.dept} 안으로 최종 책정됨)`
    };
    currentTask.actionInfo.CREDIT_LEADER = {
      actionName: '🤝 최종안 확인',
      targetTab: 'collaboration',
      isMyAction: false,
      desc: `부서간 협의 완료 (${chosenSlot.dept} 안 최종 책정)`
    };
    currentTask.actionInfo.RISK_HEAD = {
      actionName: '🤝 최종안 확인',
      targetTab: 'collaboration',
      isMyAction: false,
      desc: `전 부서 최종 합의 완료 (${chosenSlot.dept} 안)`
    };
  }

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;

  state.discussions.push({
    id: `disc-${Date.now()}`,
    department: '젭대리 AI',
    userName: '시스템 (최종안 책정 알림)',
    userRole: '협의 확정',
    timestamp: timeStr,
    message: `🤝 [부서간 협의 완료 & 최종안 책정 확정]\n` +
      `영업기획팀과 신용관리팀 간의 협의와 조율(핑퐁)을 완료하고, 【${chosenSlot.dept} 안】을 최종 심사전략안으로 책정하였습니다!\n` +
      `• 최종 책정 안건명: ${chosenSlot.name}\n` +
      `• 확정 심사규칙: ${chosenSlot.rule}\n` +
      `• 최종 재무·건전성 효과: 연체율 ${chosenSlot.metrics.delinquencyDiff}%p | 승인율 ${chosenSlot.metrics.approvalDiff}%p | 순익 +${chosenSlot.metrics.profitDiff}억원\n` +
      `• 책정 승인: ${currentAccount.dept} ${currentAccount.name} ➔ 이제 신용관리팀에서 [품의서 초안 작성]을 진행합니다.`,
    queryType: 'agreement',
  });

  renderApp();
  if (state.currentRoleId === 'CREDIT_STAFF') {
    showToast(`【${chosenSlot.dept} 안】이 최종 심사전략안으로 책정되었습니다! 이제 품의서를 작성하실 수 있습니다.`, 'success');
  } else {
    showToast(`【${chosenSlot.dept} 안】이 최종 심사전략안으로 책정되어 협의가 완료되었습니다.`, 'success');
  }
}

function handleAgree() {
  if (state.currentRoleId !== 'CREDIT_STAFF') {
    showToast('최종안 책정 권한은 신용관리팀 담당자(이신용 대리)에게만 있습니다.', 'warning');
    return;
  }
  finalizeProposal(state.selectedFinalSlot || 'sales');
}

function copyApprovalDraftToClipboard() {
  const d = state.draft;
  const text = `[심사전략 변경 품의서 (초안)]

1. 품의 건명: ${d.title}
- 문서번호: ${state.docNumber} (보존기간: 5년)
- 기안부서: 신용관리팀 (기안자: 이신용 대리)
- 협조부서: 영업기획팀 (최기획 대리)
- 대상여신: PL 신용대출 36개월물

2. 변경 사유 (배경 및 목적)
${d.reason}

3. 변경 내용 (심사 규칙 고도화안)
- 대상 상품: PL 신용대출 36개월물
- 기존 심사기준: DTI 40% 초과 부결 (단기조회 규칙 미적용)
- 변경 심사기준: ${d.finalRule}

4. 현황 (차주 포트폴리오 및 핵심 성과 지표)
[신용등급별 차주 분포 및 연체율 현황]
• 1~2등급(우량/예외): 142건 (1.0%) | 연체율 0.12% ➔ 정상 승인 (이탈 방지)
• 3~4등급(안정취급): 4,820건 (32.8%) | 연체율 1.15% ➔ 정상 취급
• 5~6등급(선별승인): 6,210건 (42.3%) | 연체율 2.45% ➔ 선별 승인
• 7등급(고위험부결): 3,506건 (23.9%) | 연체율 5.84% ➔ DTI 30% 부결 통제
[변경 전·후 성과 지표 비교]
• 연체율: 3.45% ➔ 2.15% (-1.30%p 개선, 부실 37.7% 감소)
• 승인율: 78.4% ➔ 76.2% (-2.20%p, 우량고객 예외 반영으로 0.9%p 회복)
• 당기순익: 142.5억 ➔ 147.3억 (+4.8억원 순증가)
• 다중채무 차단율: 18.2% ➔ 84.6% (+66.4%p 선제 차단)

5. 시행 일자
- 시행 일시: ${d.effectiveDate || '2026년 11월 1일(일) 00:00 부'}
- 적용 대상: 시행일 이후 신규 PL 신용대출(36개월물) 신청 건부터 전면 적용
- 전산 조치: 차세대 여신심사 시스템(BRE 엔진) 자동 배포 및 시행
- 사후 관리: 전산 반영 직후 30일간 일별 승인율 및 연체율 집중 모니터링
- 끝.

--------------------------------------------------
* 본 문서는 JB금융그룹 젭대리(JDBP) AI 운영 플랫폼에서 부서간 협의를 통해 자동 작성된 사내 전자결재 상신용 품의 초안입니다.`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 사내 전자결재용 품의서 본문이 복사되었습니다! 그룹웨어 기안창에 붙여넣기(Ctrl+V) 하세요.', 'success');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('📋 사내 전자결재용 품의서 본문이 복사되었습니다! 그룹웨어 기안창에 붙여넣기(Ctrl+V) 하세요.', 'success');
}

function handleSubmitApproval() {
  copyApprovalDraftToClipboard();
}

function saveDraftEdit(title, reason, finalRule, effectiveDate) {
  state.draft.title = title;
  state.draft.reason = reason;
  state.draft.finalRule = finalRule;
  if (effectiveDate) state.draft.effectiveDate = effectiveDate;
  state.isEditModalOpen = false;
  renderApp();
  showToast('품의 초안 내용이 성공적으로 수정되었습니다.');
}

// AI 품의 초안 자연어 수정 핸들러 (2단계 워크플로우: 지시/항목선택 ➔ 전·후 비교 및 최종 승인)
function openAiEditModal() {
  state.isAiEditModalOpen = true;
  state.aiEditStep = 'input';
  state.isAiEditingDraft = false;
  state.aiEditInputText = '';
  if (!state.aiEditTargets) {
    state.aiEditTargets = { title: true, reason: true, finalRule: true };
  }
  renderApp();
}

function closeAiEditModal() {
  state.isAiEditModalOpen = false;
  state.aiEditStep = 'input';
  state.isAiEditingDraft = false;
  renderApp();
}

function toggleAiEditTarget(key) {
  if (state.aiEditTargets && key in state.aiEditTargets) {
    state.aiEditTargets[key] = !state.aiEditTargets[key];
    renderApp();
  }
}

function setAllAiEditTargets(val) {
  state.aiEditTargets = {
    title: !!val,
    reason: !!val,
    finalRule: !!val,
  };
  renderApp();
}

async function requestAiDraftProposal(userPrompt) {
  const prompt = (userPrompt || state.aiEditInputText || '').trim();
  if (!prompt) {
    showToast('수정하고 싶은 내용을 자연어로 입력해 주세요.', 'info');
    return;
  }

  const { title, reason, finalRule } = state.aiEditTargets;
  if (!title && !reason && !finalRule) {
    showToast('수정할 항목(품의 제목, 변경 사유, 변경 내용 중 최소 1개 이상)을 체크해 주세요.', 'warning');
    return;
  }

  state.aiEditInputText = prompt;
  state.isAiEditingDraft = true;
  renderApp();

  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;
  const draftPayload = {
    currentDraft: {
      title: state.draft.title,
      reason: state.draft.reason,
      finalRule: state.draft.finalRule,
      effectiveDate: state.draft.effectiveDate,
    },
    targets: { title, reason, finalRule },
    prompt: prompt,
    requesterDept: currentAccount.dept,
  };

  let proposal = null;
  try {
    const res = await AiAgentClient.refineDraft(draftPayload);
    if (res && res.proposal) {
      proposal = res.proposal;
    }
  } catch (err) {
    console.error('AI Refine Draft error:', err);
  } finally {
    state.isAiEditingDraft = false;
  }

  if (proposal) {
    state.aiEditProposal = {
      title: proposal.title,
      reason: proposal.reason,
      finalRule: proposal.finalRule,
      prompt: prompt,
    };
    state.aiEditStep = 'preview';
    renderApp();
    showToast('AI 수정안이 생성되었습니다. 수정 전·후를 비교 검토해 주세요.', 'info');
  } else {
    renderApp();
  }
}

function applyAiProposalToDraft() {
  const p = state.aiEditProposal;
  if (!p) return;

  const targetNames = [];
  if (state.aiEditTargets.title) {
    state.draft.title = p.title;
    targetNames.push('품의 제목');
  }
  if (state.aiEditTargets.reason) {
    state.draft.reason = p.reason;
    targetNames.push('변경 사유');
  }
  if (state.aiEditTargets.finalRule) {
    state.draft.finalRule = p.finalRule;
    targetNames.push('변경 내용');
  }

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  state.draft.discussionHistory.unshift(`젭대리 AI: 자연어 지시("${p.prompt.slice(0, 20)}...") 반영 [항목: ${targetNames.join(', ')}] ➔ 전·후 비교 검토 후 최종 반영 완료 (${timeStr})`);

  state.isAiEditModalOpen = false;
  state.aiEditStep = 'input';
  state.aiEditInputText = '';
  renderApp();
  showToast('✨ AI 수정안이 품의서에 최종 반영되었습니다!', 'success');
}

// ========================================================
// Main UI Render Function
// ========================================================
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  if (window.JepDaeriFlow) {
    window.JepDaeriFlow.initState(state);
  }

  const currentStrat = state.strategies.find(s => s.id === state.selectedStrategyId) || state.strategies[1];
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;

  root.innerHTML = `
    <!-- Top System Header (JB우리캐피탈 테마 & JDBP Role Switcher) -->
    <header class="bg-[#0B1B33] text-white border-b border-[#1C3152] sticky top-0 z-40 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo & Brand Title: JB우리캐피탈 심볼 / 젭대리 (Biz.Platform) -->
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl overflow-hidden shadow-md border border-[#3A8BFD]/50 shrink-0 flex items-center justify-center bg-[#004C97]" title="JB우리캐피탈">
              <svg class="w-full h-full" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0L4.99762 5.08477L9.99963 0H0Z" fill="#0090D0"/>
                <path d="M0 10.0001L5.08456 5.00178L0 0V10.0001Z" fill="#009BD7"/>
                <path d="M0 10.0001L9.99963 10.0007L5.00171 4.91589L0 10.0001Z" fill="#0090D0"/>
                <path d="M4.91439 4.99784L9.99963 10.0007V0L4.91439 4.99784Z" fill="#0082C8"/>
                <path d="M9.99963 10.0007L15.0836 5.00178L9.99963 0V10.0007Z" fill="#0070BA"/>
                <path d="M9.99963 10.0007H19.9987L15.0009 4.91589L9.99963 10.0007Z" fill="#004C97"/>
                <path d="M0 10.0001L4.99762 15.0848L9.99963 10.0007L0 10.0001Z" fill="#0082C8"/>
                <path d="M0 20.0001L5.08456 15.002L0 10.0001V20.0001Z" fill="#0070BA"/>
                <path d="M0 20.0001L9.99963 20.0007L5.00171 14.9159L0 20.0001Z" fill="#0060AE"/>
                <path d="M4.91439 14.9982L9.99963 20.0007V10.0007L4.91439 14.9982Z" fill="#00519B"/>
                <path d="M9.99963 10.0007L14.997 15.0848L19.9987 10.0007H9.99963Z" fill="#1D378A"/>
                <path d="M9.99963 20.0007L15.0836 15.002L9.99963 10.0007V20.0007Z" fill="#004C97"/>
                <path d="M9.99963 20.0007H19.9987L15.0009 14.9159L9.99963 20.0007Z" fill="#1D378A"/>
                <path d="M14.9154 14.9982L20 20.0001V10.0001L14.9154 14.9982Z" fill="#1D378A"/>
                <path d="M9.99963 0L14.997 5.08477L19.9987 0H9.99963Z" fill="#0060AE"/>
                <path d="M14.9154 4.99784L20 10.0001V0L14.9154 4.99784Z" fill="#00519B"/>
                <path d="M4.25 16.218L7.71603 19.714L13.7514 13.7183L20.0121 19.9993V12.625L13.7514 6.60938L4.25 16.218Z" fill="#FEFEFE"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="font-black text-2xl text-white tracking-tight">젭대리 (Biz.Platform)</h1>
                <span class="text-[10px] font-black bg-[#EEF5FF] text-[#0565F0] px-2 py-0.5 rounded-full border border-[#D0E2FF]">JB우리캐피탈</span>
              </div>
              <p class="text-[11px] text-slate-300 font-bold hidden sm:block">AI 여신심사전략 협의 및 운영 통합 플랫폼</p>
            </div>
          </div>

          <!-- Right Controls: AI Module Interface Center Button + Role Switcher Card -->
          <div class="flex items-center gap-3">
            <!-- AI 에이전트 I/O 인터페이스 센터 버튼 -->
            <button
              type="button"
              onclick="openAiModuleConfigModal();"
              class="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all text-left shadow-sm ${
                state.aiApiConfig.mode === 'API'
                  ? (state.aiApiConfig.status === 'connected' ? 'bg-emerald-950/80 border-emerald-500/80 hover:bg-emerald-900 text-emerald-200' : 'bg-rose-950/80 border-rose-500/80 hover:bg-rose-900 text-rose-200')
                  : 'bg-[#0F2445] hover:bg-[#15315C] border-[#2A4974] hover:border-[#3A8BFD] text-slate-200'
              }"
              title="AI 에이전트 핵심 모듈 연동 I/O 인터페이스 센터 열기 (상대방 모듈 개발 연계)"
            >
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${
                  state.aiApiConfig.mode === 'API'
                    ? (state.aiApiConfig.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400')
                    : 'bg-cyan-400 animate-ping'
                }"></span>
                <span class="text-xs font-black font-mono tracking-tight text-white">AI 엔진: ${state.aiApiConfig.mode}</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${
                state.aiApiConfig.mode === 'API'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-500/20 text-cyan-300 border border-blue-400/30'
              }">
                ${state.aiApiConfig.mode === 'MOCK' ? '제작중 (MOCK)' : (state.aiApiConfig.status === 'connected' ? '실서버 연결됨' : '연결 대기')}
              </span>
              <span class="text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold px-1.5 py-0.5 rounded transition-colors hidden xl:inline">
                I/O 스펙 ⚙️
              </span>
            </button>

            <!-- Role / Account Switcher Card (4대 계정 전환) -->
            <div class="relative">
              <div id="account-card" onclick="toggleAccountMenu(event);" class="flex items-center gap-3 bg-[#0F2445] hover:bg-[#142D54] border border-[#233D66] hover:border-[#0565F0] px-4 py-2.5 rounded-2xl shadow-sm transition-all text-left cursor-pointer select-none group">
                <div class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <span class="text-sm font-black text-white group-hover:text-blue-200 transition-colors">${currentAccount.dept} ${currentAccount.name}</span>
                    <span class="text-xs text-[#3A8BFD] font-bold group-hover:translate-y-0.5 transition-transform">▾</span>
                  </div>
                </div>
                <div class="w-10 h-10 rounded-full ${currentAccount.avatarBg} flex items-center justify-center text-sm font-black text-white border-2 border-white/20 shadow-inner">
                  ${currentAccount.avatar}
                </div>
              </div>

              <!-- 4대 계정 전환 드롭다운 팝오버 (팀 이름, 직급만 표기) -->
              ${state.isAccountMenuOpen ? `
                <div id="account-dropdown-menu" class="absolute right-0 top-full mt-2 w-72 bg-[#0B1B33] border-2 border-[#233D66] rounded-2xl shadow-2xl z-50 p-2.5 space-y-1.5 animate-fadeIn text-slate-100">
                  <div class="px-2 py-1.5 border-b border-[#1C3152] flex justify-between items-center">
                    <span class="text-xs font-black text-blue-300">👤 계정 전환</span>
                    <button type="button" onclick="state.isAccountMenuOpen=false; renderApp();" class="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800">✕</button>
                  </div>

                  <div class="space-y-1">
                    ${Object.values(ACCOUNTS).map(acc => {
                      const isSelected = state.currentRoleId === acc.id;
                      return `
                        <button type="button" onclick="switchAccount('${acc.id}');" class="w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#0565F0] border-white text-white shadow-md'
                            : 'bg-[#0F2445] hover:bg-[#15315C] border-[#233D66] text-slate-200'
                        }">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-8 h-8 rounded-full ${acc.avatarBg} flex items-center justify-center text-xs font-black text-white shrink-0 border border-white/20 shadow">
                              ${acc.avatar}
                            </div>
                            <span class="text-sm font-black text-white truncate">${acc.dept} ${acc.name}</span>
                          </div>
                          ${isSelected
                            ? '<span class="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full shadow shrink-0">접속 중 ✓</span>'
                            : ''
                          }
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
          </div>

        <!-- Role-based Dynamic Process Navigation Bar (이전 구성 복원 + 월모니터링 & 기준모니터링 통합) -->
        <div class="flex flex-wrap items-center gap-2 pb-3 pt-1 border-t border-slate-800/80 w-full">
          <!-- 좌측 탭 그룹: 자연스러운 너비와 패딩으로 가로로 과도하게 퍼지지 않도록 최적화 -->
          <div class="flex flex-wrap items-center gap-2">
            ${currentAccount.allowedTabs
              .filter(tabKey => {
                if (tabKey === 'dictionary' || tabKey === 'request') return false;
                if (tabKey === 'approval') {
                  const currentTask = state.tasks.find(t => t.id === state.selectedTaskId);
                  const isTaskAgreed = state.isAgreed || currentTask?.status === 'agreed';
                  return state.currentRoleId === 'CREDIT_STAFF' && isTaskAgreed;
                }
                return true;
              })
              .map(tabKey => {
                const tabInfo = currentAccount.tabTitles[tabKey];
                const isActive = state.currentTab === tabKey;
                const currentTask = state.tasks.find(t => t.id === state.selectedTaskId);
                const isTaskAgreed = state.isAgreed || currentTask?.status === 'agreed';
                return `
                  <button id="nav-${tabKey}" onclick="switchTab('${tabKey}')" class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all border text-left relative shrink-0 ${
                    isActive
                      ? 'bg-blue-600 border-white text-white shadow-lg ring-2 ring-blue-400'
                      : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      isActive ? 'bg-white text-blue-700' : 'bg-slate-800 text-slate-300'
                    }">${tabInfo.num}</div>
                    <div class="min-w-0 pr-1">
                      <span class="text-[10px] block font-bold text-blue-200 leading-tight">${tabInfo.tag}</span>
                      <span class="text-xs sm:text-sm font-black block whitespace-nowrap leading-tight">${tabInfo.title}</span>
                    </div>
                    ${tabKey === 'collaboration' && isTaskAgreed ? '<span class="ml-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">합의완료</span>' : ''}
                    ${tabKey === 'approval' && state.isSubmitted ? '<span class="ml-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow animate-pulse">상신완료</span>' : ''}
                  </button>
                `;
              }).join('')}
          </div>
        </div>
      </div>
    </header>

    <!-- Workspace Body (최대 너비 1600px 반응형 확장) -->
    <main class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
      ${state.currentTab === 'taskList' ? renderTaskListScreen() : ''}
      ${state.currentTab === 'discovery' ? renderDiscoveryScreen() : ''}
      ${state.currentTab === 'collaboration' ? renderCollaborationScreen(currentStrat) : ''}
      ${state.currentTab === 'approval' ? renderApprovalScreen(currentStrat) : ''}
    </main>

    <!-- Global Toast Container -->
    <div id="toast-container" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none"></div>

    <!-- [신규] 심사전략 협의 안건 작성 전용 팝업 모달 -->
    ${state.isAgendaModalOpen ? renderAgendaModal() : ''}

    <!-- [신규] 월 정기 모니터링 발굴 안건 전용 팝업 모달 -->
    ${state.isMonthlyMonitoringModalOpen ? (window.JepDaeriFlow ? window.JepDaeriFlow.renderMonthlyMonitoringModal() : '') : ''}

    <!-- [신규] 분석 기준관리 (규제·제외 관리) 전용 팝업 모달 -->
    ${state.isRuleMonitoringModalOpen ? (window.JepDaeriFlow ? window.JepDaeriFlow.renderRuleMonitoringModal() : '') : ''}

    <!-- AI 선행 탐색 진행 애니메이션 모달 -->
    ${state.isAiPreAnalyzing ? renderAiPreAnalyzingModal() : ''}

    <!-- 신용관리팀 알림 모달 -->
    ${state.showAssigneeAlert ? renderAssigneeNotificationModal() : ''}

    <!-- Edit Draft Modal (직접 수정 모달) -->
    ${state.isEditModalOpen ? renderEditModal() : ''}

    <!-- AI 자연어 수정 모달 -->
    ${state.isAiEditModalOpen ? renderAiEditModal() : ''}

    <!-- AI What-If 자연어 분석 & 최종안 도출 모달 (What-If Lab 팝업) -->
    ${state.isAiWhatIfModalOpen ? renderAiWhatIfModal() : ''}

    <!-- Variable Detail Modal -->
    ${state.selectedVariableModal ? renderVariableModal(state.selectedVariableModal) : ''}

    <!-- AI 에이전트 연동 I/O 인터페이스 센터 모달 -->
    ${state.isAiModuleModalOpen ? renderAiModuleConfigModal() : ''}
  `;
}

// ========================================================
// 상단 선택 안건 배너 (작업 중 언제든 목록으로 이동)
// ========================================================
function renderActiveTaskBanner(stepLabel) {
  const task = state.tasks.find(t => t.id === state.selectedTaskId) || state.tasks[0];
  return `
    <div class="bg-[#0B1B33] border border-[#1E3456] text-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <button type="button" onclick="switchTab('taskList');" class="bg-[#0565F0] hover:bg-[#0452C7] text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-sm border border-[#3A8BFD] flex items-center gap-1.5 shrink-0 transition-transform active:scale-95">
          <span>←</span>
          <span>전체 업무 목록</span>
        </button>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="bg-[#EEF5FF]/10 text-[#7FB5FF] border border-[#3A8BFD]/30 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">진행 안건</span>
            <span class="font-mono text-xs font-bold text-slate-300">${task.id}</span>
            <span class="bg-[#0F2445] text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded border border-[#233D66]">${task.product}</span>
          </div>
          <h2 class="text-sm sm:text-base font-black text-white truncate mt-1">${task.title}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs text-blue-200 font-bold bg-[#0F2445] border border-[#233D66] px-3.5 py-1.5 rounded-xl">
          📍 현재: ${stepLabel || task.stepBadge}
        </span>
      </div>
    </div>
  `;
}

// ========================================================
// 0. 첫 화면: 업무 진행 현황 및 내 할 일 목록 (To-Do List)
// ========================================================
function renderTaskListScreen() {
  const currentAccount = ACCOUNTS[state.currentRoleId];
  
  // 각 역할(영업 담당자, 신용관리 담당자, 신용관리 팀장, 신용관리 본부장) 본인이 처리하는 화면까지 온 건만 필터링 (최대 3단계: 부서협의까지)
  const roleReachableTasks = state.tasks.filter(t => isTaskVisibleForRole(t, state.currentRoleId));
  
  // 검색 조건 필터링 (등록일자 from ~ to, 내 즉시 처리 대기건)
  const filteredByCriteria = roleReachableTasks.filter(t => {
    // 1. 등록일자 From ~ To 필터
    const taskDate = t.requestDate ? t.requestDate.split(' ')[0] : '';
    if (state.searchFilter.dateFrom && taskDate < state.searchFilter.dateFrom) return false;
    if (state.searchFilter.dateTo && taskDate > state.searchFilter.dateTo) return false;

    // 2. 내가 처리해야 할 건 (Action) 검색조건 분리
    if (state.searchFilter.onlyMyAction && !t.actionInfo[state.currentRoleId]?.isMyAction) {
      return false;
    }

    return true;
  });

  // KPI 요약 카드 4종 건수 계산: 전체건수 = 1단계(의뢰/접수) + 2단계(다자간 부서 협의) 정확한 합계 보장!
  const totalCount = filteredByCriteria.length;
  const step1Count = filteredByCriteria.filter(t => t.stepNum === 1).length;
  const step2Count = filteredByCriteria.filter(t => t.stepNum === 2 && t.status !== 'agreed').length;
  const agreedCount = filteredByCriteria.filter(t => t.status === 'agreed').length;

  // 내 즉시 처리 대기 건수 (현재 날짜 조건 만족 기준)
  const myActionAvailableCount = roleReachableTasks.filter(t => {
    const taskDate = t.requestDate ? t.requestDate.split(' ')[0] : '';
    if (state.searchFilter.dateFrom && taskDate < state.searchFilter.dateFrom) return false;
    if (state.searchFilter.dateTo && taskDate > state.searchFilter.dateTo) return false;
    return t.actionInfo[state.currentRoleId]?.isMyAction;
  }).length;

  // 상단 카드 필터(전체, 1단계, 2단계, 부서합의완료) 클릭에 따른 최종 노출 안건 목록
  const filteredTasks = filteredByCriteria.filter(t => {
    if (state.taskFilter === 'STEP1') return t.stepNum === 1;
    if (state.taskFilter === 'STEP2') return t.stepNum === 2 && t.status !== 'agreed';
    if (state.taskFilter === 'AGREED_DRAFT') return t.status === 'agreed';
    return true; // 'ALL'
  });

  // [사용자 요청] 안건 작성일자(requestDate) 기준 내림차순 정렬 (최신 작성일자가 최상단에 오도록 정렬)
  filteredTasks.sort((a, b) => {
    const timeA = a.requestDate ? new Date(a.requestDate.replace(/-/g, '/')).getTime() : 0;
    const timeB = b.requestDate ? new Date(b.requestDate.replace(/-/g, '/')).getTime() : 0;
    if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
      return timeB - timeA;
    }
    return (b.requestDate || '').localeCompare(a.requestDate || '');
  });

  return `
    <div class="space-y-6">
      <!-- 1. Top Title & Quick Action -->
      <div class="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-blue-200">
              첫 화면 · 업무 현황 리스트 (To-Do)
            </span>
            <span class="text-xs text-slate-500 font-bold">[${currentAccount.name}] 본인 도달 안건 ${totalCount}건</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 mt-1">심사전략 업무 진행 현황 및 내 할 일</h1>
          <p class="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            현재 <strong>[${currentAccount.dept} ${currentAccount.name}]</strong> 님 본인이 처리하는 단계에 도달한 안건 목록입니다.
          </p>
        </div>

        <!-- 상단 퀵 액션 버튼 그룹 (분석 기준관리 팝업 + 월 정기 모니터링 팝업 + 신규 협의 안건 작성 팝업) -->
        <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
          <!-- 0. 분석 기준관리 (규제·제외 관리) 팝업 오픈 버튼 (월 정기 모니터링 버튼 왼쪽, 신용관리팀 담당자 전용) -->
          ${state.currentRoleId === 'CREDIT_STAFF' ? `
            <button
              type="button"
              onclick="openRuleMonitoringModal();"
              class="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border-2 border-indigo-500/60 flex items-center justify-center gap-2 transform active:scale-95 transition-all group shrink-0"
            >
              <span class="text-base group-hover:scale-110 transition-transform">🛡️</span>
              <span>분석 기준관리</span>
            </button>
          ` : ''}

          <!-- 1. 월 정기 모니터링 팝업 오픈 버튼 (신규 협의 안건 작성하기 왼쪽) -->
          <button
            type="button"
            onclick="openMonthlyMonitoringModal();"
            class="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border-2 border-slate-700 flex items-center justify-center gap-2 transform active:scale-95 transition-all group"
          >
            <span class="text-base group-hover:scale-110 transition-transform">📊</span>
            <span>월 정기 모니터링</span>
          </button>

          <!-- 2. 신규 협의 안건 작성 액션 버튼 (실무자 전용) -->
          ${(state.currentRoleId === 'SALES_STAFF' || state.currentRoleId === 'CREDIT_STAFF') ? `
            <button
              type="button"
              onclick="createNewTaskRequest();"
              class="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border-2 border-blue-500 flex items-center justify-center gap-2 transform active:scale-95 transition-all shrink-0"
            >
              <span class="text-base">➕</span>
              <span>신규 협의 안건 작성하기</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 2. 안건 상세 검색조건 바 (등록일자 & 내 처리 대기 토글) -->
      <div class="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-slate-800">🔍 안건 상세 검색조건</span>
            <span class="text-xs text-slate-500 font-medium">| 등록일자 및 본인 처리 대기 여부로 안건을 필터링합니다.</span>
          </div>
          <button type="button" onclick="resetSearchFilters();" class="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-all shadow-sm">
            <span>↺</span>
            <span>검색조건 초기화 (당월 기본값)</span>
          </button>
        </div>

        <!-- 필터 컨트롤 블록 (넉넉한 간격 유지) -->
        <div class="flex flex-wrap items-center gap-3.5 text-xs">
          <!-- 1. 등록일자 From ~ To + 단축버튼 블록 -->
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-inner">
            <span class="font-black text-slate-700 whitespace-nowrap flex items-center gap-1">
              <span>📅</span>
              <span>등록일자</span>
            </span>
            <div class="flex items-center gap-1.5">
              <input type="date" value="${state.searchFilter.dateFrom}" onchange="setSearchDate('dateFrom', this.value);" class="bg-white border-2 border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none w-32 shadow-sm" />
              <span class="text-slate-400 font-bold">~</span>
              <input type="date" value="${state.searchFilter.dateTo}" onchange="setSearchDate('dateTo', this.value);" class="bg-white border-2 border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none w-32 shadow-sm" />
            </div>
            <!-- 단축 버튼 -->
            <div class="flex items-center gap-1 shrink-0">
              <button type="button" onclick="setDatePreset('CURRENT_MONTH');" class="px-2.5 py-1 rounded-lg font-bold border transition-all ${
                state.searchFilter.datePreset === 'CURRENT_MONTH' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }">당월</button>
              <button type="button" onclick="setDatePreset('LAST_3_MONTHS');" class="px-2.5 py-1 rounded-lg font-bold border transition-all ${
                state.searchFilter.datePreset === 'LAST_3_MONTHS' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }">3개월</button>
              <button type="button" onclick="setDatePreset('ALL');" class="px-2.5 py-1 rounded-lg font-bold border transition-all ${
                state.searchFilter.datePreset === 'ALL' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }">전체</button>
            </div>
          </div>

          <!-- [사용자 요청] 2. 진행 상태 콤보박스 (등록일자 바로 우측) -->
          <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-inner">
            <span class="font-black text-slate-700 whitespace-nowrap flex items-center gap-1">
              <span>📌</span>
              <span>진행 상태</span>
            </span>
            <select
              id="task-status-combo"
              onchange="setTaskFilter(this.value);"
              class="bg-white border-2 border-slate-300 hover:border-blue-500 rounded-lg px-3 py-1 text-xs font-black text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm cursor-pointer transition-colors"
            >
              <option value="ALL" ${state.taskFilter === 'ALL' ? 'selected' : ''}>전체 진행 상태 (${totalCount}건)</option>
              <option value="STEP1" ${state.taskFilter === 'STEP1' ? 'selected' : ''}>1단계: 업무의뢰 · 접수 (${step1Count}건)</option>
              <option value="STEP2" ${state.taskFilter === 'STEP2' ? 'selected' : ''}>2단계: 다자간 부서 협의 (${step2Count}건)</option>
              <option value="AGREED_DRAFT" ${state.taskFilter === 'AGREED_DRAFT' ? 'selected' : ''}>부서 합의 완료 (품의 대상: ${agreedCount}건)</option>
            </select>
          </div>

          <!-- 3. 내 즉시 처리 대기 건만 보기 토글 버튼 -->
          <div class="sm:ml-auto">
            <button type="button" onclick="toggleOnlyMyAction();" class="px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2.5 shadow-sm ${
              state.searchFilter.onlyMyAction
                ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                : 'bg-white hover:bg-rose-50/50 border-slate-300 hover:border-rose-400 text-slate-700'
            }">
              <span class="w-4 h-4 rounded border flex items-center justify-center ${state.searchFilter.onlyMyAction ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-400 bg-white'}">
                ${state.searchFilter.onlyMyAction ? '✓' : ''}
              </span>
              <span class="font-black text-xs ${state.searchFilter.onlyMyAction ? 'text-rose-700' : 'text-slate-800'}">내 즉시 처리 대기만</span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full ${state.searchFilter.onlyMyAction ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'}">
                ${myActionAvailableCount}건 Action
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4. 현재 안건 필터 상태 바 -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-slate-600">조회 결과:</span>
          <span class="font-black text-slate-900">총 ${totalCount}건</span>
          <span class="text-slate-400">|</span>
          <span class="text-slate-600">1단계 <strong class="text-blue-600">${step1Count}</strong>건</span>
          <span class="text-slate-400">/</span>
          <span class="text-slate-600">2단계 협의중 <strong class="text-amber-600">${step2Count}</strong>건</span>
          <span class="text-slate-400">/</span>
          <span class="text-slate-600">부서합의완료 <strong class="text-emerald-600">${agreedCount}</strong>건</span>
          ${state.taskFilter !== 'ALL' ? `
            <span class="bg-blue-600 text-white font-black px-2 py-0.5 rounded-full text-[11px] ml-1">
              ${state.taskFilter === 'STEP1' ? '1단계 안건만 표시 중' : state.taskFilter === 'STEP2' ? '2단계 협의 진행건만 표시 중' : '부서합의완료(품의초안 대상) 안건만 표시 중'}
            </span>
          ` : ''}
          ${state.searchFilter.onlyMyAction ? `
            <span class="bg-rose-600 text-white font-black px-2 py-0.5 rounded-full text-[11px]">
              내 처리 대기건만 필터링 중
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-2">
          ${state.taskFilter !== 'ALL' ? `
            <button type="button" onclick="setTaskFilter('ALL');" class="text-blue-700 hover:text-blue-900 font-black text-xs hover:underline flex items-center gap-1">
              <span>✕</span>
              <span>전체 단계 보기로 복귀</span>
            </button>
          ` : ''}
          ${state.currentRoleId === 'CREDIT_STAFF' && filteredByCriteria.some(t => t.status === 'agreed') ? `
            <button type="button" onclick="setTaskFilter('AGREED_DRAFT');" class="text-[11px] text-blue-800 bg-blue-100 hover:bg-blue-200 font-bold px-2 py-0.5 rounded-md border border-blue-200 transition-colors">
              📝 부서합의 완료건 품의서 초안 작성 가능
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 4. 안건별 상세 단계 카드 리스트 -->
      <div class="space-y-4">
        ${filteredTasks.length === 0 ? `
          <div class="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div class="text-4xl mb-3">📂</div>
            <h3 class="text-base font-black text-slate-800">해당 조건에 해당하는 진행 안건이 없습니다.</h3>
            <p class="text-xs text-slate-500 mt-1">현재 [${currentAccount.dept} ${currentAccount.name}] 본인이 처리하는 단계에 도달한 안건만 표시됩니다.</p>
          </div>
        ` : filteredTasks.map(task => {
          const action = task.actionInfo[state.currentRoleId] || { actionName: '안건 상세 조회', targetTab: 'request', isMyAction: false, desc: '진행 현황 조회' };

          const urgencyBg =
            task.urgency === '긴급' ? 'bg-rose-100 text-rose-800 border-rose-300 font-black' :
            task.urgency === '높음' ? 'bg-amber-100 text-amber-800 border-amber-300 font-black' :
            task.urgency === '완료' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' :
            'bg-blue-100 text-blue-800 border-blue-300 font-bold';

          const isTaskAgreed = task.status === 'agreed';

          return `
            <div class="bg-white border-2 ${action.isMyAction ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-slate-300 shadow-sm'} rounded-2xl p-5 sm:p-6 transition-all hover:border-blue-500">
              <!-- 상단 메타 바 (관리번호 바로 오른쪽에 현재 진행 상태 배치) -->
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs px-2.5 py-0.5 rounded-full border ${urgencyBg}">
                    ${task.urgency}
                  </span>
                  <span class="font-mono text-xs font-black text-slate-500">관리번호: ${task.id}</span>
                  
                  <!-- [신규] 관리번호 오른쪽 공간: 현재 진행 상태 뱃지 -->
                  <span class="text-xs font-black px-3 py-0.5 rounded-full border shadow-2xs ${
                    isTaskAgreed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : task.stepNum === 1
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }">
                    ${isTaskAgreed ? '🤝 부서 합의 완료' : (task.stepBadge || (task.stepNum === 1 ? '1단계: 접수 대기 중' : '2단계: 다자간 협의 진행 중'))}
                  </span>

                  <span class="bg-slate-100 border border-slate-300 text-slate-700 text-xs px-2.5 py-0.5 rounded-md font-bold">
                    ${task.product}
                  </span>
                  ${isTaskAgreed && state.currentRoleId === 'CREDIT_STAFF' ? `
                    <span class="bg-blue-100 border border-blue-300 text-blue-800 text-xs px-2.5 py-0.5 rounded-md font-black animate-pulse">
                      📝 품의서 초안 작성 가능
                    </span>
                  ` : ''}
                  ${action.isMyAction ? `
                    <span class="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                      내 처리 필요
                    </span>
                  ` : ''}
                </div>
                <div class="text-xs text-slate-500 font-bold">
                  기안 일시: <span class="font-mono text-slate-800 font-black">${task.requestDate}</span>
                </div>
              </div>

              <!-- 타이틀 및 내용 (좌측) + 단계별 버튼 (오른쪽 끝 공간 배치) -->
              <div class="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <!-- 좌측: 제목 및 요약 내용 -->
                <div class="flex-1 min-w-0">
                  <h3 onclick="selectTask('${task.id}', '${action.targetTab}');" class="text-lg sm:text-xl font-black text-slate-900 hover:text-blue-600 transition-colors cursor-pointer leading-snug">
                    ${task.title}
                  </h3>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-600 font-bold">
                    <span>🎯 <strong>개편 목표:</strong> <span class="text-blue-900 font-black">${task.goalText}</span></span>
                    <span>👥 <strong>의뢰:</strong> ${task.requesterDept} ${task.requesterName}</span>
                    <span>➔ <strong>담당:</strong> ${task.assigneeDept} ${task.assigneeName}</span>
                  </div>
                </div>

                <!-- 우측 끝 공간: 단계별 액션 버튼 -->
                <div class="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onclick="selectTask('${task.id}', '${action.targetTab}');"
                    class="px-6 py-3.5 ${
                      action.isMyAction
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-500'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300'
                    } font-black text-xs sm:text-sm rounded-xl transition-all transform active:scale-95 flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>${action.actionName}</span>
                    <span class="text-base font-black">➔</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ========================================================
// [신규] 심사전략 협의 안건 작성 전용 팝업 모달
// 사용자 요구사항: 협의 안건 작성 화면은 팝업으로 떠서 작성하고 상대 부서로 상정만 수행
// ========================================================
function renderAgendaModal() {
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.SALES_STAFF;
  const isSalesUser = currentAccount.dept.includes('영업');
  const isCreditToSales = !isSalesUser;
  
  // 현재 로그인한 부서가 기안 부서, 상대 부서가 수신 부서로 무조건 픽스!
  const requesterDept = isSalesUser ? '영업기획팀' : '신용관리팀';
  const requesterName = currentAccount.name;
  const assigneeDept = isSalesUser ? '신용관리팀' : '영업기획팀';
  const assigneeName = isSalesUser ? '이신용 대리' : '최기획 대리';
  const assignedTo = `${assigneeDept} ${assigneeName}`;

  // state.taskRequest 동기화
  state.taskRequest.requesterDept = requesterDept;
  state.taskRequest.requesterName = requesterName;
  state.taskRequest.assignedTo = assignedTo;
  state.taskRequest.direction = isSalesUser ? 'SALES_TO_CREDIT' : 'CREDIT_TO_SALES';

  const req = state.taskRequest;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <!-- 모달 컨테이너 (스크롤 분리 및 최대 높이 92vh) -->
      <div class="bg-white border-2 border-blue-500 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        <!-- 1. 모달 헤더 (프리미엄 JB우리캐피탈 네이비) -->
        <div class="bg-gradient-to-r from-[#0B1B33] via-[#0F2445] to-[#15315C] text-white p-5 sm:p-6 flex items-center justify-between gap-4 border-b border-[#233D66] shrink-0">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono font-bold text-blue-200 bg-white/10 px-2.5 py-0.5 rounded border border-white/20">문서 번호: ${req.id}</span>
              <span class="text-xs font-black ${isSalesUser ? 'bg-amber-400 text-slate-950' : 'bg-blue-400 text-slate-950'} px-2.5 py-0.5 rounded-full shadow-xs">
                ${isSalesUser ? '🏢 영업기획팀 기안 ➔ 신용관리팀 요청 (취급확대/완화)' : '🛡️ 신용관리팀 기안 ➔ 영업기획팀 요청 (리스크방어/강화)'}
              </span>
              <span class="bg-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                ${req.urgency || '정기'} 안건
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>📝 심사전략 협의 안건 작성</span>
              <span class="text-xs font-normal text-slate-300 hidden sm:inline">(작성 후 상대 부서로 안건 상정)</span>
            </h2>
          </div>
          <!-- 우측 상단 닫기 X 버튼 -->
          <button
            type="button"
            onclick="closeAgendaModal();"
            class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-rose-300 flex items-center justify-center font-black text-lg transition-all border border-white/20 shrink-0"
            title="작성 취소하고 팝업 닫기"
          >
            ✕
          </button>
        </div>

        <!-- 2. 모달 바디 (스크롤 가능한 폼 영역) -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-slate-50/60 text-slate-900">

          <!-- 월 정리 모니터링 연동 안내 배너 (모니터링에서 넘어온 경우 표시) -->
          ${req.backgroundReason && req.backgroundReason.includes('월간 모니터링') ? `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
              <span class="text-2xl shrink-0">💡</span>
              <div class="text-xs">
                <p class="font-black text-blue-950 text-sm">
                  [월 정리 모니터링 발굴 안건 자동 입력됨]
                </p>
                <p class="text-blue-800 font-medium mt-1 leading-relaxed">
                  젭대리 AI가 매월 찾아놓은 최적 안건의 발굴 사유, 제안 조건, 예상 영향도 지표가 폼에 기본 완성되어 있습니다. 내용을 확인하신 후 하단의 <strong>[🚀 협의 안건 공식 상정]</strong> 버튼을 누르면 상대방 부서([${assigneeDept}])로 전달되어 접수 후 부서간 협의가 시작됩니다.
                </p>
              </div>
            </div>
          ` : ''}

          <!-- 안건 작성 폼 -->
          <form onsubmit="event.preventDefault(); submitTaskRequest();" class="space-y-5 text-sm">
            <!-- 부서 및 기안/수신 정보 테이블 (현재 로그인 인원에 따라 픽스) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-black text-slate-700">기안(발의) 부서</label>
                  <span class="text-[10px] text-slate-500 font-bold">🔒 로그인 부서 고정</span>
                </div>
                <input
                  type="text"
                  value="${requesterDept}"
                  readonly
                  class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 font-black text-slate-900 cursor-not-allowed shadow-2xs"
                />
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-black text-slate-700">기안 담당자</label>
                  <span class="text-[10px] text-slate-500 font-bold">🔒 로그인 담당자</span>
                </div>
                <input
                  type="text"
                  value="${requesterName}"
                  readonly
                  class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 font-black text-slate-900 cursor-not-allowed shadow-2xs"
                />
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-black text-blue-950">수신(상대방) 부서</label>
                  <span class="text-[10px] text-blue-700 font-bold">🎯 요청 대상 고정</span>
                </div>
                <input
                  type="text"
                  value="${assignedTo}"
                  readonly
                  class="w-full bg-blue-50 border-2 border-blue-400 rounded-lg p-2.5 font-black text-blue-950 cursor-not-allowed shadow-2xs"
                />
              </div>
            </div>

            <!-- 안건 건명 -->
            <div>
              <label class="block text-sm font-black text-slate-800 mb-1.5">협의 안건 건명</label>
              <input
                type="text"
                value="${req.title || ''}"
                oninput="state.taskRequest.title=this.value;"
                class="w-full bg-slate-50 focus:border-blue-600 border-2 border-slate-300 rounded-xl p-3 font-black text-slate-900 text-base focus:outline-none"
                placeholder="예: [긴급] PL 신용대출 36개월물 심사기준 개편 협의 건"
                required
              />
            </div>

            <!-- 대상 상품 및 최적화 목표 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-black text-slate-800 mb-1.5">대상 여신 상품</label>
                <select
                  onchange="state.taskRequest.targetProduct=this.value; if(state.constraint) state.constraint.targetProduct=this.value; renderApp();"
                  class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 font-bold text-slate-900"
                >
                  <option value="PL 신용대출 36개월물" ${req.targetProduct === 'PL 신용대출 36개월물' ? 'selected' : ''}>PL 신용대출 36개월물 (전체 184,200건)</option>
                  <option value="직장인 프라임 신용대출" ${req.targetProduct === '직장인 프라임 신용대출' ? 'selected' : ''}>직장인 프라임 신용대출 (72,000건)</option>
                  <option value="중금리 햇살론 대환 48개월물" ${req.targetProduct === '중금리 햇살론 대환 48개월물' ? 'selected' : ''}>중금리 햇살론 대환 48개월물 (41,500건)</option>
                  <option value="JB 오토론 (신차/중고차)" ${req.targetProduct === 'JB 오토론 (신차/중고차)' ? 'selected' : ''}>JB 오토론 (신차/중고차) (68,000건)</option>
                  <option value="청년 맞춤형 버팀목 전세대출" ${req.targetProduct === '청년 맞춤형 버팀목 전세대출' ? 'selected' : ''}>청년 맞춤형 버팀목 전세대출 (52,000건)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-black text-slate-800 mb-1.5">협의 제안 목표</label>
                <div class="grid grid-cols-3 gap-2">
                  ${[
                    { id: 'delinquency', label: '연체율 방어', icon: '🔴' },
                    { id: 'profit', label: '수익성 증대', icon: '🟢' },
                    { id: 'conversion', label: '승인율 방어', icon: '🔵' }
                  ].map(t => `
                    <button
                      type="button"
                      onclick="state.taskRequest.targetMetric='${t.id}'; if(state.constraint) state.constraint.targetMetric='${t.id}'; renderApp();"
                      class="p-2.5 rounded-xl border-2 text-center transition-all ${
                        req.targetMetric === t.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-black shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }"
                    >
                      <span class="block text-xs">${t.icon}</span>
                      <span class="text-xs font-bold">${t.label}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- 안건 발의 배경 및 사유 -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-black text-slate-800">
                  안건 발의 배경 및 제안 내용
                </label>
                <span class="text-xs text-slate-500 font-medium">상대방 부서에서 접수 시 검토할 핵심 사유</span>
              </div>
              <textarea
                rows="4"
                oninput="state.taskRequest.backgroundReason=this.value;"
                class="w-full bg-slate-50 focus:border-blue-600 border-2 border-slate-300 rounded-xl p-3.5 text-slate-900 leading-relaxed font-medium focus:outline-none"
                placeholder="발의 사유 및 상대방 부서에 요청할 조율 내용을 상세히 기재해주세요."
                required
              >${req.backgroundReason || ''}</textarea>
            </div>

            <!-- 제약 조건 설정 (승인율 하락폭, 최소 표본) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs font-black text-slate-700">승인율 최대 허용 변동폭</span>
                  <span class="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">-${req.maxApprovalDrop || 4.2}%p 이내</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.5"
                  value="${req.maxApprovalDrop || 4.2}"
                  oninput="state.taskRequest.maxApprovalDrop=parseFloat(this.value); if(state.constraint) state.constraint.maxApprovalDrop=parseFloat(this.value); renderApp();"
                  class="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs font-black text-slate-700">최소 표본 비중 요건</span>
                  <span class="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">${req.minSampleSize || 1.0}% 이상</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value="${req.minSampleSize || 1.0}"
                  oninput="state.taskRequest.minSampleSize=parseFloat(this.value); if(state.constraint) state.constraint.minSampleSize=parseFloat(this.value); renderApp();"
                  class="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <!-- 프로세스 및 부서간 협의 팁 안내 바 -->
            <div class="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs">
              <span class="font-black text-blue-900 block flex items-center gap-1">
                <span>💡</span>
                <span>부서간 협의 진행 안내</span>
              </span>
              <p class="text-[11px] text-blue-800 font-medium mt-1 leading-snug">
                ${isCreditToSales
                  ? '신용관리팀 안건 상정 시, 영업기획팀이 우량 차주(1~2등급)에 대한 예외 적용이나 한도 유예 조건을 제시할 수 있도록 여지를 열어두면 원활한 합의가 가능합니다.'
                  : '영업기획팀 안건 상정 시, 무리한 승인율 상승 대신 연체율 목표치를 준수할 수 있는 우량 차주군 특정 조건을 제시하면 신용관리팀 접수가 신속히 이뤄집니다.'
                }
              </p>
            </div>
          </form>
        </div>

        <!-- 3. 모달 푸터 (하단 고정 액션 바) -->
        <div class="border-t-2 border-slate-200 bg-white p-4 sm:px-7 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            onclick="closeAgendaModal();"
            class="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-black text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <span>✕</span>
            <span>작성 취소 (팝업 닫기)</span>
          </button>
          
          <button
            type="button"
            onclick="submitTaskRequest();"
            class="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base rounded-xl shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2.5 border-2 border-blue-400"
          >
            <span class="text-xl">🚀</span>
            <span>협의 안건 공식 상정 및 상대방 부서 전달</span>
            <span class="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">➔ 다자간 협의 대기로 이동</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// 하위 호환성 유지
function renderRequestScreen() {
  return renderAgendaModal();
}

// AI 사전 선행 탐색 모달
function renderAiPreAnalyzingModal() {
  return `
    <div onclick="state.isAiPreAnalyzing=false; renderApp();" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn cursor-pointer">
      <div onclick="event.stopPropagation();" class="bg-white border-2 border-blue-500 rounded-3xl w-full max-w-lg p-8 shadow-2xl text-slate-900 text-center space-y-5 cursor-default relative">
        <button type="button" onclick="state.isAiPreAnalyzing=false; renderApp();" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-black text-lg p-1">✕</button>
        <div class="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto text-3xl shadow-md">
          🤖
        </div>
        <div>
          <h3 class="text-xl font-black text-slate-900">젭대리 AI 사전 시뮬레이션 수행 중</h3>
          <p class="text-xs text-slate-600 mt-1">
            상정된 안건 조건에 맞춰 184,200건 데이터를 전수 분석하여 5대 최적 대안을 도출합니다.
          </p>
        </div>

        <div class="space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
          <div class="flex items-center gap-2 text-emerald-700">
            <span>✓</span> <span>대상 상품 및 제약조건 기준 인식 완료</span>
          </div>
          <div class="flex items-center gap-2 text-emerald-700">
            <span>✓</span> <span>184,200건 과거 데이터 전수 스캔 및 6개 단조 변수 결합 축 분석</span>
          </div>
          <div class="flex items-center gap-2 text-blue-700 animate-pulse">
            <span>⚡</span> <span>OOT 백테스트 검증 및 상위 5대 파레토 최적안 패키징 완료</span>
          </div>
        </div>

        <button type="button" onclick="state.isAiPreAnalyzing=false; renderApp();" class="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all">
          <span>확인 (부서간 협의 화면 보기)</span>
        </button>
      </div>
    </div>
  `;
}

// 신용관리팀 알림 팝업 모달
function renderAssigneeNotificationModal() {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white border-2 border-slate-400 rounded-3xl w-full max-w-xl p-7 shadow-2xl text-slate-900 space-y-5">
        <div class="flex items-start justify-between border-b-2 border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
              🔔
            </div>
            <div>
              <span class="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">업무 배정 알림</span>
              <h3 class="text-lg font-black text-slate-900 mt-1">영업기획팀의 심사기준 개편 의뢰 접수</h3>
            </div>
          </div>
          <button onclick="state.showAssigneeAlert=false; renderApp();" class="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
        </div>

        <div class="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-xs space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-black text-blue-900 text-sm">젭대리 AI 선행 분석 보고:</span>
            <span class="text-blue-700 font-bold">분석 완료</span>
          </div>
          <p class="text-slate-800 leading-relaxed font-medium">
            이신용 대리님, 영업기획팀 요청서를 기반으로 18만 건 백테스트를 선행 완료했습니다.<br />
            승인율 하락 -3.1%p 방어, 연체율 -1.5%p 감소, 순이익 +4.0억 원을 달성하는 <strong>[안 2 · 균형 권장안]을 1순위로 사전 추천</strong>합니다.
          </p>
        </div>

        <div class="flex gap-3 pt-2">
          <button onclick="openAssigneeWorkspace()" class="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-lg transition-all">
            👉 분석 결과 확인 및 자연어 튜닝 (신용관리팀 워크스페이스)
          </button>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 2. AI 전략 탐색 & 자연어 워크스페이스 (신용관리팀)
// ========================================================
function renderDiscoveryScreen() {
  return `
    <div class="space-y-6">
      ${renderActiveTaskBanner('2단계: AI 전략탐색 & 자연어 튜닝')}
      <!-- 자연어 에이전트 대화 패널 -->
      <div class="bg-gradient-to-r from-[#0B192C] via-slate-900 to-[#1E3A8A] text-white border-2 border-blue-600 rounded-2xl p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-blue-700 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">
              🤖
            </div>
            <div>
              <h3 class="font-black text-base text-white">젭대리 AI 전략 튜닝 대화창</h3>
              <p class="text-xs text-blue-200">원하시는 추가 조건을 자연어로 입력하시면 시뮬레이션을 즉시 다시 계산합니다.</p>
            </div>
          </div>
          <span class="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full">자연어 지원</span>
        </div>

        <!-- 대화 내역 -->
        <div class="space-y-3 max-h-52 overflow-y-auto pr-2">
          ${state.agentChat.map(c => `
            <div class="flex ${c.sender === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-2xl rounded-2xl p-3.5 text-xs sm:text-sm font-medium leading-relaxed ${
                c.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md font-bold'
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md whitespace-pre-line'
              }">
                ${c.message}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 추천 질문 칩 -->
        <div class="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span class="text-blue-300 font-bold mr-1">추천 질의:</span>
          <button type="button" onclick="handleSendAgentChat('1~2등급 우량고객은 예외로 빼주고 손익 다시 계산해줘')" class="bg-blue-800/80 hover:bg-blue-700 text-blue-100 px-3 py-1.5 rounded-full border border-blue-600 font-bold transition-all">
            💬 "1~2등급 우량고객은 예외로 빼주고 손익 다시 계산해줘"
          </button>
          <button type="button" onclick="handleSendAgentChat('DTI 기준을 32%로 좀 완화하면 승인율이 얼마나 회복돼?')" class="bg-blue-800/80 hover:bg-blue-700 text-blue-100 px-3 py-1.5 rounded-full border border-blue-600 font-bold transition-all">
            💬 "DTI 기준을 32%로 풀면 승인율 얼마나 회복돼?"
          </button>
        </div>

        <!-- 입력 폼 -->
        <form onsubmit="event.preventDefault(); handleSendAgentChat();" class="flex gap-2 pt-1">
          <input
            type="text"
            id="agent-chat-input"
            value="${state.chatInputText}"
            oninput="state.chatInputText=this.value;"
            placeholder="자연어로 지시하세요... (예: 1~2등급 우량고객 예외 처리해줘, DTI 32%로 완화해줘)"
            class="flex-1 bg-slate-950 border-2 border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
          />
          <button type="submit" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5">
            <span>지시 전송</span>
            <span>➔</span>
          </button>
        </form>
      </div>

      <!-- 3대 추천 전략 비교 카드 Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-black text-slate-900">
              🏆 AI 도출 3대 추천 전략 비교
            </h3>
            <p class="text-xs text-slate-500 font-medium">영업기획팀 의뢰 조건 충족 여부를 확인하고 협의에 올릴 안을 선택하세요.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          ${state.strategies.map((strat, idx) => {
            const isSelected = strat.id === state.selectedStrategyId;
            return `
              <div onclick="selectStrategy('${strat.id}')" class="relative rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between border-2 bg-white shadow-md ${
                isSelected
                  ? 'border-blue-600 ring-4 ring-blue-100 shadow-xl'
                  : 'border-slate-300 hover:border-slate-400'
              }">
                ${strat.isRecommended ? `
                  <div class="absolute -top-3.5 right-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    ★ AI 1순위 추천안
                  </div>
                ` : ''}

                <div class="space-y-3.5">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-black">
                        ${idx + 1}
                      </span>
                      <h4 class="font-black text-lg text-slate-900">${strat.name}</h4>
                    </div>
                    <p class="text-xs text-slate-500 font-medium mt-1">${strat.subtitle}</p>
                  </div>

                  <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <span class="text-xs font-bold text-blue-900 block mb-1">적용 심사 기준:</span>
                    <p class="text-xs font-black text-blue-950 font-mono leading-relaxed">${strat.ruleDescription}</p>
                  </div>

                  <div class="space-y-2 pt-1">
                    <div class="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span class="text-xs font-bold text-slate-600">연체율 개선</span>
                      <span class="text-base font-black text-emerald-600">${strat.delinquencyDiff}%p 감소</span>
                    </div>
                    <div class="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span class="text-xs font-bold text-slate-600">예상 순이익</span>
                      <span class="text-base font-black text-blue-600">+${strat.profitDiff.toFixed(1)}억원 증가</span>
                    </div>
                    <div class="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span class="text-xs font-bold text-slate-600">승인율 영향</span>
                      <span class="text-sm font-black text-amber-700">${strat.approvalDiff}%p</span>
                    </div>
                  </div>

                  <div class="text-xs font-bold text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                    <div class="flex items-center gap-1.5 text-emerald-700">
                      <span>✓</span> <span>표본 비중 1% 충족 (총 ${strat.targetCount.toLocaleString()}건)</span>
                    </div>
                    <div class="flex items-center gap-1.5 ${strat.validations.ootValid ? 'text-emerald-700' : 'text-amber-700'}">
                      <span>${strat.validations.ootValid ? '✓' : '⚠️'}</span>
                      <span>${strat.validations.ootValid ? 'OOT 백테스트 통과' : '백테스트 주의'}</span>
                    </div>
                  </div>
                </div>

                <button type="button" onclick="event.stopPropagation(); startCollaborationWithStrategy('${strat.id}')" class="w-full mt-5 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isSelected
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                }">
                  <span>이 안으로 부서간 협의 시작 (3단계 이동)</span>
                  <span>➔</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2-1. 분석 결과 SEG(심사등급)별 차주 분포 및 리스크 프로파일 그래프
// ----------------------------------------------------
function setCollabSegMetric(metric) {
  state.collabSegChartMetric = metric;
  renderApp();
}

function renderSegDistributionChart() {
  const activeMetric = state.collabSegChartMetric || 'combo';
  const rows = state.breakdownRows || [];
  const totalCount = rows.reduce((sum, r) => sum + r.count, 0) || 14820;

  const segMeta = [
    { shortName: '1~2등급', grade: '최우량', color: '#10B981', gradientFrom: '#34D399', gradientTo: '#059669', badgeBg: 'bg-emerald-100 text-emerald-900 border border-emerald-400', tag: '★ 예외보존' },
    { shortName: '3등급', grade: '우량', color: '#2563EB', gradientFrom: '#60A5FA', gradientTo: '#1D4ED8', badgeBg: 'bg-blue-100 text-blue-900 border border-blue-300', tag: '승인유지' },
    { shortName: '4등급', grade: '일반', color: '#3B82F6', gradientFrom: '#93C5FD', gradientTo: '#2563EB', badgeBg: 'bg-indigo-100 text-indigo-900 border border-indigo-300', tag: '승인유지' },
    { shortName: '5등급', grade: '중위험', color: '#F59E0B', gradientFrom: '#FCD34D', gradientTo: '#D97706', badgeBg: 'bg-amber-100 text-amber-900 border border-amber-300', tag: '부결통제' },
    { shortName: '6등급', grade: '고위험', color: '#EF4444', gradientFrom: '#F87171', gradientTo: '#DC2626', badgeBg: 'bg-rose-100 text-rose-900 border border-rose-300', tag: '부결통제' },
    { shortName: '7등급 이하', grade: '초고위험', color: '#B91C1C', gradientFrom: '#EF4444', gradientTo: '#991B1B', badgeBg: 'bg-red-200 text-red-950 border border-red-400', tag: '즉시부결' },
  ];

  // SVG parameters
  const chartW = 680;
  const chartH = 265;
  const baseY = 195;
  const leftX = 50;
  const usableW = 580;
  const slotW = usableW / 6;
  const maxRatio = 40.0;
  const maxDelinq = 9.0;

  // Calculate coordinates for dual-axis chart
  const points = rows.map((r, i) => {
    const cx = leftX + (i * slotW) + (slotW / 2);
    const barH = Math.max(8, (r.ratio / maxRatio) * 150);
    const barY = baseY - barH;
    const delinqY = baseY - (r.delinquencyRate / maxDelinq) * 150;
    return {
      cx,
      barY,
      barH,
      delinqY,
      row: r,
      meta: segMeta[i] || segMeta[0]
    };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.cx.toFixed(1)} ${p.delinqY.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].cx.toFixed(1)} ${baseY} L ${points[0].cx.toFixed(1)} ${baseY} Z`;

  return `
    <div class="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
      <!-- 헤더 및 지표 탭 바 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h5 class="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>📊</span>
              <span>분석 결과 SEG(심사등급)별 차주 분포 및 리스크 프로파일</span>
            </h5>
            <span class="text-[10px] bg-blue-100 text-[#0565F0] font-black px-2 py-0.5 rounded-full border border-blue-200">
              18.4만 건 빅데이터 전수 분석
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            세그먼트(SEG)별 모수 비중(건수), 연체율 추이 및 손익 기여도를 그래프로 비교 검토합니다.
          </p>
        </div>

        <!-- 4대 메트릭 탭 전환 버튼 -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto text-xs">
          <button
            type="button"
            onclick="setCollabSegMetric('combo');"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-all ${
              activeMetric === 'combo'
                ? 'bg-blue-600 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }"
            title="모수 비중 바 차트 + 연체율 꺾은선 복합 그래프"
          >
            📊 복합 뷰
          </button>
          <button
            type="button"
            onclick="setCollabSegMetric('ratio');"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-all ${
              activeMetric === 'ratio'
                ? 'bg-blue-600 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }"
            title="세그먼트별 모수 건수 및 구성 비중"
          >
            👥 모수 구성비
          </button>
          <button
            type="button"
            onclick="setCollabSegMetric('delinquency');"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-all ${
              activeMetric === 'delinquency'
                ? 'bg-blue-600 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }"
            title="세그먼트별 연체율 및 위험도"
          >
            📉 연체율 위험도
          </button>
          <button
            type="button"
            onclick="setCollabSegMetric('profit');"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-all ${
              activeMetric === 'profit'
                ? 'bg-blue-600 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }"
            title="세그먼트별 손익 기여도(억원)"
          >
            💰 손익 기여도
          </button>
        </div>
      </div>

      <!-- 메트릭별 컨텐츠 영역 -->
      ${activeMetric === 'combo' ? `
        <!-- 1. 복합 차트 (SVG Bar + Delinquency Curve) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs px-1">
            <div class="flex items-center gap-4 text-[11px] font-bold">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-sm bg-gradient-to-t from-blue-700 to-blue-400"></span>
                <span class="text-slate-700">모수 비중 (막대 높이, 좌측 축 %)</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-rose-600"></span>
                <span class="w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
                <span class="text-rose-700 font-black">연체율 추이 (꺾은선, 우측 축 %)</span>
              </span>
            </div>
            <span class="text-[11px] font-bold text-slate-500">
              분석 대상 모수: <strong class="text-slate-800">${totalCount.toLocaleString()}건</strong> (100.0%)
            </span>
          </div>

          <div class="w-full overflow-x-auto bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <svg viewBox="0 0 ${chartW} ${chartH}" class="w-full h-auto min-w-[560px] select-none font-sans">
              <defs>
                <linearGradient id="grad-bar-0" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#34D399" />
                  <stop offset="100%" stop-color="#059669" />
                </linearGradient>
                <linearGradient id="grad-bar-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#60A5FA" />
                  <stop offset="100%" stop-color="#1D4ED8" />
                </linearGradient>
                <linearGradient id="grad-bar-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#818CF8" />
                  <stop offset="100%" stop-color="#3730A3" />
                </linearGradient>
                <linearGradient id="grad-bar-3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#FBBF24" />
                  <stop offset="100%" stop-color="#D97706" />
                </linearGradient>
                <linearGradient id="grad-bar-4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#F87171" />
                  <stop offset="100%" stop-color="#DC2626" />
                </linearGradient>
                <linearGradient id="grad-bar-5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#EF4444" />
                  <stop offset="100%" stop-color="#7F1D1D" />
                </linearGradient>
                <linearGradient id="delinq-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#DC2626" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#DC2626" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- 배경 수평 눈금선 및 좌/우 Y축 라벨 -->
              ${[0, 10, 20, 30, 40].map(val => {
                const y = baseY - (val / maxRatio) * 150;
                const delinqVal = ((val / maxRatio) * maxDelinq).toFixed(1);
                return `
                  <line x1="${leftX}" y1="${y}" x2="${leftX + usableW}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="4,4" stroke-width="1" />
                  <text x="${leftX - 8}" y="${y + 3}" text-anchor="end" fill="#64748B" font-size="9" font-weight="bold">${val}%</text>
                  <text x="${leftX + usableW + 8}" y="${y + 3}" text-anchor="start" fill="#EF4444" font-size="9" font-weight="bold">${delinqVal}%</text>
                `;
              }).join('')}

              <!-- 기준선 (Base line) -->
              <line x1="${leftX}" y1="${baseY}" x2="${leftX + usableW}" y2="${baseY}" stroke="#94A3B8" stroke-width="1.5" />

              <!-- 막대 차트 (모수 비중 %) -->
              ${points.map((p, idx) => {
                const barWidth = 42;
                const barX = p.cx - barWidth / 2;
                return `
                  <g class="transition-all hover:opacity-90 cursor-pointer">
                    <!-- 막대 사각형 (상단 모서리 라운딩) -->
                    <rect
                      x="${barX}"
                      y="${p.barY.toFixed(1)}"
                      width="${barWidth}"
                      height="${p.barH.toFixed(1)}"
                      rx="4"
                      fill="url(#grad-bar-${idx})"
                    />
                    <!-- 상단 수치 라벨 (건수 / 비중) -->
                    <text
                      x="${p.cx.toFixed(1)}"
                      y="${(p.barY - 7).toFixed(1)}"
                      text-anchor="middle"
                      fill="#1E293B"
                      font-size="9.5"
                      font-weight="900"
                    >${p.row.count.toLocaleString()}건</text>
                    <text
                      x="${p.cx.toFixed(1)}"
                      y="${(p.barY - 18).toFixed(1)}"
                      text-anchor="middle"
                      fill="#64748B"
                      font-size="8.5"
                      font-weight="bold"
                    >(${p.row.ratio.toFixed(1)}%)</text>
                  </g>
                `;
              }).join('')}

              <!-- 연체율 영역 음영 (Translucent fill) -->
              <path d="${areaD}" fill="url(#delinq-area)" />

              <!-- 연체율 꺾은선 (Bold red line) -->
              <path
                d="${pathD}"
                fill="none"
                stroke="#DC2626"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- 연체율 데이터 포인트 원 및 배지 -->
              ${points.map(p => `
                <g>
                  <!-- 외곽 펄스 서클 -->
                  <circle cx="${p.cx.toFixed(1)}" cy="${p.delinqY.toFixed(1)}" r="5" fill="#FFFFFF" stroke="#DC2626" stroke-width="2.5" />
                  <circle cx="${p.cx.toFixed(1)}" cy="${p.delinqY.toFixed(1)}" r="2" fill="#DC2626" />
                  <!-- 연체율 수치 태그 -->
                  <rect
                    x="${(p.cx - 18).toFixed(1)}"
                    y="${(p.delinqY - 20).toFixed(1)}"
                    width="36"
                    height="14"
                    rx="3"
                    fill="#FEF2F2"
                    stroke="#F87171"
                    stroke-width="1"
                  />
                  <text
                    x="${p.cx.toFixed(1)}"
                    y="${(p.delinqY - 9).toFixed(1)}"
                    text-anchor="middle"
                    fill="#991B1B"
                    font-size="8.5"
                    font-weight="900"
                  >${p.row.delinquencyRate.toFixed(2)}%</text>
                </g>
              `).join('')}

              <!-- X축 라벨 (등급명, 고객특성, 심사판정) -->
              ${points.map(p => `
                <g>
                  <text x="${p.cx.toFixed(1)}" y="${baseY + 16}" text-anchor="middle" fill="#0F172A" font-size="10" font-weight="900">${p.meta.shortName}</text>
                  <text x="${p.cx.toFixed(1)}" y="${baseY + 28}" text-anchor="middle" fill="#64748B" font-size="8.5" font-weight="bold">(${p.meta.grade})</text>
                  <rect
                    x="${(p.cx - 24).toFixed(1)}"
                    y="${baseY + 34}"
                    width="48"
                    height="15"
                    rx="3"
                    fill="${p.row.actionVerdict === '제외 검토' ? '#D1FAE5' : p.row.actionVerdict === '유지' ? '#DBEAFE' : '#FEE2E2'}"
                    stroke="${p.row.actionVerdict === '제외 검토' ? '#10B981' : p.row.actionVerdict === '유지' ? '#60A5FA' : '#F87171'}"
                    stroke-width="1"
                  />
                  <text
                    x="${p.cx.toFixed(1)}"
                    y="${baseY + 45}"
                    text-anchor="middle"
                    fill="${p.row.actionVerdict === '제외 검토' ? '#065F46' : p.row.actionVerdict === '유지' ? '#1E40AF' : '#991B1B'}"
                    font-size="8.5"
                    font-weight="900"
                  >${p.meta.tag}</text>
                </g>
              `).join('')}
            </svg>
          </div>
        </div>
      ` : activeMetric === 'ratio' ? `
        <!-- 2. 모수 건수 및 구성비 상세 분포 뷰 -->
        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${rows.map((row, idx) => {
              const meta = segMeta[idx] || segMeta[0];
              return `
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full" style="background-color: ${meta.color};"></span>
                      <span class="font-black text-xs text-slate-900">${row.groupName}</span>
                    </div>
                    <span class="text-[10px] font-black px-2 py-0.5 rounded ${meta.badgeBg}">
                      ${meta.tag}
                    </span>
                  </div>

                  <div class="space-y-1">
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-slate-500 font-bold">차주 건수</span>
                      <span class="font-mono font-black text-slate-800">${row.count.toLocaleString()}건 <span class="text-slate-400 font-normal">(${row.ratio.toFixed(2)}%)</span></span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div class="h-2.5 rounded-full" style="width: ${(row.ratio / 35.0) * 100}%; background-color: ${meta.color};"></div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                    <span>연체율: <strong class="font-mono text-slate-900">${row.delinquencyRate.toFixed(2)}%</strong></span>
                    <span>손익: <strong class="font-mono ${row.profitContribution > 0 ? 'text-blue-700' : 'text-rose-600'}">${row.profitContribution > 0 ? `+${row.profitContribution.toFixed(2)}` : row.profitContribution.toFixed(2)}억</strong></span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : activeMetric === 'delinquency' ? `
        <!-- 3. 연체율 위험도 프로파일 뷰 -->
        <div class="space-y-3">
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-black text-slate-800">심사등급별 연체율 급등 임계치 비교</span>
              <span class="text-[11px] text-slate-500 font-bold">⚠️ 위험 기준선: 3.0% 이상</span>
            </div>

            <div class="space-y-3 pt-1">
              ${rows.map((row, idx) => {
                const meta = segMeta[idx] || segMeta[0];
                const isHighRisk = row.delinquencyRate >= 3.0;
                const isSafe = row.delinquencyRate < 1.0;
                return `
                  <div>
                    <div class="flex justify-between items-center text-xs mb-1">
                      <span class="flex items-center gap-1.5 font-bold text-slate-800">
                        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${meta.color};"></span>
                        <span>${meta.shortName} (${meta.grade})</span>
                      </span>
                      <span class="font-mono font-black text-xs ${
                        isHighRisk ? 'text-rose-600' : isSafe ? 'text-emerald-700' : 'text-blue-700'
                      }">
                        ${row.delinquencyRate.toFixed(2)}%
                        <span class="text-[10px] font-normal text-slate-500">
                          ${isSafe ? '(최상위 안전)' : isHighRisk ? '(부실 경보)' : '(정상 마진)'}
                        </span>
                      </span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden relative">
                      <!-- 3.0% 위험 임계선 표시 -->
                      <div class="absolute top-0 bottom-0 left-[37.5%] w-0.5 bg-red-400 z-10" title="위험 기준선 (3.0%)"></div>
                      <div
                        class="h-3 rounded-full transition-all ${
                          isHighRisk ? 'bg-gradient-to-r from-rose-500 to-rose-700' : isSafe ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'
                        }"
                        style="width: ${(row.delinquencyRate / 8.0) * 100}%;"
                      ></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      ` : `
        <!-- 4. 손익 기여도 분석 뷰 -->
        <div class="space-y-3">
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span class="font-black text-slate-800">세그먼트별 순익 기여도 (흑자 vs 적자 구간)</span>
              <span class="text-[11px] text-blue-700 font-bold">총 순익 기여 합계: +3.90억 원</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              ${rows.map((row, idx) => {
                const meta = segMeta[idx] || segMeta[0];
                const isProfit = row.profitContribution > 0;
                return `
                  <div class="bg-white border ${isProfit ? 'border-blue-200' : 'border-rose-200'} rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-black text-slate-800">${meta.shortName}</span>
                      <span class="text-[10px] font-black px-1.5 py-0.5 rounded ${meta.badgeBg}">${meta.tag}</span>
                    </div>
                    <div class="text-center py-2">
                      <span class="text-xl font-black font-mono ${isProfit ? 'text-blue-700' : 'text-rose-600'}">
                        ${isProfit ? `+${row.profitContribution.toFixed(2)}` : row.profitContribution.toFixed(2)}억 원
                      </span>
                      <span class="block text-[11px] text-slate-500 mt-0.5">${row.note}</span>
                    </div>
                    <div class="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                      <span>모수: ${row.count.toLocaleString()}건</span>
                      <span>연체율: ${row.delinquencyRate.toFixed(2)}%</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `}

      <!-- 하단 의사결정 요약 카드 (영업기획팀 vs 신용관리팀 상호 협의 핵심 근거) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div class="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3 space-y-1">
          <div class="flex items-center justify-between font-black text-emerald-950">
            <span class="flex items-center gap-1">
              <span>⭐</span>
              <span>1~2등급 예외인정 근거</span>
            </span>
            <span class="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-black">+1.45억 기여</span>
          </div>
          <p class="text-[11px] text-emerald-800 font-medium leading-relaxed">
            모수 비중 0.95%(142건)로 극소하나 연체율 0.12%의 최우량 차주입니다. 일괄 부결 시 우량 고객 이탈 방지 효과가 입증됩니다.
          </p>
        </div>

        <div class="bg-blue-50/90 border border-blue-300 rounded-xl p-3 space-y-1">
          <div class="flex items-center justify-between font-black text-blue-950">
            <span class="flex items-center gap-1">
              <span>🟢</span>
              <span>정상 승인 유지군 (3~4등급)</span>
            </span>
            <span class="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-black">비중 43.9%</span>
          </div>
          <p class="text-[11px] text-blue-800 font-medium leading-relaxed">
            총 6,500건으로 주력 영업 자산 기반입니다. 연체율 0.88%~1.64%로 건전성과 대출 취급 규모의 균형을 유지합니다.
          </p>
        </div>

        <div class="bg-rose-50/90 border border-rose-300 rounded-xl p-3 space-y-1">
          <div class="flex items-center justify-between font-black text-rose-950">
            <span class="flex items-center gap-1">
              <span>🛑</span>
              <span>리스크 차단군 (5~7등급)</span>
            </span>
            <span class="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-black">부실 8,178건 차단</span>
          </div>
          <p class="text-[11px] text-rose-800 font-medium leading-relaxed">
            연체율 급등(최대 7.80%) 및 손익 적자(-1.45억) 구간으로 신규 심사 통제를 통해 회사 자산 건전성을 선제 방어합니다.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 2. 다자간 부서 협의 워크스페이스 (영업기획팀 · 신용관리팀 · 팀장 · 본부장 소통의 장)
// ========================================================
function renderCollaborationScreen(strategy) {
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;
  const currentTask = state.tasks.find(t => t.id === state.selectedTaskId) || state.tasks[0];
  const isTaskAgreed = state.isAgreed || currentTask.status === 'agreed';
  const dp = state.departmentProposals;
  const finalizedDept = state.selectedFinalSlot === 'credit' ? dp.credit : dp.sales;

  // 부서별 수정 권한 & 최종안 책정 권한 체크
  const isSalesDept = state.currentRoleId === 'SALES_STAFF';
  const isCreditDept = state.currentRoleId === 'CREDIT_STAFF' || state.currentRoleId === 'CREDIT_LEADER' || state.currentRoleId === 'RISK_HEAD';
  const canEditSales = isSalesDept;
  const canEditCredit = isCreditDept;
  const canFinalize = state.currentRoleId === 'CREDIT_STAFF'; // 신용관리팀 담당자(이신용 대리)만 최종안 책정 가능!

  // 안건 접수 대기 상태 여부 (1단계 상정 후 상대방 부서 접수 전)
  const isPendingReceipt = currentTask.stepNum === 1 || currentTask.status === 'submitted' || currentTask.status === 'pending_receipt';
  
  // 현재 접속자가 안건을 접수해야 하는 수신(배정) 부서인지 여부
  const isAssignee = (currentTask.assigneeDept && currentTask.assigneeDept.includes('신용') && (state.currentRoleId === 'CREDIT_STAFF' || state.currentRoleId === 'CREDIT_LEADER')) ||
                     (currentTask.assigneeDept && currentTask.assigneeDept.includes('영업') && state.currentRoleId === 'SALES_STAFF');
  const isRequester = (currentTask.requesterDept && currentTask.requesterDept.includes('영업') && state.currentRoleId === 'SALES_STAFF') ||
                      (currentTask.requesterDept && currentTask.requesterDept.includes('신용') && (state.currentRoleId === 'CREDIT_STAFF' || state.currentRoleId === 'CREDIT_LEADER'));

  return `
    <div class="space-y-6 w-full">
      ${renderActiveTaskBanner(
        isPendingReceipt
          ? `1단계: 협의 안건 상정 완료 (상대방 부서 [${currentTask.assigneeDept || '수신부서'}] 접수 대기 중)`
          : '2단계: 다자간 부서 협의 (영업기획팀 vs 신용관리팀 안건 조율)'
      )}

      <!-- [신규] 상대방 부서 접수 처리 대기/실행 배너 (접수 후 부서간 협의 시작 구조) -->
      ${isPendingReceipt ? `
        <div class="bg-gradient-to-r ${isAssignee ? 'from-blue-900 via-indigo-900 to-slate-900 border-blue-400' : 'from-slate-800 via-slate-900 to-slate-950 border-amber-400'} border-2 rounded-2xl p-6 text-white shadow-xl space-y-4 animate-fadeIn">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl ${isAssignee ? 'animate-bounce' : ''}">${isAssignee ? '📥' : '⏳'}</span>
              <div>
                <span class="text-[11px] font-black ${isAssignee ? 'bg-amber-400 text-slate-950' : 'bg-blue-400 text-slate-950'} px-3 py-1 rounded-full uppercase tracking-wider">
                  ${isAssignee ? 'Action 필요: 안건 공식 접수 대기' : '상대방 부서 접수 처리 대기 중'}
                </span>
                <h3 class="text-xl font-black mt-1">
                  ${isAssignee
                    ? `[${currentTask.requesterDept} ${currentTask.requesterName}]에서 상정한 협의 안건이 도착했습니다!`
                    : `[${currentTask.assigneeDept} ${currentTask.assigneeName}]의 안건 접수 처리를 대기하고 있습니다.`
                  }
                </h3>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs font-mono text-slate-300 block">안건 번호: ${currentTask.id}</span>
              <span class="text-xs text-amber-300 font-bold">${currentTask.product || 'PL 신용대출 36개월물'}</span>
            </div>
          </div>

          <!-- 안건 요약 박스 -->
          <div class="bg-white/10 backdrop-blur-xs rounded-xl p-4 text-xs sm:text-sm leading-relaxed border border-white/15 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-black text-white text-base">📌 건명: ${currentTask.title}</p>
              <span class="text-xs font-mono text-blue-200">기안 일시: ${currentTask.requestDate || '2026-10-11 10:00'}</span>
            </div>
            <p class="text-slate-200 text-xs leading-normal">
              ${isAssignee
                ? `상대방 부서(${currentTask.requesterDept})에서 본 부서(${currentTask.assigneeDept})로 심사전략 협의를 공식 상정하였습니다. 아래 <strong>[📥 협의 안건 공식 접수 처리]</strong> 버튼을 누르면 AI 선행 분석 모듈이 가동되어 <strong>5대 최적 전략</strong>을 도출하고 본격적인 부서간 토의/시뮬레이션이 시작됩니다.`
                : `현재 기안 부서(${currentTask.requesterDept})에서 안건을 상정한 상태입니다. 수신 부서(${currentTask.assigneeDept}) 담당자가 안건을 확인하고 접수 처리를 완료하면 양 부서간 실시간 핑퐁 및 AI What-If 시뮬레이션이 활성화됩니다.`
              }
            </p>
          </div>

          <!-- 액션 컨트롤러 -->
          <div class="flex flex-col sm:flex-row items-center gap-3 pt-1">
            ${isAssignee ? `
              <button
                type="button"
                onclick="acceptTaskRequest('${currentTask.id}');"
                class="w-full sm:flex-1 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-base rounded-xl shadow-2xl border-2 border-amber-300 flex items-center justify-center gap-2.5 transition-all transform active:scale-98"
              >
                <span class="text-xl">📥</span>
                <span>협의 안건 공식 접수 처리 및 부서 협의 시작 (AI 5대안 탑재)</span>
                <span class="text-xs bg-slate-950/20 px-2.5 py-1 rounded-lg font-bold">➔ 협의 개시</span>
              </button>
            ` : `
              <div class="w-full sm:flex-1 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <span class="text-xs text-slate-300 flex items-center gap-1.5">
                  <span class="animate-spin text-base">⏳</span>
                  <span>상대방 부서(${currentTask.assigneeDept})에서 안건을 검토 중입니다.</span>
                </span>
                <button
                  type="button"
                  onclick="switchRole('${currentTask.assigneeDept && currentTask.assigneeDept.includes('신용') ? 'CREDIT_STAFF' : 'SALES_STAFF'}');"
                  class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-lg shadow-md border border-blue-400 flex items-center gap-2 transition-all"
                >
                  <span>🔄 상대방 부서(${currentTask.assigneeDept}) 계정으로 전환하여 접수하기</span>
                </button>
              </div>
            `}
          </div>
        </div>
      ` : ''}

      <!-- 팀장/본부장 검토 및 의견 제시 전용 안내 바 -->
      ${state.currentRoleId === 'CREDIT_LEADER' ? `
        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-2xl">👔</span>
            <div>
              <span class="text-[11px] font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full">신용관리팀장 검토 모드</span>
              <p class="text-xs font-bold text-blue-950 mt-1">현재 신용관리팀(이신용 대리)이 영업기획팀과 협의 중인 안건입니다. 하단 토의방에 팀장 검토 의견 및 조율 지시를 남겨주세요.</p>
            </div>
          </div>
          <span class="text-xs font-black text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shrink-0">💬 의견 제시 권한 활성화됨</span>
        </div>
      ` : state.currentRoleId === 'RISK_HEAD' ? `
        <div class="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-2xl">👑</span>
            <div>
              <span class="text-[11px] font-black bg-purple-700 text-white px-2.5 py-0.5 rounded-full">신용관리본부장 종합 검토 모드</span>
              <p class="text-xs font-bold text-purple-950 mt-1">영업기획팀과 신용관리팀의 합의 현황을 모니터링하고, 본부 차원의 종합 지시사항 및 승인 의견을 토의방에 남겨주세요.</p>
            </div>
          </div>
          <span class="text-xs font-black text-purple-700 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shrink-0">⭐ 본부 승인·지시 권한</span>
        </div>
      ` : ''}

      <!-- 1. 상단 협의 컨트롤 & AI 팝업 트리거 바 -->
      <div class="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${isPendingReceipt ? 'opacity-85' : ''}">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black bg-[#EEF5FF] text-[#0565F0] px-3 py-1 rounded-full border border-[#D0E2FF]">부서간 협의 워크스페이스</span>
            <span class="text-xs font-bold text-slate-500">영업기획팀 ↔ 신용관리팀 핑퐁 & 최종안 책정</span>
          </div>
          <h3 class="text-xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            <span>영업기획팀 안 vs 신용관리팀 안 비교 및 조율</span>
            ${isTaskAgreed ? `
              <span class="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-black flex items-center gap-1 shadow-sm">
                <span>⭐</span> <span>【${finalizedDept.dept} 안】 최종안 책정 완료</span>
              </span>
            ` : `
              <span class="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">협의 진행중</span>
            `}
          </h3>
          <p class="text-xs text-slate-600 font-medium mt-1">
            두 부서가 AI What-If 분석과 실시간 토의를 통해 안건을 조율(핑퐁)하며, 각 부서는 자사 안건만 수정할 수 있고 협의 완료 시 신용관리팀 담당자가 최종안을 책정합니다.
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap shrink-0">
          <!-- AI 자연어 What-If Lab 팝업 열기 버튼 -->
          <button
            type="button"
            onclick="openAiWhatIfModal('${canEditSales ? 'sales' : 'credit'}');"
            class="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-[#0565F0] hover:from-purple-700 hover:to-[#0452C7] text-white rounded-xl text-sm font-black transition-all shadow-md flex items-center gap-2 active:scale-95 border-2 border-purple-400 group"
          >
            <span class="text-base group-hover:rotate-12 transition-transform">🤖</span>
            <span>AI 자연어 분석 & 안건 튜닝 (What-If Lab 팝업)</span>
            <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">열기</span>
          </button>

          <!-- 품의서 초안 작성 버튼 (합의 완료 시 신용관리팀에 활성화) -->
          ${isTaskAgreed && state.currentRoleId === 'CREDIT_STAFF' ? `
            <button type="button" onclick="switchTab('approval');" class="px-5 py-3.5 bg-[#0565F0] hover:bg-[#0452C7] text-white rounded-xl text-sm font-black transition-all shadow-md flex items-center gap-2 active:scale-95 border border-[#3A8BFD] animate-pulse">
              <span>📝 심사전략 품의서 초안 작성하기</span>
              <span>➔</span>
            </button>
          ` : isTaskAgreed ? `
            <span class="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span>✅</span> <span>최종안 책정 완료 (신용관리팀에서 품의서 초안 작성 중)</span>
            </span>
          ` : canFinalize ? `
            <button
              id="btn-agree-trigger"
              type="button"
              onclick="finalizeProposal(state.selectedFinalSlot || 'sales');"
              class="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-md active:scale-95 border-2 border-emerald-500"
            >
              <span>🤝 최종안 책정 (협의 완료)</span>
            </button>
          ` : `
            <span class="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-300 px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-sm" title="최종안 책정 권한은 신용관리팀 담당자에게 있습니다.">
              <span>🔒</span> <span>최종안 책정 권한: 신용관리팀 담당자</span>
            </span>
          `}
        </div>
      </div>

      <!-- 2. 핵심: 영업기획팀 안 vs 신용관리팀 안 (2-Column Side-by-Side 대조) -->
      <div>
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="flex items-center gap-2">
            <h4 class="text-base font-black text-slate-900">🏆 부서별 안건 비교 & 핑퐁 조율 (영업기획팀 안 ↔ 신용관리팀 안)</h4>
            <span class="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">2대 안건 대조</span>
          </div>
          <span class="text-xs text-slate-500 font-medium">※ 영업기획팀은 영업기획팀 안만, 신용관리팀은 신용관리팀 안만 수정할 수 있으며, 최종안 책정은 신용관리팀 담당자만 가능합니다.</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- 1) 영업기획팀 안 카드 -->
          ${(() => {
            const isFinalized = isTaskAgreed && state.selectedFinalSlot === 'sales';
            return `
              <div class="bg-white border-2 ${
                isFinalized
                  ? 'border-emerald-500 ring-4 ring-emerald-200/80 shadow-xl'
                  : 'border-amber-300 shadow-sm hover:shadow-md'
              } rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all relative">
                
                ${isFinalized ? `
                  <div class="absolute -top-3.5 right-6 bg-emerald-600 text-white font-black text-xs px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-emerald-400">
                    <span>⭐</span> <span>최종안 책정 완료 (확정)</span>
                  </div>
                ` : ''}

                <div class="space-y-4">
                  <div class="flex items-center justify-between pb-3 border-b border-amber-100">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-black shadow-sm">
                        🏢
                      </div>
                      <div>
                        <span class="text-sm font-black text-amber-900 block">${dp.sales.dept} 안</span>
                        <span class="text-xs text-slate-500 font-bold">${dp.sales.author}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">${dp.sales.badge}</span>
                      <span class="text-[11px] text-slate-400 block font-mono mt-1">${dp.sales.updatedAt} 갱신</span>
                    </div>
                  </div>

                  <div>
                    <h5 class="text-base font-black text-slate-900 leading-snug">${dp.sales.name}</h5>
                    <div class="mt-2.5 bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs sm:text-sm font-mono font-bold text-amber-950 leading-relaxed">
                      ${dp.sales.rule}
                    </div>
                  </div>

                  <!-- 4대 성과 지표 그리드 -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">연체율 개선</span>
                      <span class="text-sm sm:text-base font-black text-emerald-700">${dp.sales.metrics.delinquencyDiff}%p</span>
                    </div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">승인율 변동</span>
                      <span class="text-sm sm:text-base font-black text-amber-800">${dp.sales.metrics.approvalDiff}%p</span>
                    </div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">예상 당기순익</span>
                      <span class="text-sm sm:text-base font-black text-[#0565F0]">+${dp.sales.metrics.profitDiff.toFixed(1)}억원</span>
                    </div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">대상 고객수</span>
                      <span class="text-sm sm:text-base font-black text-slate-800 font-mono">${dp.sales.metrics.targetCount.toLocaleString()}건</span>
                    </div>
                  </div>

                  <!-- 부서 핵심 사유 -->
                  <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    <span class="font-bold text-slate-900 block mb-1">📌 제안 사유 및 요구사항:</span>
                    ${dp.sales.rationale}
                  </div>
                </div>

                <!-- 하단 액션 버튼 바 -->
                <div class="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                  ${canEditSales ? `
                    <button
                      type="button"
                      onclick="openAiWhatIfModal('sales');"
                      class="text-xs font-black text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-100 px-3.5 py-2.5 rounded-xl border border-amber-300 transition-colors flex items-center gap-1.5"
                    >
                      <span>🤖 AI로 이 안건 수정·재분석</span>
                      <span>➔</span>
                    </button>
                  ` : `
                    <span class="text-xs font-bold text-slate-400 bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-not-allowed" title="영업기획팀 담당자만 수정할 수 있습니다.">
                      <span>🔒</span> <span>영업기획팀 전용 수정</span>
                    </span>
                  `}

                  ${canFinalize ? `
                    <button
                      type="button"
                      onclick="finalizeProposal('sales');"
                      class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 ${
                        isFinalized
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                      }"
                    >
                      <span>${isFinalized ? '✅ 최종안 책정됨' : '⭐ 이 안을 최종안으로 책정'}</span>
                    </button>
                  ` : isFinalized ? `
                    <span class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                      <span>✅ 최종안으로 책정됨</span>
                    </span>
                  ` : `
                    <span class="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1">
                      <span>🔒</span> <span>책정 권한: 신용관리팀 담당자</span>
                    </span>
                  `}
                </div>
              </div>
            `;
          })()}

          <!-- 2) 신용관리팀 안 카드 -->
          ${(() => {
            const isFinalized = isTaskAgreed && state.selectedFinalSlot === 'credit';
            return `
              <div class="bg-white border-2 ${
                isFinalized
                  ? 'border-emerald-500 ring-4 ring-emerald-200/80 shadow-xl'
                  : 'border-blue-300 shadow-sm hover:shadow-md'
              } rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all relative">
                
                ${isFinalized ? `
                  <div class="absolute -top-3.5 right-6 bg-emerald-600 text-white font-black text-xs px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-emerald-400">
                    <span>⭐</span> <span>최종안 책정 완료 (확정)</span>
                  </div>
                ` : ''}

                <div class="space-y-4">
                  <div class="flex items-center justify-between pb-3 border-b border-blue-100">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shadow-sm">
                        🛡️
                      </div>
                      <div>
                        <span class="text-sm font-black text-blue-900 block">${dp.credit.dept} 안</span>
                        <span class="text-xs text-slate-500 font-bold">${dp.credit.author}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">${dp.credit.badge}</span>
                      <span class="text-[11px] text-slate-400 block font-mono mt-1">${dp.credit.updatedAt} 갱신</span>
                    </div>
                  </div>

                  <div>
                    <h5 class="text-base font-black text-slate-900 leading-snug">${dp.credit.name}</h5>
                    <div class="mt-2.5 bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs sm:text-sm font-mono font-bold text-blue-950 leading-relaxed">
                      ${dp.credit.rule}
                    </div>
                  </div>

                  <!-- 4대 성과 지표 그리드 -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">연체율 개선</span>
                      <span class="text-sm sm:text-base font-black text-emerald-700">${dp.credit.metrics.delinquencyDiff}%p</span>
                    </div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">승인율 변동</span>
                      <span class="text-sm sm:text-base font-black text-amber-800">${dp.credit.metrics.approvalDiff}%p</span>
                    </div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">예상 당기순익</span>
                      <span class="text-sm sm:text-base font-black text-[#0565F0]">+${dp.credit.metrics.profitDiff.toFixed(1)}억원</span>
                    </div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span class="text-[10px] text-slate-500 font-bold block">대상 고객수</span>
                      <span class="text-sm sm:text-base font-black text-slate-800 font-mono">${dp.credit.metrics.targetCount.toLocaleString()}건</span>
                    </div>
                  </div>

                  <!-- 부서 핵심 사유 -->
                  <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    <span class="font-bold text-slate-900 block mb-1">📌 제안 사유 및 리스크 방어:</span>
                    ${dp.credit.rationale}
                  </div>
                </div>

                <!-- 하단 액션 버튼 바 -->
                <div class="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                  ${canEditCredit ? `
                    <button
                      type="button"
                      onclick="openAiWhatIfModal('credit');"
                      class="text-xs font-black text-blue-800 hover:text-blue-900 bg-blue-100/80 hover:bg-blue-100 px-3.5 py-2.5 rounded-xl border border-blue-300 transition-colors flex items-center gap-1.5"
                    >
                      <span>🤖 AI로 이 안건 수정·재분석</span>
                      <span>➔</span>
                    </button>
                  ` : `
                    <span class="text-xs font-bold text-slate-400 bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-not-allowed" title="신용관리팀만 수정할 수 있습니다.">
                      <span>🔒</span> <span>신용관리팀 전용 수정</span>
                    </span>
                  `}

                  ${canFinalize ? `
                    <button
                      type="button"
                      onclick="finalizeProposal('credit');"
                      class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 ${
                        isFinalized
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                      }"
                    >
                      <span>${isFinalized ? '✅ 최종안 책정됨' : '⭐ 이 안을 최종안으로 책정'}</span>
                    </button>
                  ` : isFinalized ? `
                    <span class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                      <span>✅ 최종안으로 책정됨</span>
                    </span>
                  ` : `
                    <span class="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1">
                      <span>🔒</span> <span>책정 권한: 신용관리팀 담당자</span>
                    </span>
                  `}
                </div>
              </div>
            `;
          })()}

        </div>
      </div>

      <!-- 3. 하단 레이아웃: 좌측 심사등급별 세부 분해표 & 검증 / 우측 부서간 실시간 소통 토의방 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- 좌측 7열: 심사등급별 세부 분해표 (Breakdown Table) 및 모델 검증 -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-sm">
            <div class="p-5 border-b-2 border-slate-100 flex items-center justify-between">
              <div>
                <h4 class="text-base font-black text-slate-900">
                  심사등급별 세부 분해표 (Breakdown Table)
                </h4>
                <p class="text-xs text-slate-500 font-medium">차주 등급별 리스크 지표 및 1~2등급 우량고객 예외 타당성 검증</p>
              </div>
              <span class="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                총 모수: ${state.breakdownRows.reduce((a, b) => a + b.count, 0).toLocaleString()}건
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-100 text-slate-700 font-black border-b-2 border-slate-200 text-xs">
                  <tr>
                    <th class="px-4 py-3">심사등급 (Segment)</th>
                    <th class="px-4 py-3 text-right">해당 건수</th>
                    <th class="px-4 py-3 text-right">구성 비중</th>
                    <th class="px-4 py-3 text-right">연체율</th>
                    <th class="px-4 py-3 text-right">손익 기여</th>
                    <th class="px-4 py-3 text-center">심사 판정</th>
                    <th class="px-4 py-3 text-center">표본 검증</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 font-medium text-xs sm:text-sm">
                  ${state.breakdownRows.map(row => {
                    const isMuted = row.isInsufficientSample === true;
                    return `
                      <tr class="transition-colors ${
                        isMuted
                          ? 'bg-amber-50/70 text-slate-600 hover:bg-amber-50'
                          : 'text-slate-800 hover:bg-slate-50'
                      }">
                        <td class="px-4 py-3.5 font-bold flex items-center gap-1.5">
                          <span class="${isMuted ? 'text-amber-900 font-black' : 'text-slate-900'}">${row.groupName}</span>
                        </td>
                        <td class="px-4 py-3.5 text-right font-mono font-bold ${isMuted ? 'text-slate-500' : 'text-slate-900'}">
                          ${row.count.toLocaleString()}건
                        </td>
                        <td class="px-4 py-3.5 text-right font-mono ${isMuted ? 'text-slate-500' : 'text-slate-700'}">
                          ${row.ratio.toFixed(2)}%
                        </td>
                        <td class="px-4 py-3.5 text-right font-mono font-bold ${
                          isMuted ? 'text-slate-500' : row.delinquencyRate > 3 ? 'text-rose-600' : 'text-emerald-700'
                        }">
                          ${row.delinquencyRate.toFixed(2)}%
                        </td>
                        <td class="px-4 py-3.5 text-right font-mono font-black ${
                          isMuted ? 'text-slate-500' : row.profitContribution > 0 ? 'text-blue-700' : 'text-rose-600'
                        }">
                          ${row.profitContribution > 0 ? `+${row.profitContribution.toFixed(2)}` : row.profitContribution.toFixed(2)}억
                        </td>
                        <td class="px-4 py-3.5 text-center">
                          ${row.actionVerdict === '부결' ? '<span class="inline-block bg-rose-100 text-rose-800 font-black text-[11px] px-2 py-0.5 rounded border border-rose-300">부결</span>' : ''}
                          ${row.actionVerdict === '유지' ? '<span class="inline-block bg-slate-200 text-slate-800 font-bold text-[11px] px-2 py-0.5 rounded">유지</span>' : ''}
                          ${row.actionVerdict === '제외 검토' ? '<span class="inline-block bg-emerald-100 text-emerald-900 font-black text-[11px] px-2.5 py-0.5 rounded border border-emerald-500 shadow-sm">★ 예외승인(보존)</span>' : ''}
                        </td>
                        <td class="px-4 py-3.5 text-center">
                          ${isMuted ? `
                            <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                              <span>⚠️ 표본 부족 (0.95%) ➔ 예외 허용</span>
                            </span>
                          ` : `
                            <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <span>✓ 표본충족 (${row.ratio.toFixed(1)}%)</span>
                            </span>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 분석 결과 SEG별 차주 분포 및 리스크 프로파일 그래프 카드 -->
          ${renderSegDistributionChart()}
        </div>

        <!-- 우측 5열: 부서간 실시간 소통 및 토의방 (Discussion Room) -->
        <div class="lg:col-span-5 bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <span class="text-lg">💬</span>
              <div>
                <h4 class="text-base font-black text-slate-900">부서간 실시간 토의방</h4>
                <p class="text-[11px] text-slate-500 font-medium">영업기획 · 신용관리 · 팀장 · 본부장 소통의 장</p>
              </div>
            </div>
            <span class="text-xs font-black bg-blue-50 text-[#0565F0] border border-blue-200 px-2.5 py-1 rounded-full">
              총 ${state.discussions.length}건 의견
            </span>
          </div>

          <div class="bg-blue-50/70 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span class="font-black text-blue-900 block">다자간 실시간 협의 피드</span>
              <p class="text-[11px] text-blue-700 mt-0.5">각 부서의 의견과 AI 분석 반영 이력이 실시간으로 공유됩니다.</p>
            </div>
            <span class="text-[11px] font-black bg-white text-blue-800 border border-blue-300 px-2.5 py-1 rounded-full shrink-0 shadow-sm">
              접속: ${currentAccount.dept} ${currentAccount.name}
            </span>
          </div>

          <!-- 토의 피드 리스트 (스크롤) -->
          <div class="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            ${state.discussions.map(d => {
              const deptBg =
                d.department.includes('영업') ? 'bg-amber-600' :
                d.department.includes('신용') ? 'bg-blue-600' :
                d.department.includes('상품') ? 'bg-indigo-600' :
                d.department.includes('AI') ? 'bg-purple-600' : 'bg-emerald-600';
              const isAiShared = d.userName.includes('AI') || d.department.includes('AI');
              return `
                <div class="p-3.5 rounded-xl border-2 transition-all ${
                  isAiShared
                    ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-100'
                    : 'bg-slate-50 border-slate-200'
                }">
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-black px-2 py-0.5 rounded-full text-white ${deptBg}">${d.department}</span>
                      <span class="font-black text-xs text-slate-900">${d.userName}</span>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 font-mono">${d.timestamp}</span>
                  </div>
                  <p class="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">${d.message}</p>
                </div>
              `;
            }).join('')}
          </div>

          <!-- 빠른 협의 의견 입력 칩 -->
          <div class="pt-1 space-y-1.5">
            <span class="text-[11px] font-black text-slate-600 block">💡 빠른 협의 의견 제안:</span>
            <div class="flex flex-wrap gap-1.5 text-[11px]">
              ${state.currentRoleId === 'CREDIT_LEADER' ? `
                <button type="button" onclick="sendCollabComment('팀장 검토 의견: 1~2등급 우량차주 예외 적용 시 부실 전이 영향이 없음을 확인했으므로 절충안 승인을 권고합니다.');" class="bg-blue-50 hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 font-black transition-colors text-left shadow-2xs">
                  👔 "팀장 검토: 우량차주 예외 절충안 승인 권고"
                </button>
                <button type="button" onclick="sendCollabComment('팀장 지시: 연체율 -1.3%p 방어 목표가 훼손되지 않는 선에서 영업기획팀과 조속히 최종안을 매듭지으세요.');" class="bg-blue-50 hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 font-black transition-colors text-left shadow-2xs">
                  📋 "팀장 지시: 연체율 -1.3%p 방어 유지하며 조속 매듭"
                </button>
              ` : state.currentRoleId === 'RISK_HEAD' ? `
                <button type="button" onclick="sendCollabComment('본부장 지시: 건전성 선제 방어와 영업 취급 균형이 적절하므로, 합의된 내용으로 즉시 품의 상신 준비하세요.');" class="bg-purple-50 hover:bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-300 font-black transition-colors text-left shadow-2xs">
                  👑 "본부장 지시: 균형 양호, 즉시 품의 상신 준비"
                </button>
                <button type="button" onclick="sendCollabComment('본부장 검토: OOT 백테스트 데이터가 충실히 뒷받침되었으므로 본 부서 협의안을 최종 승인합니다.');" class="bg-purple-50 hover:bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-300 font-black transition-colors text-left shadow-2xs">
                  ⭐ "본부장 검토: OOT 검증 충실, 최종 승인"
                </button>
              ` : `
                <button type="button" onclick="sendCollabComment('1~2등급 우량고객 예외 시 영업 취급액 방어에 큰 도움이 되므로 절충안을 적극 지지합니다.');" class="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 font-bold transition-colors text-left">
                  "1~2등급 예외 인정 시 영업 취급액 방어에 큰 도움"
                </button>
                <button type="button" onclick="sendCollabComment('OOT 백테스트 검증 결과 건전성 악화 위험이 없음을 확인하여 신용관리팀도 수용 가능합니다.');" class="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 font-bold transition-colors text-left">
                  "OOT 백테스트 통과로 건전성 영향 없음 확인"
                </button>
                <button type="button" onclick="sendCollabComment('연체율 -1.3%p 개선과 순익 +4.8억 원 확보는 매우 균형 잡힌 최적안이므로 최종 합의에 동의합니다.');" class="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 font-bold transition-colors text-left">
                  "연체율 -1.3%p 및 순익 +4.8억 최종 합의에 동의합니다"
                </button>
              `}
            </div>
          </div>

          <!-- 의견 직접 입력 폼 -->
          <form onsubmit="event.preventDefault(); sendCollabComment();" class="flex gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              id="collab-comment-input"
              value="${state.collabCommentInput || ''}"
              oninput="state.collabCommentInput=this.value;"
              placeholder="${
                state.currentRoleId === 'CREDIT_LEADER'
                  ? '[신용관리팀 박심사 팀장] 검토 의견 및 조율 지시사항을 입력하여 등록...'
                  : state.currentRoleId === 'RISK_HEAD'
                    ? '[신용관리본부 최본부장] 본부 검토의견 및 최종 승인 지시를 입력하여 등록...'
                    : `[${currentAccount.name}] 의견을 입력하여 토의방에 등록...`
              }"
              class="flex-1 bg-slate-50 border-2 border-slate-300 focus:border-[#0565F0] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none"
            />
            <button type="submit" class="px-5 py-2.5 ${state.currentRoleId === 'RISK_HEAD' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-[#0565F0] hover:bg-[#0452C7]'} text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0">
              의견 등록
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 4. 심사전략 품의 초안 작성 (사내 전자결재 상신용)
// ========================================================
function renderApprovalScreen(strategy) {
  const currentAccount = ACCOUNTS[state.currentRoleId];

  return `
    <div class="space-y-6">
      ${renderActiveTaskBanner('심사전략 품의서 초안 작성 (사내 전자결재 상신용)')}

      <!-- 상단 액션 안내 및 버튼 바 -->
      <div class="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
            📋
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full">사내 전자결재 연계</span>
              <span class="text-xs font-bold text-blue-900">시스템 안내</span>
            </div>
            <p class="text-sm text-slate-900 font-black mt-0.5">
              본 문서는 사내 전자결재 시스템(그룹웨어) 상신용으로 생성된 <strong>심사전략 품의 초안</strong>입니다.
            </p>
            <p class="text-xs text-slate-600 font-medium">
              플랫폼 내 별도의 결재·승인 절차 없이, 본문을 복사하거나 인쇄하여 사내 전자결재 시스템에 기안하십시오.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap shrink-0">
          <!-- 1. 초안 내용 직접 수정 (유지) -->
          <button type="button" onclick="state.isEditModalOpen=true; renderApp();" class="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
            <span>✏️</span>
            <span>초안 내용 직접 수정</span>
          </button>
          <!-- 2. 초안 내용 AI 수정 (자연어 수정 신규 버튼) -->
          <button id="btn-ai-edit-draft" type="button" onclick="openAiEditModal();" class="px-5 py-3 bg-[#0565F0] hover:bg-[#0452C7] text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-md active:scale-95 border border-[#3A8BFD]">
            <span class="text-base">✨</span>
            <span>초안 내용 AI 수정</span>
          </button>
          <!-- 3. 인쇄 / PDF 출력 -->
          <button type="button" onclick="window.print();" class="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
            <span>🖨️</span>
            <span>인쇄 / PDF 출력</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- 좌측 근거 타임라인 & 점검표 (4 Cols) -->
        <div class="lg:col-span-4 space-y-4">
          <!-- 타임라인 -->
          <div class="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 class="text-base font-black text-slate-900 border-b-2 border-slate-100 pb-3 flex items-center gap-2">
              <span>📜</span>
              <span>품의 초안 근거 및 협의 타임라인</span>
            </h3>
            <div class="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              <div class="relative">
                <span class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600"></span>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="font-black text-blue-900 block mb-0.5">1. 영업기획팀 의뢰 접수 (10:10)</span>
                  <p class="text-slate-700">PL 36개월물 연체율 급등 대응 및 심사개편 의뢰 접수 즉시 AI 선행 시뮬레이션 완료</p>
                </div>
              </div>
              <div class="relative">
                <span class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600"></span>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="font-black text-blue-900 block mb-0.5">2. 신용관리팀 자연어 분석 확정 (10:14)</span>
                  <p class="text-slate-700">이신용 대리가 AI 자연어 튜닝 후 [안 2 · 균형안]을 부서 협의안으로 채택</p>
                </div>
              </div>
              <div class="relative">
                <span class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-600"></span>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="font-black text-amber-900 block mb-0.5">3. 영업기획팀 우량고객 예외 요청 (10:25)</span>
                  <p class="text-slate-700">1~2등급 우량차주 이탈 방지를 위한 DTI 30% 부결 예외 시뮬레이션 요구</p>
                </div>
              </div>
              <div class="relative">
                <span class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-600"></span>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="font-black text-emerald-900 block mb-0.5">4. AI 재시뮬레이션 검증 (10:26)</span>
                  <p class="text-slate-700">1~2등급 제외 시 승인율 0.9%p 회복, 이자수익 증대로 순익 +0.8억 원 추가 개선 입증</p>
                </div>
              </div>
              <div class="relative">
                <span class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-600"></span>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="font-black text-purple-900 block mb-0.5">5. 부서간 최종 합의 확정 (10:32)</span>
                  <p class="text-slate-700">영업기획팀 · 신용관리팀 전원 동의 후 사내 전자결재 상신용 초안 생성 완료</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 사내 전자결재 상신 체크리스트 -->
          <div class="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 class="text-base font-black text-slate-900 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
              <span>📌</span>
              <span>사내 전자결재 상신 점검표</span>
            </h3>
            <div class="space-y-2 text-xs font-bold text-slate-700">
              <div class="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span>✓</span> <span>젭대리 AI 18.4만 건 OOT 백테스트 통과</span>
              </div>
              <div class="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span>✓</span> <span>영업기획팀 1~2등급 우량차주 예외 요구 수용</span>
              </div>
              <div class="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span>✓</span> <span>예상 재무효과 (연체율 -1.3%p, 순익 +4.8억)</span>
              </div>
              <div class="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span>✓</span> <span>사내 전자결재 표준 양식 데이터 정합성 100%</span>
              </div>
            </div>
          </div>

          <!-- 상신 절차 안내 -->
          <div class="bg-[#0B1B33] text-white rounded-2xl p-5 shadow-sm space-y-2.5 text-xs border border-[#1E3456]">
            <span class="text-blue-300 font-black block">💡 사내 전자결재 상신 방법:</span>
            <ol class="space-y-1.5 text-slate-300 font-medium list-decimal list-inside leading-relaxed">
              <li>우측 품의 초안 내용 최종 확인</li>
              <li>상단 <strong class="text-white">[초안 내용 AI 수정]</strong> 또는 <strong class="text-white">[직접 수정]</strong>으로 문안 보완</li>
              <li>상단 <strong class="text-white">[인쇄 / PDF 출력]</strong> 또는 전자결재 본문 인용</li>
              <li>사내 결재선 지정 후 상신 완료</li>
            </ol>
          </div>
        </div>

        <!-- 우측 전자결재 공문서 초안 미리보기 (8 Cols) -->
        <div class="lg:col-span-8 bg-white border-2 border-slate-400 rounded-2xl p-8 shadow-xl relative overflow-hidden font-sans text-slate-900">
          <!-- 공문서 헤더 -->
          <div class="border-b-2 border-slate-800 pb-5 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-mono text-slate-500 font-bold block">
                    문서번호: ${state.docNumber} | 보존기간: 5년
                  </span>
                  <span class="bg-blue-100 text-blue-800 text-[11px] font-black px-2 py-0.5 rounded border border-blue-300">
                    사내 전자결재 상신용 초안
                  </span>
                </div>
                <h1 class="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  심 사 전 략 변 경 품 의 초 안
                </h1>
              </div>

              <!-- 사내 결재 예정선 가이드 -->
              <div class="border-2 border-slate-300 rounded-lg overflow-hidden text-center bg-slate-50 text-xs">
                <div class="bg-slate-200 font-black text-slate-700 py-1 px-3">
                  사내 전자결재 상신 예정선
                </div>
                <div class="grid grid-cols-4 divide-x divide-slate-300 py-1.5 px-2 font-bold text-slate-700 text-[11px]">
                  <div class="px-1.5">기안<br /><span class="text-blue-900 font-black">이신용 대리</span></div>
                  <div class="px-1.5">검토<br /><span class="text-slate-800">박심사 팀장</span></div>
                  <div class="px-1.5">협조<br /><span class="text-slate-800">최기획 대리</span></div>
                  <div class="px-1.5">전결<br /><span class="text-purple-900 font-black">최본부장</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 문서 정보 -->
          <div class="border-2 border-slate-300 rounded-xl overflow-hidden text-xs mb-6 font-bold">
            <div class="grid grid-cols-4 bg-slate-50 border-b border-slate-300 p-2.5">
              <div class="text-slate-500">기안 부서</div>
              <div class="text-slate-900">신용관리팀 (담당: 이신용 대리)</div>
              <div class="text-slate-500">기안 일자</div>
              <div class="text-slate-900 font-mono">2026년 10월 11일</div>
            </div>
            <div class="grid grid-cols-4 p-2.5 bg-white">
              <div class="text-slate-500">품의 건명</div>
              <div class="col-span-3 text-slate-900 font-black text-sm">${state.draft.title}</div>
            </div>
          </div>

          <!-- 본문 5개 항목 -->
          <div class="space-y-5 text-sm">
            <div>
              <h4 class="font-black text-base text-blue-900 mb-1.5 flex items-center gap-1.5">
                <span>1. 변경 사유 (배경 및 목적)</span>
              </h4>
              <p class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                ${state.draft.reason}
              </p>
            </div>

            <div>
              <h4 class="font-black text-base text-blue-900 mb-1.5 flex items-center gap-1.5">
                <span>2. 변경 내용 (심사 규칙 고도화안)</span>
              </h4>
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div class="grid grid-cols-3 gap-2">
                  <span class="text-slate-500 font-bold">대상 상품:</span>
                  <span class="col-span-2 font-black text-slate-900">PL 신용대출 36개월물</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <span class="text-slate-500 font-bold">기존 기준:</span>
                  <span class="col-span-2 text-slate-600 font-mono">DTI 40% 초과 부결 (단기조회 규칙 미적용)</span>
                </div>
                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                  <span class="text-emerald-700 font-black">변경 후 기준:</span>
                  <span class="col-span-2 font-mono font-black text-emerald-900 text-sm">${state.draft.finalRule}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-black text-base text-blue-900 mb-1.5 flex items-center gap-1.5">
                <span>3. 예상 효과 (재무 및 건전성 영향)</span>
              </h4>
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="text-xs text-slate-500 font-bold block">연체율 개선</span>
                  <span class="text-lg font-black text-emerald-700">${state.draft.expectedImpact.delinquencyDiff}%p</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="text-xs text-slate-500 font-bold block">연간 당기순손익</span>
                  <span class="text-lg font-black text-blue-700">+${state.draft.expectedImpact.profitDiff}억원</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span class="text-xs text-slate-500 font-bold block">승인율 영향</span>
                  <span class="text-lg font-black text-amber-700">${state.draft.expectedImpact.approvalDiff}%p</span>
                </div>
              </div>
            </div>

            <!-- 4. 현황 (그래프 형태의 시각화 대시보드 & 메뉴 토글) -->
            <div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 class="font-black text-base text-blue-900 flex items-center gap-1.5">
                  <span>4. 현황 (차주 포트폴리오 및 리스크·성과 지표)</span>
                </h4>
                <!-- 현황 그래프 전환 메뉴 -->
                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0 select-none">
                  <button
                    type="button"
                    onclick="state.approvalGraphTab='all'; renderApp();"
                    class="px-2.5 py-1 rounded-lg font-bold transition-all ${
                      (state.approvalGraphTab || 'all') === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }"
                  >전체 현황</button>
                  <button
                    type="button"
                    onclick="state.approvalGraphTab='grades'; renderApp();"
                    class="px-2.5 py-1 rounded-lg font-bold transition-all ${
                      state.approvalGraphTab === 'grades'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }"
                  >📊 등급별 분포</button>
                  <button
                    type="button"
                    onclick="state.approvalGraphTab='impact'; renderApp();"
                    class="px-2.5 py-1 rounded-lg font-bold transition-all ${
                      state.approvalGraphTab === 'impact'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }"
                  >📈 전·후 성과비교</button>
                </div>
              </div>

              <div class="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                
                ${(state.approvalGraphTab || 'all') === 'all' || state.approvalGraphTab === 'grades' ? `
                  <!-- 그래프 1: 신용등급(1~7등급)별 차주 분포 및 연체율 현황 바 차트 -->
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>📊</span> <span>신용등급별 대상 차주 수 및 연체율 분포 현황</span>
                      </span>
                      <span class="text-[11px] text-slate-500 font-bold">총 표본 모수: 14,678건</span>
                    </div>

                    <div class="space-y-2.5 pt-1">
                      <!-- 1~2등급 -->
                      <div>
                        <div class="flex justify-between items-center text-[11px] font-bold mb-1">
                          <span class="flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span class="text-emerald-950 font-black">1~2등급 (우량 차주)</span>
                            <span class="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.2 rounded-full border border-emerald-300 font-black">⭐ 예외 인정 구간 (정상 승인)</span>
                          </span>
                          <span class="font-mono text-slate-700">142건 (1.0%) · 연체율 <strong class="text-emerald-700">0.12%</strong></span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                          <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full" style="width: 14%;"></div>
                        </div>
                      </div>

                      <!-- 3~4등급 -->
                      <div>
                        <div class="flex justify-between items-center text-[11px] font-bold mb-1">
                          <span class="flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                            <span class="text-blue-950 font-black">3~4등급 (중상위 정상)</span>
                            <span class="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.2 rounded-full border border-blue-200">안정 취급 구간</span>
                          </span>
                          <span class="font-mono text-slate-700">4,820건 (32.8%) · 연체율 <strong class="text-blue-700">1.15%</strong></span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                          <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style="width: 58%;"></div>
                        </div>
                      </div>

                      <!-- 5~6등급 -->
                      <div>
                        <div class="flex justify-between items-center text-[11px] font-bold mb-1">
                          <span class="flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span class="text-amber-950 font-black">5~6등급 (중하위 주의)</span>
                            <span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.2 rounded-full border border-amber-200">선별 승인 구간</span>
                          </span>
                          <span class="font-mono text-slate-700">6,210건 (42.3%) · 연체율 <strong class="text-amber-800">2.45%</strong></span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                          <div class="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full" style="width: 78%;"></div>
                        </div>
                      </div>

                      <!-- 7등급 이하 -->
                      <div>
                        <div class="flex justify-between items-center text-[11px] font-bold mb-1">
                          <span class="flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            <span class="text-rose-950 font-black">7등급 이하 (고위험 차주)</span>
                            <span class="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.2 rounded-full border border-rose-300 font-black">DTI 30% 초과 부결 통제</span>
                          </span>
                          <span class="font-mono text-slate-700">3,506건 (23.9%) · 연체율 <strong class="text-rose-600 font-black">5.84%</strong></span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                          <div class="bg-gradient-to-r from-rose-400 to-rose-600 h-3 rounded-full" style="width: 95%;"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ` : ''}

                ${(state.approvalGraphTab || 'all') === 'all' || state.approvalGraphTab === 'impact' ? `
                  <!-- 그래프 2: 심사전략 개편 전 vs 개편 후 핵심 지표 비교 그래프 -->
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>📈</span> <span>심사전략 개편 전(Before) vs 개편 후(After) 성과 비교</span>
                      </span>
                      <div class="flex items-center gap-3 text-[11px] font-bold">
                        <span class="flex items-center gap-1 text-slate-400"><span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span> 기존 기준</span>
                        <span class="flex items-center gap-1 text-blue-900"><span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span> 변경 기준</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <!-- 1. 포트폴리오 연체율 -->
                      <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div class="flex justify-between items-center">
                          <span class="font-bold text-slate-700">포트폴리오 연체율</span>
                          <span class="text-xs font-black text-emerald-700">-1.30%p (37.7% 개선 📉)</span>
                        </div>
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-slate-400 font-bold">기존</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-slate-400 h-2.5 rounded-full" style="width: 85%;"></div>
                            </div>
                            <span class="w-12 text-right font-mono text-slate-500 font-bold">3.45%</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-emerald-800 font-black">변경</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-emerald-600 h-2.5 rounded-full" style="width: 53%;"></div>
                            </div>
                            <span class="w-12 text-right font-mono text-emerald-800 font-black">2.15%</span>
                          </div>
                        </div>
                      </div>

                      <!-- 2. 전체 승인율 -->
                      <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div class="flex justify-between items-center">
                          <span class="font-bold text-slate-700">전체 승인율 영향</span>
                          <span class="text-xs font-black text-amber-800">-2.20%p (우량예외로 +0.9%p 회복 🛡️)</span>
                        </div>
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-slate-400 font-bold">기존</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-slate-400 h-2.5 rounded-full" style="width: 78%;"></div>
                            </div>
                            <span class="w-12 text-right font-mono text-slate-500 font-bold">78.4%</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-blue-900 font-black">변경</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-blue-600 h-2.5 rounded-full" style="width: 76%;"></div>
                            </div>
                            <span class="w-12 text-right font-mono text-blue-950 font-black">76.2%</span>
                          </div>
                        </div>
                      </div>

                      <!-- 3. 연간 당기순손익 -->
                      <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div class="flex justify-between items-center">
                          <span class="font-bold text-slate-700">연간 당기순이익 기여</span>
                          <span class="text-xs font-black text-[#0565F0]">+4.8억원 순증 (+3.37% 📈)</span>
                        </div>
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-slate-400 font-bold">기존</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-slate-400 h-2.5 rounded-full" style="width: 80%;"></div>
                            </div>
                            <span class="w-14 text-right font-mono text-slate-500 font-bold">142.5억</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-[#0565F0] font-black">변경</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-[#0565F0] h-2.5 rounded-full" style="width: 95%;"></div>
                            </div>
                            <span class="w-14 text-right font-mono text-[#0565F0] font-black">147.3억</span>
                          </div>
                        </div>
                      </div>

                      <!-- 4. 고위험 다중채무 차단율 -->
                      <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div class="flex justify-between items-center">
                          <span class="font-bold text-slate-700">고위험 다중채무 선제차단</span>
                          <span class="text-xs font-black text-purple-700">+66.4%p 선제 차단 극대화 🎯</span>
                        </div>
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-slate-400 font-bold">기존</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-slate-400 h-2.5 rounded-full" style="width: 25%;"></div>
                            </div>
                            <span class="w-12 text-right font-mono text-slate-500 font-bold">18.2%</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="w-10 text-[10px] text-purple-900 font-black">변경</span>
                            <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div class="bg-purple-600 h-2.5 rounded-full" style="width: 90%;"></div>
                            </div>
                            <span class="w-12 text-right font-mono text-purple-900 font-black">84.6%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ` : ''}

                <!-- 현황 분석 소견 배너 -->
                <div class="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-slate-800 leading-relaxed font-medium flex items-start gap-2">
                  <span class="text-base text-blue-600 shrink-0 mt-0.5">💡</span>
                  <div>
                    <span class="font-black text-blue-950 block">현황 분석 및 시사점:</span>
                    1~2등급 우량 차주 142명을 예외 처리함에 따라 연체율 악화는 0.02%p 미만에 그치며, 승인율 하락폭을 0.9%p 회복시키고 연간 이자수익 4.8억 원을 추가 보전하여 건전성 통제와 영업 취급의 최적 균형을 입증함.
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. 시행 일자 (및 전산 반영 계획) -->
            <div>
              <h4 class="font-black text-base text-blue-900 mb-1.5 flex items-center gap-1.5">
                <span>5. 시행 일자 (및 전산 반영 계획)</span>
              </h4>
              <div class="bg-slate-50 p-4.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 pb-2.5 border-b border-slate-200 items-center">
                  <span class="text-slate-500 font-bold flex items-center gap-1.5">
                    <span>📅</span> <span>시행 일시</span>
                  </span>
                  <div class="sm:col-span-3 flex items-center gap-2">
                    <span class="font-black text-blue-900 text-sm sm:text-base font-mono">
                      ${state.draft.effectiveDate || '2026년 11월 1일(일) 00:00 부'}
                    </span>
                    <span class="text-[10px] font-black bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                      전산 자동 배포
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 pb-2.5 border-b border-slate-200">
                  <span class="text-slate-500 font-bold flex items-center gap-1.5">
                    <span>🎯</span> <span>적용 대상</span>
                  </span>
                  <span class="sm:col-span-3 text-slate-800 font-bold">
                    시행일시 이후 접수되는 <strong>PL 신용대출(36개월물) 신규 대출 신청 건</strong>부터 전면 적용
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 pb-2.5 border-b border-slate-200">
                  <span class="text-slate-500 font-bold flex items-center gap-1.5">
                    <span>⚙️</span> <span>전산 조치</span>
                  </span>
                  <span class="sm:col-span-3 text-slate-800">
                    차세대 여신심사 시스템(BRE 엔진) 신규 룰 파라미터 적용 및 운영 서버 배포 (IT지원팀 협조 완료)
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span class="text-slate-500 font-bold flex items-center gap-1.5">
                    <span>🛡️</span> <span>경과 조치 및 사후관리</span>
                  </span>
                  <span class="sm:col-span-3 text-slate-700 leading-relaxed">
                    • 시행일 이전 기 접수·심사 중인 건은 종전 심사기준을 적용함.<br />
                    • 시행 후 30일간 일별 승인율 변동 및 신규 취급액, 3개월 코호트 연체전이율 집중 모니터링 실시 (신용관리팀 주관).
                  </span>
                </div>
              </div>

              <!-- 공문서 공식 결미 -->
              <div class="flex items-center justify-between mt-3 text-xs text-slate-500 font-bold px-1">
                <span>※ 본 품의서 내용은 결재 완료 즉시 IT지원팀 및 영업점에 공람 공지됩니다.</span>
                <span class="text-slate-900 font-black text-sm tracking-widest">[시행 일자: 2026. 11. 01] - 끝.</span>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-4 border-t-2 border-slate-300 text-xs text-slate-500 text-center font-bold">
            본 문서는 JB금융그룹 젭대리 AI 거버넌스 플랫폼에 의해 자동 산출 및 협의 확정된 [사내 전자결재 상신용 품의 초안]입니다.
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 5. 변수 사전 (신용평가 피처 카탈로그)
// ========================================================
function renderDictionaryScreen() {
  const filtered = state.variables.filter(v => {
    const matchCat = state.varCategory === '전체' || v.category === state.varCategory;
    const q = state.varSearch.toLowerCase();
    const matchQ = v.id.toLowerCase().includes(q) || v.nameKo.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.easyExplain.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return `
    <div class="space-y-6">
      <div class="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-black text-slate-900">신용평가 및 심사 규칙 변수 사전</h2>
          <p class="text-xs text-slate-500 mt-0.5">단조성(Monotonicity), IV, PSI 검증 완료 변수 카탈로그</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <input type="text" id="var-search-input" placeholder="변수명 검색 (예: DTI, 조회...)" value="${state.varSearch}" oninput="state.varSearch=this.value; renderApp();" class="bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 w-64" />
          <div class="flex gap-1.5 flex-wrap">
            ${['전체', '부채비율', '신용조회', '소득/재직', '다중채무', '금융이력'].map(cat => `
              <button type="button" onclick="state.varCategory='${cat}'; renderApp();" class="px-3 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                state.varCategory === cat
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }">
                ${cat}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-700 font-black border-b-2 border-slate-200">
              <tr>
                <th class="px-5 py-4">변수명 & 코드</th>
                <th class="px-5 py-4">분류</th>
                <th class="px-5 py-4">산출 로직 / 정의</th>
                <th class="px-5 py-4 text-center">단조성 검증</th>
                <th class="px-5 py-4 text-center">표본 신뢰도</th>
                <th class="px-5 py-4 text-center">상세 구간 분석</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 font-medium">
              ${filtered.map(v => `
                <tr class="hover:bg-slate-50 transition-colors text-slate-800">
                  <td class="px-5 py-4">
                    <span class="font-black text-slate-900 text-base block">${v.nameKo}</span>
                    <span class="font-mono text-xs text-blue-700 font-bold">${v.id}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="bg-slate-100 border border-slate-300 text-slate-700 text-xs px-2.5 py-1 rounded-md font-bold">
                      ${v.category}
                    </span>
                  </td>
                  <td class="px-5 py-4 max-w-sm">
                    <p class="text-sm font-bold text-slate-800">${v.easyExplain}</p>
                    <span class="text-xs text-slate-500 font-mono block mt-1">${v.calcLogic}</span>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span class="inline-block bg-emerald-100 text-emerald-900 font-black text-xs px-3 py-1 rounded-full border border-emerald-300">
                      ✓ ${v.monotonicityStatus}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-center font-bold text-slate-700">
                    ${v.sampleAdequacy}
                  </td>
                  <td class="px-5 py-4 text-center">
                    <button type="button" onclick="state.selectedVariableModal=state.variables.find(item=>item.id==='${v.id}'); renderApp();" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow transition-colors">
                      구간별 분포 보기
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 모바일 단말 접속 안내 모달 (QR 코드 및 URL 복사)
// ========================================================
function renderMobileAccessModal() {
  const mobileUrl = 'http://125.141.49.113:3000';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileUrl)}`;
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-slate-900">
      <div class="bg-white border-2 border-slate-400 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="bg-gradient-to-r from-[#0B192C] to-slate-800 text-white px-6 py-4 border-b-2 border-slate-700 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-xl">📱</span>
            <h3 class="font-black text-white text-base">스마트폰 모바일 접속 안내</h3>
          </div>
          <button type="button" onclick="closeMobileAccessModal();" class="text-slate-400 hover:text-white text-xl font-bold">✕</button>
        </div>

        <div class="p-6 space-y-4 text-center">
          <div class="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 text-emerald-900 text-left">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">외부 접속 포트 오픈 완료</span>
              <span class="text-[11px] font-bold text-emerald-700">0.0.0.0:3000</span>
            </div>
            <p class="text-xs font-bold mt-1 text-slate-700 leading-snug">
              외부 IP(125.141.49.113) 포트가 개방되어 있어, 동일 Wi-Fi는 물론 스마트폰 LTE/5G 환경에서도 즉시 접속 가능합니다.
            </p>
          </div>

          <!-- QR Code Container -->
          <div class="flex flex-col items-center justify-center gap-2 py-1">
            <div class="p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-sm inline-block">
              <img src="${qrUrl}" alt="모바일 접속 QR코드" class="w-44 h-44 rounded-lg block" />
            </div>
            <p class="text-xs text-slate-600 font-bold">
              📷 스마트폰 기본 카메라로 위 QR코드를 비추면 즉시 열립니다.
            </p>
          </div>

          <!-- Direct URL & Copy Button -->
          <div class="bg-slate-100 border-2 border-slate-300 rounded-2xl p-3 flex items-center justify-between gap-2.5 text-left">
            <div class="min-w-0 flex-1">
              <span class="text-[10px] font-black text-slate-500 block">모바일 웹 접속 URL</span>
              <span class="font-mono text-xs font-black text-blue-700 truncate block select-all">${mobileUrl}</span>
            </div>
            <button type="button" onclick="copyMobileUrlToClipboard();" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md border border-blue-400 shrink-0 transition-transform active:scale-95 flex items-center gap-1.5">
              <span>📋</span>
              <span>URL 복사</span>
            </button>
          </div>

          <button type="button" onclick="closeMobileAccessModal();" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition-all shadow">
            닫기
          </button>
        </div>
      </div>
    </div>
  `;
}

// Edit Modal (직접 수정)
function renderEditModal() {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white border-2 border-slate-400 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-900">
        <div class="bg-slate-100 px-6 py-4 border-b-2 border-slate-200 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <h3 class="font-black text-slate-900 text-lg">품의서 내용 직접 수정</h3>
            <button type="button" onclick="state.isEditModalOpen=false; openAiEditModal();" class="text-xs font-bold text-[#0565F0] hover:text-[#0452C7] bg-[#EEF5FF] border border-[#B8D7FF] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs">
              <span>✨</span>
              <span>AI 자연어 수정으로 전환</span>
            </button>
          </div>
          <button type="button" onclick="state.isEditModalOpen=false; renderApp();" class="text-slate-500 hover:text-slate-900 text-xl font-bold">✕</button>
        </div>

        <form onsubmit="
          event.preventDefault();
          saveDraftEdit(
            this.elements['titleInput'].value,
            this.elements['reasonInput'].value,
            this.elements['ruleInput'].value,
            this.elements['effectiveDateInput'].value
          );
        " class="p-6 space-y-4 text-sm">
          <div>
            <label class="block text-slate-800 font-black mb-1 text-xs">품의 건명</label>
            <input name="titleInput" type="text" value="${state.draft.title}" class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-[#0565F0] text-xs sm:text-sm" required />
          </div>
          <div>
            <label class="block text-slate-800 font-black mb-1 text-xs">1. 변경 사유 (배경 및 목적)</label>
            <textarea name="reasonInput" rows="3" class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-slate-900 leading-relaxed font-medium focus:outline-none focus:border-[#0565F0] text-xs sm:text-sm" required>${state.draft.reason}</textarea>
          </div>
          <div>
            <label class="block text-slate-800 font-black mb-1 text-xs">2. 최종 변경 심사 규칙</label>
            <textarea name="ruleInput" rows="2" class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-blue-900 font-mono font-black leading-relaxed focus:outline-none focus:border-[#0565F0] text-xs sm:text-sm" required>${state.draft.finalRule}</textarea>
          </div>
          <div>
            <label class="block text-slate-800 font-black mb-1 text-xs">5. 시행 일자 (및 전산 반영 계획)</label>
            <input name="effectiveDateInput" type="text" value="${state.draft.effectiveDate || '2026년 11월 1일(일) 00:00 부'}" class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-[#0565F0] text-xs sm:text-sm" required />
          </div>

          <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onclick="state.isEditModalOpen=false; renderApp();" class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs sm:text-sm">취소</button>
            <button type="submit" class="px-6 py-2.5 bg-[#0565F0] hover:bg-[#0452C7] text-white font-black rounded-xl shadow-md text-xs sm:text-sm">수정 내용 저장</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// AI 품의 초안 자연어 수정 모달 (항목 체크 선택 + 2단계 전·후 비교 및 최종 반영 확인)
function renderAiEditModal() {
  const isStep1 = state.aiEditStep === 'input';
  const targets = state.aiEditTargets || { title: true, reason: true, finalRule: true };
  const p = state.aiEditProposal || {};

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white border-2 border-blue-500 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-900">
        <!-- 모달 헤더 (JB우리캐피탈 스타일 & 2단계 진행 상태 표시) -->
        <div class="bg-gradient-to-r from-[#0B1B33] via-[#0F2445] to-[#0B1B33] text-white px-6 py-4 border-b border-[#233D66] flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#0565F0] flex items-center justify-center text-xl shadow-md border border-white/20">
              ✨
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black bg-[#EEF5FF] text-[#0565F0] px-2 py-0.5 rounded-full">젭대리 AI 엔진</span>
                <span class="text-xs text-blue-200 font-bold">심사전략 품의 초안</span>
              </div>
              <h3 class="font-black text-white text-base sm:text-lg mt-0.5">품의서 내용 AI 자연어 수정</h3>
            </div>
          </div>

          <!-- 스텝 인디케이터 배지 -->
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2.5 py-1 rounded-lg font-bold transition-all ${
              isStep1
                ? 'bg-[#0565F0] text-white ring-2 ring-blue-300'
                : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
            }">
              ${isStep1 ? '1단계: 지시 & 항목선택' : '✓ 1단계 완료'}
            </span>
            <span class="text-slate-400">➔</span>
            <span class="px-2.5 py-1 rounded-lg font-bold transition-all ${
              !isStep1
                ? 'bg-[#0565F0] text-white ring-2 ring-blue-300 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }">
              2단계: 전·후 비교 & 최종확인
            </span>
            <button type="button" onclick="closeAiEditModal();" class="ml-2 text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-white/10 transition-colors">✕</button>
          </div>
        </div>

        <!-- 모달 본문 영역 (스크롤 가능) -->
        <div class="p-5 sm:p-6 space-y-5 text-sm overflow-y-auto grow">
          ${isStep1 ? `
            <!-- [1단계] 수정 지시 입력 및 대상 항목 체크 선택 화면 -->

            <!-- 안내 배너 -->
            <div class="bg-[#EEF5FF] border border-[#B8D7FF] rounded-2xl p-4 text-xs space-y-1 text-slate-800">
              <div class="flex items-center gap-2 font-black text-[#0565F0]">
                <span>💡</span>
                <span>수정하고 싶은 항목을 체크하고, 자연어로 원하시는 수정 방향을 지시하세요.</span>
              </div>
              <p class="text-slate-600 font-medium pl-5 leading-relaxed">
                지시 후 바로 수정되지 않으며, <strong>수정 전·후 비교 화면</strong>에서 변경 내용을 확인하신 후 최종 적용 여부를 결정하실 수 있습니다.
              </p>
            </div>

            <!-- 항목 체크 선택 박스 -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-slate-900 font-black text-xs flex items-center gap-1.5">
                  <span class="text-base">🎯</span>
                  <span>수정 대상 항목 선택 (체크된 항목만 AI가 수정 제안합니다):</span>
                </label>
                <div class="flex items-center gap-2 text-[11px] font-bold">
                  <button type="button" onclick="setAllAiEditTargets(true);" class="text-[#0565F0] hover:underline">전체 선택</button>
                  <span class="text-slate-300">|</span>
                  <button type="button" onclick="setAllAiEditTargets(false);" class="text-slate-500 hover:underline">선택 해제</button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <!-- 1. 품의 제목 -->
                <div onclick="toggleAiEditTarget('title');" class="p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  targets.title
                    ? 'bg-[#EEF5FF] border-[#0565F0] shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-60'
                }">
                  <input
                    type="checkbox"
                    ${targets.title ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleAiEditTarget('title');"
                    class="w-4 h-4 mt-0.5 accent-[#0565F0] rounded cursor-pointer"
                  />
                  <div>
                    <span class="font-black text-xs text-slate-900 block">1. 품의 건명 (제목)</span>
                    <span class="text-[10px] text-slate-500 font-medium">헤드라인 및 말머리 문구</span>
                  </div>
                </div>

                <!-- 2. 변경 사유 -->
                <div onclick="toggleAiEditTarget('reason');" class="p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  targets.reason
                    ? 'bg-[#EEF5FF] border-[#0565F0] shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-60'
                }">
                  <input
                    type="checkbox"
                    ${targets.reason ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleAiEditTarget('reason');"
                    class="w-4 h-4 mt-0.5 accent-[#0565F0] rounded cursor-pointer"
                  />
                  <div>
                    <span class="font-black text-xs text-slate-900 block">2. 변경 사유 (추진 배경)</span>
                    <span class="text-[10px] text-slate-500 font-medium">영업 상황, 배경 및 목적</span>
                  </div>
                </div>

                <!-- 3. 변경 내용 -->
                <div onclick="toggleAiEditTarget('finalRule');" class="p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  targets.finalRule
                    ? 'bg-[#EEF5FF] border-[#0565F0] shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-60'
                }">
                  <input
                    type="checkbox"
                    ${targets.finalRule ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleAiEditTarget('finalRule');"
                    class="w-4 h-4 mt-0.5 accent-[#0565F0] rounded cursor-pointer"
                  />
                  <div>
                    <span class="font-black text-xs text-slate-900 block">3. 변경 내용 (심사 규칙)</span>
                    <span class="text-[10px] text-slate-500 font-medium">기본 통제안 및 예외 취급 기준</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 추천 지시어 칩 -->
            <div class="space-y-2">
              <span class="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>⚡</span>
                <span>추천 지시어 (클릭 시 자동 입력):</span>
              </span>
              <div class="flex flex-wrap gap-2 text-xs">
                ${[
                  '임원 보고용으로 결론을 두괄식으로 간결하게 요약해줘',
                  '리스크 선제 방어 및 감사 대응 관점을 보강해줘',
                  '영업기획팀과 협의한 우량고객 예외 타당성을 강조해줘',
                  '공문서 격식에 맞게 전문적이고 단정한 어조로 다듬어줘'
                ].map(chip => `
                  <button type="button" onclick="document.getElementById('ai-draft-prompt-input').value='${chip}'; state.aiEditInputText='${chip}';" class="px-3 py-1.5 bg-slate-50 hover:bg-[#EEF5FF] hover:border-[#0565F0] hover:text-[#0565F0] text-slate-700 border border-slate-300 rounded-xl font-bold transition-all text-left shadow-2xs">
                    💬 "${chip}"
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 자연어 지시 입력 폼 -->
            <form onsubmit="
              event.preventDefault();
              const val = document.getElementById('ai-draft-prompt-input').value;
              requestAiDraftProposal(val);
            " class="space-y-4">
              <div>
                <label class="block text-slate-800 font-black mb-1.5 text-xs flex justify-between items-center">
                  <span>AI에게 요청할 수정 지시 내용</span>
                  <span class="text-[11px] text-slate-400 font-medium">자연어로 자유롭게 요청하세요</span>
                </label>
                <textarea
                  id="ai-draft-prompt-input"
                  rows="3"
                  oninput="state.aiEditInputText=this.value;"
                  placeholder="예: 결론을 맨 앞에 두괄식으로 배치하고, 1~2등급 우량차주 예외 취급의 손익 타당성을 더 설득력 있게 보강해줘..."
                  class="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-3.5 text-slate-900 font-medium leading-relaxed focus:outline-none focus:border-[#0565F0] focus:bg-white text-xs sm:text-sm"
                  required
                >${state.aiEditInputText}</textarea>
              </div>

              <!-- 현재 초안 상태 요약 바 -->
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <span class="text-[11px] font-black text-slate-500">현재 품의 건명:</span>
                <span class="font-bold text-slate-800 truncate max-w-md">${state.draft.title}</span>
              </div>

              <!-- 로딩 상태 표시 -->
              ${state.isAiEditingDraft ? `
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                  <span class="w-5 h-5 border-2 border-[#0565F0] border-t-transparent rounded-full animate-spin"></span>
                  <span class="text-xs font-black text-[#0565F0]">젭대리 AI가 선택된 항목 문안을 분석 및 재구성하고 있습니다...</span>
                </div>
              ` : ''}

              <!-- 하단 액션 버튼 -->
              <div class="pt-3 border-t border-slate-200 flex justify-end items-center gap-3">
                <button type="button" onclick="closeAiEditModal();" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all">
                  취소
                </button>
                <button type="submit" ${state.isAiEditingDraft ? 'disabled' : ''} class="px-6 py-3 bg-[#0565F0] hover:bg-[#0452C7] disabled:bg-slate-300 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 border border-[#3A8BFD] active:scale-95">
                  <span>✨</span>
                  <span>AI 수정안 생성 & 전·후 비교하기</span>
                  <span>➔</span>
                </button>
              </div>
            </form>
          ` : `
            <!-- [2단계] 수정 전·후 비교 및 최종 반영 확인 화면 -->

            <!-- 확인 질문 안내 배너 -->
            <div class="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-[#0565F0] rounded-2xl p-4.5 text-xs space-y-1.5 shadow-sm">
              <div class="flex items-center gap-2 font-black text-blue-900 text-sm">
                <span class="text-lg">⚖️</span>
                <span>AI 수정안 검토: 아래 수정 전·후 문안을 비교 확인 후 적용 여부를 선택하세요.</span>
              </div>
              <p class="text-slate-700 font-medium leading-relaxed pl-6">
                입력하신 지시: <strong class="text-[#0565F0] bg-white px-2 py-0.5 rounded border border-blue-200">"${p.prompt || state.aiEditInputText}"</strong>
              </p>
            </div>

            <!-- 수정 전 / 후 비교 카드 목록 -->
            <div class="space-y-4">
              <!-- 1. 품의 제목 -->
              ${targets.title ? `
                <div class="border-2 border-slate-300 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-[#0565F0]"></span>
                      <span>1. 품의 건명 (제목)</span>
                    </span>
                    <span class="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                      수정 반영 대상
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div class="bg-rose-50/50 border border-rose-200 p-3 rounded-xl space-y-1">
                      <span class="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">수정 전 (기존)</span>
                      <p class="text-slate-600 line-through font-medium leading-relaxed">${state.draft.title}</p>
                    </div>
                    <div class="bg-[#EEF5FF] border-2 border-[#0565F0] p-3 rounded-xl space-y-1 shadow-2xs">
                      <span class="text-[10px] font-black text-white bg-[#0565F0] px-2 py-0.5 rounded">수정 후 (AI 제안)</span>
                      <p class="text-slate-950 font-black leading-relaxed">${p.title}</p>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span class="font-bold flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                    <span>1. 품의 건명 (제목)</span>
                  </span>
                  <span class="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                    수정 대상 제외 (기존 유지)
                  </span>
                </div>
              `}

              <!-- 2. 변경 사유 -->
              ${targets.reason ? `
                <div class="border-2 border-slate-300 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-[#0565F0]"></span>
                      <span>2. 변경 사유 (추진 배경 및 목적)</span>
                    </span>
                    <span class="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                      수정 반영 대상
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div class="bg-rose-50/50 border border-rose-200 p-3 rounded-xl space-y-1">
                      <span class="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">수정 전 (기존)</span>
                      <p class="text-slate-600 line-through font-medium leading-relaxed">${state.draft.reason}</p>
                    </div>
                    <div class="bg-[#EEF5FF] border-2 border-[#0565F0] p-3 rounded-xl space-y-1 shadow-2xs">
                      <span class="text-[10px] font-black text-white bg-[#0565F0] px-2 py-0.5 rounded">수정 후 (AI 제안)</span>
                      <p class="text-slate-950 font-bold leading-relaxed">${p.reason}</p>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span class="font-bold flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                    <span>2. 변경 사유 (추진 배경 및 목적)</span>
                  </span>
                  <span class="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                    수정 대상 제외 (기존 유지)
                  </span>
                </div>
              `}

              <!-- 3. 변경 내용 (심사 규칙) -->
              ${targets.finalRule ? `
                <div class="border-2 border-slate-300 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-[#0565F0]"></span>
                      <span>3. 변경 내용 (심사 전략 규칙 고도화안)</span>
                    </span>
                    <span class="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                      수정 반영 대상
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div class="bg-rose-50/50 border border-rose-200 p-3 rounded-xl space-y-1">
                      <span class="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">수정 전 (기존)</span>
                      <p class="text-slate-600 line-through font-mono font-medium leading-relaxed whitespace-pre-line">${state.draft.finalRule}</p>
                    </div>
                    <div class="bg-[#EEF5FF] border-2 border-[#0565F0] p-3 rounded-xl space-y-1 shadow-2xs">
                      <span class="text-[10px] font-black text-white bg-[#0565F0] px-2 py-0.5 rounded">수정 후 (AI 제안)</span>
                      <p class="text-blue-950 font-mono font-black leading-relaxed whitespace-pre-line">${p.finalRule}</p>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span class="font-bold flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                    <span>3. 변경 내용 (심사 전략 규칙 고도화안)</span>
                  </span>
                  <span class="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                    수정 대상 제외 (기존 유지)
                  </span>
                </div>
              `}
            </div>

            <!-- 하단 확인 질문 및 최종 반영 버튼 영역 -->
            <div class="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div class="text-xs text-slate-700 font-medium">
                <span class="text-slate-500 font-bold">확인 질문:</span>
                <strong class="text-slate-950 ml-1">위 AI 수정안을 품의서 초안에 최종 반영하시겠습니까?</strong>
              </div>
              <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button type="button" onclick="state.aiEditStep='input'; renderApp();" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 border border-slate-300">
                  <span>↩️</span>
                  <span>다시 지시하기</span>
                </button>
                <button type="button" onclick="closeAiEditModal();" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs sm:text-sm transition-all">
                  취소
                </button>
                <button type="button" onclick="applyAiProposalToDraft();" class="px-5 py-2.5 bg-[#0565F0] hover:bg-[#0452C7] text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 border border-[#3A8BFD] active:scale-95">
                  <span>✅</span>
                  <span>최종 수정안 품의서에 반영하기</span>
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// AI What-If 시뮬레이터 팝업 모달 (자연어로 다양한 분석 요청 & 최종안 협의화면 반영)
// ========================================================
function renderAiWhatIfModal() {
  const currentAccount = ACCOUNTS[state.currentRoleId] || ACCOUNTS.CREDIT_STAFF;
  const candidate = state.aiWhatIfCandidate;
  const targetSlotKey = state.aiWhatIfTargetSlot || (state.currentRoleId === 'SALES_STAFF' ? 'sales' : 'credit');
  const isSalesDept = state.currentRoleId === 'SALES_STAFF';
  const isCreditDept = state.currentRoleId === 'CREDIT_STAFF' || state.currentRoleId === 'CREDIT_LEADER' || state.currentRoleId === 'RISK_HEAD';
  const canEditSales = isSalesDept;
  const canEditCredit = isCreditDept;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white border-2 border-slate-400 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-900">
        
        <!-- 모달 헤더 -->
        <div class="bg-[#0B1B33] text-white px-6 py-4.5 border-b border-[#1E3456] flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-[#0565F0] flex items-center justify-center text-white text-xl shadow-sm border border-white/20">
              🤖
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-white text-lg">젭대리 AI What-If 시뮬레이터 (자연어 조건 분석 & 최종안 도출 Lab)</h3>
                <span class="text-[10px] bg-purple-900/60 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full font-bold">18.4만 건 전수 엔진</span>
              </div>
              <p class="text-xs text-slate-300 font-medium">
                자연어로 조건을 자유롭게 분석 요청하고, 도출된 최적안을 부서간 협의 화면에 원클릭으로 반영합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onclick="closeAiWhatIfModal();"
            class="text-slate-400 hover:text-white text-2xl font-bold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- 모달 바디: 스크롤 영역 -->
        <div class="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          <!-- 상단 가이드 배너 -->
          <div class="bg-gradient-to-r from-purple-50 via-blue-50 to-slate-50 border-2 border-purple-200 rounded-2xl p-4 text-xs space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-black text-purple-900 flex items-center gap-1.5">
                <span>💡</span> <span>자연어 대화형 What-If 분석 가이드</span>
              </span>
              <span class="text-[11px] font-bold text-slate-500">
                요청자: <strong>${currentAccount.dept} ${currentAccount.name}</strong>
              </span>
            </div>
            <p class="text-slate-700 leading-relaxed font-medium">
              "1~2등급 우량고객 예외 시", "DTI 32%로 완화 시", "단기조회 4건 강화 시" 등 궁금한 가설을 자연어로 입력하면 빅데이터 백테스트 영향도를 산출합니다. 만족스러운 최종안이 나오면 하단의 버튼으로 부서간 협의 화면에 즉시 등록할 수 있습니다.
            </p>
          </div>

          <!-- 이런 저런 분석 요청 퀵 프롬프트 칩들 -->
          <div class="space-y-1.5">
            <span class="text-xs font-black text-slate-700 block">⚡ 추천 분석 가설 (원클릭 시뮬레이션):</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onclick="runAiWhatIfModalSimulation('1~2등급 우량고객은 예외로 빼주고 손익과 승인율 다시 계산해줘');"
                class="text-left bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>💬 "1~2등급 우량고객 예외 시 손익·승인율"</span>
                <span class="text-purple-600 text-[11px] group-hover:translate-x-0.5 transition-transform">실행 ➔</span>
              </button>
              <button
                type="button"
                onclick="runAiWhatIfModalSimulation('DTI 기준을 32%로 좀 완화하면 승인율이 얼마나 회복돼?');"
                class="text-left bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>💬 "DTI 32%로 풀면 승인율과 연체율은?"</span>
                <span class="text-purple-600 text-[11px] group-hover:translate-x-0.5 transition-transform">실행 ➔</span>
              </button>
              <button
                type="button"
                onclick="runAiWhatIfModalSimulation('최근 6개월 신용조회 4건 이상으로 기준을 강화하면 연체율은?');"
                class="text-left bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>💬 "신용조회 4건으로 강화 시 연체율 개선폭"</span>
                <span class="text-purple-600 text-[11px] group-hover:translate-x-0.5 transition-transform">실행 ➔</span>
              </button>
              <button
                type="button"
                onclick="runAiWhatIfModalSimulation('다중채무 3개사 이상 보유 차주를 차단하면 건전성 어떻게 돼?');"
                class="text-left bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>💬 "다중채무 3개사 이상 차단 시 건전성"</span>
                <span class="text-purple-600 text-[11px] group-hover:translate-x-0.5 transition-transform">실행 ➔</span>
              </button>
            </div>
          </div>

          <!-- 자연어 질의 입력 폼 -->
          <form onsubmit="event.preventDefault(); runAiWhatIfModalSimulation();" class="space-y-2 pt-1 border-t border-slate-200">
            <div class="flex gap-2">
              <input
                type="text"
                id="ai-whatif-input"
                value="${state.aiWhatIfInputText || ''}"
                oninput="state.aiWhatIfInputText=this.value;"
                placeholder="어떤 가설이나 조건을 분석해볼까요? 자연어로 자유롭게 입력하세요..."
                class="flex-1 bg-slate-50 border-2 border-purple-300 focus:border-purple-600 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none"
              />
              <button
                type="submit"
                ${state.aiWhatIfIsRunning ? 'disabled' : ''}
                class="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
              >
                <span>${state.aiWhatIfIsRunning ? '엔진 분석 중...' : '시뮬레이션 요청'}</span>
                <span>⚡</span>
              </button>
            </div>
          </form>

          <!-- 시뮬레이션 분석 중 애니메이션 -->
          ${state.aiWhatIfIsRunning ? `
            <div class="p-6 bg-purple-50/80 rounded-2xl border-2 border-purple-300 text-center space-y-2 animate-pulse">
              <div class="text-3xl">🤖</div>
              <span class="text-sm font-black text-purple-900 block">젭대리 AI 엔진이 184,200건 빅데이터를 실시간 백테스트 중입니다...</span>
              <span class="text-xs text-purple-700 block font-medium">OOT 안정성, 차주 세그먼트별 단조성 검정 및 재무 NIM 변동 산출 중</span>
            </div>
          ` : ''}

          <!-- 과거 질의 & 분석 내역 (History 피드) -->
          <div class="space-y-3 pt-2 border-t border-slate-200">
            <span class="text-xs font-black text-slate-700 block">📜 시뮬레이션 분석 요청 및 응답 이력:</span>
            <div class="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              ${state.aiWhatIfHistory.map(item => {
                if (item.sender === 'user') {
                  return `
                    <div class="flex justify-end">
                      <div class="max-w-[85%] bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-xs space-y-1 shadow-sm">
                        <div class="flex justify-between items-center gap-3">
                          <span class="text-[10px] text-purple-200 font-bold">분석 요청</span>
                          <span class="text-[10px] text-purple-200 font-mono">${item.timestamp}</span>
                        </div>
                        <p class="font-medium">${item.query}</p>
                      </div>
                    </div>
                  `;
                } else {
                  const res = item.result;
                  return `
                    <div class="flex justify-start">
                      <div class="max-w-[90%] bg-slate-50 border-2 border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-xs space-y-2 shadow-sm">
                        <div class="flex justify-between items-center">
                          <span class="font-black text-purple-900 flex items-center gap-1">
                            <span>🤖</span> <span>AI 분석 결과: ${res.name}</span>
                          </span>
                          <span class="text-[10px] text-slate-400 font-mono">${item.timestamp}</span>
                        </div>
                        <div class="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                          규칙: ${res.rule}
                        </div>
                        <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
                          <div class="bg-white p-1.5 rounded-lg border border-slate-200">
                            <span class="text-[10px] text-slate-500 block">연체율 개선</span>
                            <span class="font-black text-emerald-700">${res.delinquencyDiff}%p</span>
                          </div>
                          <div class="bg-white p-1.5 rounded-lg border border-slate-200">
                            <span class="text-[10px] text-slate-500 block">승인율 변동</span>
                            <span class="font-black text-amber-800">${res.approvalDiff}%p</span>
                          </div>
                          <div class="bg-white p-1.5 rounded-lg border border-slate-200">
                            <span class="text-[10px] text-slate-500 block">예상 순익</span>
                            <span class="font-black text-blue-700">+${res.profitDiff}억원</span>
                          </div>
                        </div>
                        <p class="text-slate-700 font-medium leading-relaxed">${res.summary}</p>
                      </div>
                    </div>
                  `;
                }
              }).join('')}
            </div>
          </div>

          <!-- 핵심: 현재 도출된 최종 후보안 카드 (Candidate Proposal Card) -->
          ${candidate ? `
            <div class="bg-gradient-to-br from-emerald-50 via-white to-purple-50 border-2 border-emerald-500 ring-2 ring-emerald-200 rounded-2xl p-5 space-y-4 shadow-lg">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200">
                <div class="flex items-center gap-2">
                  <span class="text-xl">🏆</span>
                  <div>
                    <span class="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">AI 도출 최종 후보안</span>
                    <h4 class="text-base font-black text-slate-900 mt-0.5">${candidate.name}</h4>
                  </div>
                </div>
                <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
                  ${candidate.verdict}
                </span>
              </div>

              <!-- 적용 규칙 -->
              <div>
                <span class="text-[11px] font-black text-slate-600 block mb-1">적용 심사 규칙 (Rule Logic):</span>
                <div class="bg-white p-3 rounded-xl border border-emerald-300 font-mono text-xs font-bold text-slate-900 shadow-sm leading-relaxed">
                  ${candidate.rule}
                </div>
              </div>

              <!-- 4대 핵심 영향도 카드 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div class="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-500 font-bold block">연체율 개선</span>
                  <span class="text-base font-black text-emerald-700">${candidate.delinquencyDiff}%p</span>
                </div>
                <div class="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-500 font-bold block">승인율 회복치</span>
                  <span class="text-base font-black text-amber-800">${candidate.approvalDiff}%p</span>
                </div>
                <div class="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-500 font-bold block">예상 당기순익</span>
                  <span class="text-base font-black text-blue-700">+${candidate.profitDiff}억원</span>
                </div>
                <div class="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-500 font-bold block">적용 표본 모수</span>
                  <span class="text-base font-black text-slate-800 font-mono">${candidate.targetCount.toLocaleString()}건</span>
                </div>
              </div>

              <!-- 도출 사유 및 효과 -->
              <div class="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs text-slate-800 font-medium leading-relaxed">
                <span class="font-bold text-emerald-950 block mb-0.5">💡 안건 사유 및 소견:</span>
                ${candidate.rationale}
              </div>

              <!-- 반영 버튼 세트 (소속 부서 안건에만 반영 가능) -->
              <div class="pt-3 border-t border-emerald-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-slate-900">📌 위 AI 후보안을 부서간 협의 화면에 반영:</span>
                  <span class="text-[11px] text-slate-500 font-medium">※ 소속 부서의 안건에만 반영할 수 있습니다.</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <!-- 1) 영업기획팀 안에 반영 -->
                  ${canEditSales ? `
                    <button
                      type="button"
                      onclick="applyAiCandidateToDepartmentProposal('sales');"
                      class="py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 border border-amber-600"
                    >
                      <span class="text-base">🏢</span>
                      <span>'영업기획팀 안'에 반영</span>
                    </button>
                  ` : `
                    <button
                      type="button"
                      disabled
                      class="py-3.5 px-4 bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      title="영업기획팀 담당자만 반영할 수 있습니다."
                    >
                      <span>🔒</span>
                      <span>'영업기획팀 안' 반영 (영업기획팀 전용)</span>
                    </button>
                  `}

                  <!-- 2) 신용관리팀 안에 반영 -->
                  ${canEditCredit ? `
                    <button
                      type="button"
                      onclick="applyAiCandidateToDepartmentProposal('credit');"
                      class="py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 border border-blue-700"
                    >
                      <span class="text-base">🛡️</span>
                      <span>'신용관리팀 안'에 반영</span>
                    </button>
                  ` : `
                    <button
                      type="button"
                      disabled
                      class="py-3.5 px-4 bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      title="신용관리팀만 반영할 수 있습니다."
                    >
                      <span>🔒</span>
                      <span>'신용관리팀 안' 반영 (신용관리팀 전용)</span>
                    </button>
                  `}
                </div>
              </div>
            </div>
          ` : ''}

        </div>

        <!-- 모달 푸터 -->
        <div class="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span class="text-xs text-slate-500 font-medium">
            반영 완료 시 부서간 협의 화면의 해당 안건 카드와 토의방에 자동 등록됩니다.
          </span>
          <button
            type="button"
            onclick="closeAiWhatIfModal();"
            class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// AI 핵심 모듈 I/O 상세 명세서 데이터셋 (상대방 개발자 공유용 표준 계약)
// ========================================================
const AI_SPECS_DATA = {
  'pre-analyze': {
    title: '1. 선행 3~5대 최적 전략 도출 API',
    endpoint: '/api/v1/ai/pre-analyze',
    method: 'POST',
    badge: '1단계 ➔ 2단계 전환 핵심',
    timing: '영업기획팀 의뢰 등록 후 신용관리팀 담당자 접수 시점 (acceptTaskRequest)',
    flowDesc: '신용관리팀 담당자가 [업무요건 접수]를 누르면 이 API가 호출되며, 반환된 3~5대 전략(strategies)과 주요 지표 비교표(breakdownRows)를 받아 [2단계 다자간 부서 협의] 화면으로 즉시 전환하여 협의를 시작합니다.',
    params: [
      { name: 'taskId', type: 'string', required: '필수', desc: '의뢰 안건 번호 (예: REQ-2026-1011-042)' },
      { name: 'targetProduct', type: 'string', required: '필수', desc: '대상 금융 상품 (예: PL 신용대출 36개월물)' },
      { name: 'targetMetric', type: 'string', required: '필수', desc: '최적화 대상 핵심 지표 (기본값: delinquency)' },
      { name: 'constraints', type: 'object', required: '필수', desc: '승인율 하락 제약(maxApprovalDrop), 최소 표본 비중(minSampleSizeRatio) 등' },
      { name: 'backgroundReason', type: 'string', required: '선택', desc: '영업기획팀 의뢰 배경 및 시장 상황' },
      { name: 'requester', type: 'object', required: '필수', desc: '의뢰자 정보 ({ department, name })' },
    ],
    sampleRequest: {
      taskId: "REQ-2026-1011-042",
      targetProduct: "PL 신용대출 36개월물",
      targetMetric: "delinquency",
      constraints: {
        maxApprovalDrop: 3.0,
        minSampleSizeRatio: 0.01,
        ootValidationRequired: true
      },
      backgroundReason: "고금리 장기화에 따른 다중채무 차주 부실 연체 선제 차단 및 우량차주 이탈 방지",
      requester: {
        department: "영업기획팀",
        name: "최기획 대리"
      }
    },
    sampleResponse: {
      status: "SUCCESS",
      analyzedSampleCount: 184200,
      analysisDurationMs: 420,
      engineVersion: "JDBP-AI-Core-v2.4 (OOT-Evaluated)",
      taskId: "REQ-2026-1011-042",
      recommendedStrategyId: "STRAT_B",
      summary: "184,200건의 차주 빅데이터 파레토 프론티어 분석 결과, 승인율 하락폭 -3.0%p 제약 내에서 최적의 건전성 개선 효과를 내는 5대 대안이 도출되었습니다.",
      strategies: [
        {
          id: "STRAT_A",
          rank: 1,
          name: "연체율 최소화형 (극단적 건전성 방어)",
          tag: "리스크 집중형",
          approvalRate: 31.2,
          approvalDiff: -4.3,
          delinquencyRate: 0.95,
          delinquencyDiff: -1.75,
          netProfitImpact: 3.1,
          sampleSizePercent: 2.1,
          verdict: "OOT 백테스트 통과 / 표본 3,868건 (단조성 완벽 충족)",
          ruleSummary: "DTI 28% 초과 & 단기조회 3건 이상 부결",
          pros: "연체율 -1.75%p 급감으로 부실채권 리스크 원천 차단",
          cons: "승인율 -4.3%p 급락으로 영업기획팀 목표 달성 차질"
        },
        {
          id: "STRAT_B",
          rank: 2,
          name: "파레토 최적 균형형 (젭대리 AI 기본 추천안)",
          tag: "젭대리 AI 추천",
          isRecommended: true,
          approvalRate: 32.4,
          approvalDiff: -3.1,
          delinquencyRate: 1.25,
          delinquencyDiff: -1.45,
          netProfitImpact: 5.2,
          sampleSizePercent: 1.8,
          verdict: "OOT 백테스트 통과 / 표본 3,315건 (이익 극대화 균형점)",
          ruleSummary: "DTI 30% 초과 & 최근 6개월 조회 3건 이상 부결 (다중채무자 집중 제어)",
          pros: "당기순익 +5.2억 원 극대화 및 건전성-수익성 완벽 밸런스",
          cons: "영업기획팀 승인율 하락 저항 최소화를 위한 절충 필요"
        },
        {
          id: "STRAT_C",
          rank: 3,
          name: "영업 취급액 보전형 (수익 방어 절충안)",
          tag: "영업 친화형",
          approvalRate: 33.7,
          approvalDiff: -1.8,
          delinquencyRate: 1.55,
          delinquencyDiff: -1.15,
          netProfitImpact: 4.6,
          sampleSizePercent: 1.4,
          verdict: "OOT 백테스트 통과 / 표본 2,578건 (승인율 타격 최소)",
          ruleSummary: "DTI 32% 초과 & 최근 6개월 조회 4건 이상 부결",
          pros: "승인율 하락 -1.8%p로 제한하여 영업 잔액 목표 유지",
          cons: "연체율 개선폭이 -1.15%p로 다소 둔화됨"
        }
      ],
      breakdownRows: [
        {
          metricName: "승인율 (Approval Rate)",
          asIs: "35.5%",
          toBe: "32.4%",
          diff: "-3.1%p",
          impactPositive: false,
          comment: "최대 허용 한도(-3.5%p) 이내 통제"
        },
        {
          metricName: "예상 연체율 (Delinquency Rate)",
          asIs: "2.70%",
          toBe: "1.25%",
          diff: "-1.45%p",
          impactPositive: true,
          comment: "연체율 53% 감소 (건전성 대폭 강화)"
        },
        {
          metricName: "연간 예상 순익 (NIM 반영)",
          asIs: "142.5억 원",
          toBe: "147.7억 원",
          diff: "+5.2억 원 개선",
          impactPositive: true,
          comment: "이자수익 감소분 대비 대손비용 절감이 더 큼"
        }
      ]
    }
  },

  'simulate-whatif': {
    title: '2. What-If 가설 실시간 시뮬레이션 API',
    endpoint: '/api/v1/ai/simulate-whatif',
    method: 'POST',
    badge: '2단계 다자간 협의 Lab',
    timing: '2단계 다자간 부서 협의 화면에서 What-If Lab 팝업을 통해 자연어 가설 질의 시 (runAiWhatIfModalSimulation)',
    flowDesc: '영업기획팀/신용관리팀 담당자나 임원이 "1~2등급 우량고객 예외 시 손익은?", "DTI 32%로 완화하면?" 등의 가설을 자연어로 입력하면, 이 API가 candidate 객체를 반환합니다. 사용자가 승인하면 부서별 최종 안건 카드로 즉시 반영됩니다.',
    params: [
      { name: 'taskId', type: 'string', required: '필수', desc: '현재 진행 중인 안건 ID' },
      { name: 'baseStrategyId', type: 'string', required: '필수', desc: '시뮬레이션의 기준이 되는 베이스 전략 ID (예: STRAT_B)' },
      { name: 'userPrompt', type: 'string', required: '필수', desc: '사용자가 입력한 자연어 조건 문장' },
      { name: 'department', type: 'string', required: '필수', desc: '요청자 소속 부서 (영업기획팀 / 신용관리팀)' },
      { name: 'currentRole', type: 'string', required: '필수', desc: '요청자 역할 ID (SALES_STAFF, CREDIT_STAFF 등)' },
      { name: 'parameters', type: 'object', required: '선택', desc: '자연어에서 파싱된 규칙 파라미터 보조 맵' },
    ],
    sampleRequest: {
      taskId: "REQ-2026-1011-042",
      baseStrategyId: "STRAT_B",
      userPrompt: "1~2등급 우량고객은 예외로 빼주고 손익과 승인율 다시 계산해줘",
      department: "영업기획팀",
      currentRole: "SALES_STAFF",
      parameters: {
        dtiThreshold: 30,
        cbInquiryThreshold: 3,
        allowVipException: true
      }
    },
    sampleResponse: {
      status: "SUCCESS",
      latencyMs: 380,
      candidate: {
        name: "1~2등급 우량고객 예외 인정 절충안",
        rule: "DTI 30% 초과 & 6개월 조회 3건 이상 부결 (단, 1~2등급 우량고객 예외 허용 및 정상 승인)",
        rationale: "1~2등급 우량고객 142명 취급 유지로 이탈 방어, 이자수익 +8천만 원 보전 및 건전성 악영향 무시 가능(연체율 0.12%)",
        approvalDiff: -2.2,
        delinquencyDiff: -1.3,
        profitDiff: 4.8,
        targetCount: 14678,
        verdict: "OOT 백테스트 통과 / 단조성 만족 (AUC 0.841)",
        summary: "1~2등급 우량고객 142명을 예외 처리하면 승인율이 -3.1%p에서 -2.2%p로 +0.9%p 회복되며, 당기순이익은 +4.8억 원으로 +0.8억 원 추가 개선됩니다.",
        sourcePrompt: "1~2등급 우량고객은 예외로 빼주고 손익과 승인율 다시 계산해줘",
        metricsDetail: {
          approvalRate: 33.3,
          delinquencyRate: 1.40,
          sampleSize: 14678,
          backtestAuc: 0.841
        }
      }
    }
  },

  'refine-draft': {
    title: '3. 심사전략 품의서 문안 자연어 정제 API',
    endpoint: '/api/v1/ai/refine-draft',
    method: 'POST',
    badge: '3단계 품의서 작성 연동',
    timing: '3단계 품의서 작성 화면에서 [초안 내용 AI 수정] 팝업을 통해 자연어 수정을 요청할 때 (requestAiDraftProposal)',
    flowDesc: '사용자가 체크한 항목(품의 제목, 변경 사유, 변경 내용)과 자연어 수정 지시("임원보고용으로 두괄식 요약", "리스크 선제대응 강조")를 분석하여 금융 공문서 격식에 맞게 문안을 재구성합니다. 반환된 proposal을 받아 수정 전·후 비교 화면을 띄운 뒤 품의서 본문에 최종 반영합니다.',
    params: [
      { name: 'currentDraft', type: 'object', required: '필수', desc: '현재 품의서 내용 ({ title, reason, finalRule, effectiveDate })' },
      { name: 'targets', type: 'object', required: '필수', desc: '수정 대상 항목 체크 여부 ({ title, reason, finalRule })' },
      { name: 'prompt', type: 'string', required: '필수', desc: '사용자의 자연어 수정 지시문' },
      { name: 'requesterDept', type: 'string', required: '선택', desc: '요청자 소속 부서' },
    ],
    sampleRequest: {
      currentDraft: {
        title: "PL 신용대출 36개월물 심사기준 개편(안)",
        reason: "고금리 장기화에 따른 다중채무 차주 부실 연체 선제 차단 및 포트폴리오 건전성 강화",
        finalRule: "DTI 30% 초과 & 최근 6개월 신용조회 3건 이상 차주 부결",
        effectiveDate: "2026년 11월 1일(일) 00:00 부"
      },
      targets: {
        title: true,
        reason: true,
        finalRule: true
      },
      prompt: "임원보고용으로 결론을 두괄식으로 간결하게 요약해줘",
      requesterDept: "신용관리팀"
    },
    sampleResponse: {
      status: "SUCCESS",
      latencyMs: 310,
      confidenceScore: 0.96,
      rationale: "금융 공문서 표준 서식 및 금융감독원 여신심사 모범규준에 부합하도록 문안 재구성",
      proposal: {
        title: "[임원보고] PL 신용대출 36개월물 DTI·신용조회 심사기준 개편안 요약",
        reason: "【핵심 요약】 최근 다중채무 차주의 신용조회 급증에 따른 연체전이율 상승 압력을 선제 차단(-1.3%p 감소)하고, 1~2등급 우량차주 이탈 방지를 병행하여 당기순이익 +4.8억 원을 동시 달성하는 최적 개편안임. (영업기획팀-신용관리팀 전 부서 최종 합의 완료)",
        finalRule: "▶ 기본원칙: DTI 30% 초과 & 최근 6개월 조회 3건 이상 ➔ 부결\n▶ 예외원칙: KCB/NICE 1~2등급 우량차주 ➔ 정상 취급 (취급 타격 -2.2%p 방어)"
      }
    }
  }
};

function copySpecSchemaToClipboard(endpointKey, type) {
  const spec = AI_SPECS_DATA[endpointKey];
  if (!spec) return;
  const data = type === 'request' ? spec.sampleRequest : spec.sampleResponse;
  copyTextToClipboard(JSON.stringify(data, null, 2), `[${spec.endpoint}] ${type.toUpperCase()} JSON 스펙이 클립보드에 복사되었습니다.`);
}

function copyAllSpecDocToClipboard(endpointKey) {
  const spec = AI_SPECS_DATA[endpointKey];
  if (!spec) return;
  const doc = `### ${spec.title}\n\n- Endpoint: ${spec.method} ${spec.endpoint}\n- Timing: ${spec.timing}\n- Downstream Flow: ${spec.flowDesc}\n\n#### [Request Payload Specification]\n\`\`\`json\n${JSON.stringify(spec.sampleRequest, null, 2)}\n\`\`\`\n\n#### [Response Payload Specification]\n\`\`\`json\n${JSON.stringify(spec.sampleResponse, null, 2)}\n\`\`\``;
  copyTextToClipboard(doc, `[${spec.title}] I/O 전체 개발 연동 스펙 문서가 복사되었습니다.`);
}

// ========================================================
// AI 에이전트 연동 I/O 인터페이스 센터 모달 렌더러
// ========================================================
function renderAiModuleConfigModal() {
  const cfg = state.aiApiConfig;
  const activeTab = cfg.activeTab || 'specs';
  const selectedEp = cfg.selectedSpecEndpoint || 'pre-analyze';
  const currentSpec = AI_SPECS_DATA[selectedEp] || AI_SPECS_DATA['pre-analyze'];
  const logs = state.aiPacketLogs || [];

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fadeIn text-slate-900">
      <div class="bg-white border-2 border-slate-300 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        <!-- 모달 헤더: JDBP & AI Core Integration Center -->
        <div class="bg-gradient-to-r from-[#0B1B33] via-[#0F2445] to-[#0B1B33] text-white px-6 py-4.5 border-b border-[#233D66] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-md border border-white/20">
              ⚡
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-black text-white text-base sm:text-lg">AI 에이전트 연동 I/O 인터페이스 센터</h3>
                <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  cfg.mode === 'MOCK'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : (cfg.status === 'connected' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-400/20 text-rose-300 border border-rose-400/40')
                }">
                  현재 모드: ${cfg.mode === 'MOCK' ? 'MOCK (상대방 제작 중 모의 응답)' : 'API (실서버 REST 통신)'}
                </span>
              </div>
              <p class="text-xs text-slate-300 font-medium mt-0.5">
                상대방 개발자의 핵심 AI 분석 모듈 I/O 규격 동기화, 실시간 패킷 검사기 및 안전한 Fallback 운영 환경을 제공합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onclick="closeAiModuleConfigModal();"
            class="text-slate-400 hover:text-white text-2xl font-bold px-2.5 py-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- 서브 탭 네비게이션 (I/O 명세서 | 연동 설정 | 실시간 패킷 검사기) -->
        <div class="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick="setAiModuleConfigTab('specs');"
              class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'bg-white text-[#0565F0] shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }"
            >
              <span>📄</span>
              <span>I/O 명세서 (API Contracts)</span>
            </button>
            <button
              type="button"
              onclick="setAiModuleConfigTab('config');"
              class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-white text-[#0565F0] shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }"
            >
              <span>⚙️</span>
              <span>연동 설정 & 모드 전환</span>
            </button>
            <button
              type="button"
              onclick="setAiModuleConfigTab('packets');"
              class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'packets'
                  ? 'bg-white text-[#0565F0] shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }"
            >
              <span>📡</span>
              <span>실시간 I/O 패킷 검사기</span>
              <span class="text-[10px] bg-blue-100 text-[#0565F0] font-black px-1.5 py-0.2 rounded-full">${logs.length}</span>
            </button>
          </div>

          <div class="hidden sm:flex items-center gap-2 text-xs">
            <span class="text-slate-500 font-bold">서버 상태:</span>
            <span class="font-black ${cfg.mode === 'MOCK' ? 'text-amber-600' : (cfg.status === 'connected' ? 'text-emerald-600' : 'text-rose-600')}">
              ${cfg.mode === 'MOCK' ? '● MOCK 로컬 에뮬레이션' : (cfg.status === 'connected' ? '● API 연결됨' : '● 연결 대기 / 오류')}
            </span>
          </div>
        </div>

        <!-- 모달 본문 영역 (스크롤) -->
        <div class="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50 text-slate-800 text-xs sm:text-sm">
          
          <!-- TAB 1: I/O 명세서 -->
          ${activeTab === 'specs' ? `
            <div class="space-y-5">
              <!-- 안내 배너 -->
              <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-black text-blue-900 flex items-center gap-1.5">
                    <span>💡</span> <span>상대방 개발자 연동 가이드</span>
                  </span>
                  <button
                    type="button"
                    onclick="copyAllSpecDocToClipboard('${selectedEp}');"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>📋</span>
                    <span>선택된 API 전체 명세 복사</span>
                  </button>
                </div>
                <p class="text-slate-700 leading-relaxed font-medium">
                  핵심 AI 분석 모듈 제작자는 아래 3개 엔드포인트의 <strong>Request 및 Response JSON 규격</strong>에 맞춰서 API 서버를 구현하면 됩니다.
                  프론트엔드는 현재 <strong>MOCK 모드</strong>로 전체 워크플로우를 완성해두었으며, 제작 완료 후 [연동 설정] 탭에서 URL을 입력하고 모드를 [API]로 바꾸면 즉시 실서버와 연동됩니다.
                </p>
              </div>

              <!-- 3대 엔드포인트 선택 버튼군 -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                ${Object.entries(AI_SPECS_DATA).map(([epKey, epData]) => `
                  <button
                    type="button"
                    onclick="setAiModuleSpecEndpoint('${epKey}');"
                    class="p-3.5 rounded-2xl border-2 text-left transition-all ${
                      selectedEp === epKey
                        ? 'bg-white border-[#0565F0] shadow-md ring-2 ring-blue-100'
                        : 'bg-white/60 hover:bg-white border-slate-200 text-slate-600'
                    }"
                  >
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                        selectedEp === epKey ? 'bg-blue-100 text-[#0565F0]' : 'bg-slate-100 text-slate-500'
                      }">${epData.method}</span>
                      <span class="text-[10px] font-bold text-slate-400">${epData.badge}</span>
                    </div>
                    <div class="font-black text-xs sm:text-sm text-slate-900 truncate">${epData.title}</div>
                    <div class="font-mono text-[11px] text-slate-500 truncate mt-0.5">${epData.endpoint}</div>
                  </button>
                `).join('')}
              </div>

              <!-- 현재 선택된 엔드포인트 상세 정보 카드 -->
              <div class="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
                <div class="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded">${currentSpec.method}</span>
                      <h4 class="font-black text-slate-900 text-base sm:text-lg">${currentSpec.title}</h4>
                    </div>
                    <span class="font-mono text-xs font-bold text-blue-700 block mt-1">${currentSpec.endpoint}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      onclick="copySpecSchemaToClipboard('${selectedEp}', 'request');"
                      class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1"
                    >
                      <span>📋 Request JSON 복사</span>
                    </button>
                    <button
                      type="button"
                      onclick="copySpecSchemaToClipboard('${selectedEp}', 'response');"
                      class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0565F0] font-black text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1"
                    >
                      <span>📋 Response JSON 복사</span>
                    </button>
                  </div>
                </div>

                <!-- 호출 타이밍 및 다음 단계 연동 흐름 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
                    <span class="font-black text-slate-800 block">⏱️ 프론트엔드 호출 시점:</span>
                    <p class="text-slate-600 font-medium leading-relaxed">${currentSpec.timing}</p>
                  </div>
                  <div class="bg-[#EEF5FF] border border-[#B8D7FF] p-3.5 rounded-2xl space-y-1">
                    <span class="font-black text-[#0565F0] block">🔄 결과 수신 후 이어지는 로직:</span>
                    <p class="text-slate-700 font-medium leading-relaxed">${currentSpec.flowDesc}</p>
                  </div>
                </div>

                <!-- 요청 파라미터 테이블 -->
                <div>
                  <h5 class="font-black text-slate-900 text-xs mb-2">📌 Request Parameters (요청 파라미터 규격)</h5>
                  <div class="border border-slate-200 rounded-2xl overflow-hidden">
                    <table class="w-full text-xs text-left">
                      <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th class="px-4 py-2.5">필드명 (Field)</th>
                          <th class="px-3 py-2.5">타입</th>
                          <th class="px-3 py-2.5">필수</th>
                          <th class="px-4 py-2.5">설명 및 비고</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                        ${currentSpec.params.map(p => `
                          <tr class="hover:bg-slate-50">
                            <td class="px-4 py-2.5 font-mono font-bold text-blue-900">${p.name}</td>
                            <td class="px-3 py-2.5 font-mono text-slate-500">${p.type}</td>
                            <td class="px-3 py-2.5">
                              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.required === '필수' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                              }">${p.required}</span>
                            </td>
                            <td class="px-4 py-2.5">${p.desc}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 2단 JSON 코드 뷰어 (좌: Request, 우: Response) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Request Box -->
                  <div class="border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-slate-100 flex flex-col">
                    <div class="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center text-xs">
                      <span class="font-mono font-black text-cyan-300">Request Body Payload</span>
                      <button type="button" onclick="copySpecSchemaToClipboard('${selectedEp}', 'request');" class="text-slate-400 hover:text-white font-bold text-[11px]">복사</button>
                    </div>
                    <pre class="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto flex-1 max-h-[320px] text-emerald-300">${JSON.stringify(currentSpec.sampleRequest, null, 2)}</pre>
                  </div>

                  <!-- Response Box -->
                  <div class="border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-slate-100 flex flex-col">
                    <div class="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center text-xs">
                      <span class="font-mono font-black text-blue-300">Response Data Schema (필수 반환)</span>
                      <button type="button" onclick="copySpecSchemaToClipboard('${selectedEp}', 'response');" class="text-slate-400 hover:text-white font-bold text-[11px]">복사</button>
                    </div>
                    <pre class="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto flex-1 max-h-[320px] text-cyan-300">${JSON.stringify(currentSpec.sampleResponse, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB 2: 연동 설정 & 모드 전환 -->
          ${activeTab === 'config' ? `
            <div class="space-y-5 max-w-3xl mx-auto">
              <!-- 모드 선택 라디오 카드 -->
              <div class="bg-white border-2 border-slate-300 rounded-3xl p-6 space-y-4 shadow-sm">
                <h4 class="font-black text-slate-900 text-base">🔧 AI 엔진 동작 모드 선택</h4>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- MOCK 모드 카드 -->
                  <div
                    onclick="setAiModuleMode('MOCK');"
                    class="p-5 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                      cfg.mode === 'MOCK'
                        ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">🧪</span>
                        <span class="font-black text-sm text-slate-900">MOCK 모의 응답 모드</span>
                      </div>
                      <input type="radio" name="aiModeRadio" ${cfg.mode === 'MOCK' ? 'checked' : ''} class="w-4 h-4 accent-amber-600" />
                    </div>
                    <span class="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full inline-block mb-1">
                      상대방 모듈 제작 중 권장 (현재 기본값)
                    </span>
                    <p class="text-xs text-slate-600 leading-relaxed font-medium">
                      외부 AI 서버 없이도 18.4만 건 빅데이터 파레토 분석, What-If 시뮬레이션, 품의서 AI 수정을 규격에 맞춰 로컬에서 완벽 시뮬레이션합니다.
                    </p>
                  </div>

                  <!-- API 실서버 모드 카드 -->
                  <div
                    onclick="setAiModuleMode('API');"
                    class="p-5 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                      cfg.mode === 'API'
                        ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">🌐</span>
                        <span class="font-black text-sm text-slate-900">API 실서버 연동 모드</span>
                      </div>
                      <input type="radio" name="aiModeRadio" ${cfg.mode === 'API' ? 'checked' : ''} class="w-4 h-4 accent-blue-600" />
                    </div>
                    <span class="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block mb-1">
                      상대방 모듈 완성 시 전환
                    </span>
                    <p class="text-xs text-slate-600 leading-relaxed font-medium">
                      상대방 개발자가 띄운 로컬 서버(<code class="font-bold text-blue-800">http://localhost:8000</code>) 또는 배포 서버로 실제 HTTP POST 통신을 수행합니다.
                    </p>
                  </div>
                </div>
              </div>

              <!-- 서버 접속 파라미터 설정 폼 -->
              <form
                onsubmit="
                  event.preventDefault();
                  saveAiModuleConfig(
                    document.getElementById('ai-cfg-url').value,
                    document.getElementById('ai-cfg-key').value,
                    document.getElementById('ai-cfg-timeout').value,
                    document.getElementById('ai-cfg-fallback').checked
                  );
                "
                class="bg-white border-2 border-slate-300 rounded-3xl p-6 space-y-4 shadow-sm"
              >
                <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 class="font-black text-slate-900 text-base">🌐 엔드포인트 및 통신 파라미터</h4>
                  <button
                    type="button"
                    onclick="AiAgentClient.pingHealthCheck();"
                    class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>📡</span>
                    <span>서버 핑(Ping) 테스트</span>
                  </button>
                </div>

                <div class="space-y-3 text-xs">
                  <div>
                    <label class="block font-black text-slate-800 mb-1">AI 모듈 Base URL</label>
                    <input
                      id="ai-cfg-url"
                      type="text"
                      value="${cfg.baseUrl || 'http://localhost:8000/api/v1'}"
                      placeholder="예: http://localhost:8000/api/v1"
                      class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                    <span class="text-[11px] text-slate-500 font-medium block mt-1">상대방 개발자의 FastApi, Flask 또는 Spring Boot AI 모듈 주소</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-black text-slate-800 mb-1">인증 API Key / Bearer 토큰 (선택)</label>
                      <input
                        id="ai-cfg-key"
                        type="password"
                        value="${cfg.apiKey || ''}"
                        placeholder="없으면 비워둠"
                        class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label class="block font-black text-slate-800 mb-1">요청 타임아웃 (ms)</label>
                      <input
                        id="ai-cfg-timeout"
                        type="number"
                        value="${cfg.timeoutMs || 8000}"
                        step="1000"
                        min="1000"
                        class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <!-- 자동 폴백 옵션 -->
                  <div class="pt-2">
                    <label class="flex items-start gap-2.5 cursor-pointer select-none bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <input
                        id="ai-cfg-fallback"
                        type="checkbox"
                        ${cfg.autoFallbackToMock ? 'checked' : ''}
                        class="w-4 h-4 mt-0.5 accent-blue-600 rounded"
                      />
                      <div>
                        <span class="font-black text-slate-900 block">서버 미응답 시 Mock 데이터로 자동 폴백 (Auto Fallback)</span>
                        <span class="text-[11px] text-slate-500 font-medium">상대방 서버가 미구동이거나 네트워크 에러 시 오류 팝업 대신 Mock 데이터로 안전하게 처리하여 사용자 작업 흐름을 보호합니다.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                  <button
                    type="submit"
                    class="px-6 py-2.5 bg-[#0565F0] hover:bg-[#0452C7] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all border border-[#3A8BFD] active:scale-95"
                  >
                    설정 저장
                  </button>
                </div>
              </form>
            </div>
          ` : ''}

          <!-- TAB 3: 실시간 I/O 패킷 검사기 -->
          ${activeTab === 'packets' ? `
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-black text-slate-900 text-base">📡 실시간 I/O 패킷 모니터링 로그</h4>
                  <p class="text-xs text-slate-500 mt-0.5">JDBP 플랫폼과 AI 핵심 모듈 간에 송수신된 실제 요청(Request) 및 응답(Response) 패킷 내역입니다.</p>
                </div>
                <button
                  type="button"
                  onclick="clearAiPacketLogs();"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
                >
                  로그 비우기
                </button>
              </div>

              ${logs.length === 0 ? `
                <div class="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center space-y-2">
                  <div class="text-3xl">📭</div>
                  <span class="text-sm font-black text-slate-700 block">송수신된 패킷 로그가 없습니다.</span>
                  <span class="text-xs text-slate-500 block">1단계 업무요건 접수, 2단계 What-If 시뮬레이션, 3단계 품의서 AI 수정을 실행하면 이곳에 패킷이 기록됩니다.</span>
                </div>
              ` : `
                <div class="space-y-3">
                  ${logs.map(log => `
                    <div class="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xs text-xs space-y-2.5 p-4">
                      <!-- 패킷 요약 헤더 바 -->
                      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-mono font-black text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded">${log.method}</span>
                          <span class="font-mono font-black text-blue-900 text-xs sm:text-sm">${log.endpoint}</span>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${
                            log.mode === 'MOCK' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            log.mode === 'API' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            'bg-purple-100 text-purple-800 border border-purple-300'
                          }">${log.mode}</span>
                          <span class="font-mono text-[11px] font-bold ${
                            log.status >= 200 && log.status < 300 ? 'text-emerald-600' : 'text-rose-600'
                          }">HTTP ${log.status}</span>
                        </div>
                        <div class="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                          <span>⏱️ ${log.latencyMs}ms</span>
                          <span>${log.timestamp}</span>
                        </div>
                      </div>

                      ${log.errorMsg ? `
                        <div class="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl font-medium text-xs">
                          ⚠️ ${log.errorMsg}
                        </div>
                      ` : ''}

                      <!-- 패킷 상세 내용 (Request & Response) -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <!-- Request View -->
                        <div class="bg-slate-900 rounded-xl p-3 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48">
                          <div class="text-[10px] font-bold text-slate-400 mb-1 flex justify-between">
                            <span>Request Payload:</span>
                            <button type="button" onclick="copyTextToClipboard(JSON.stringify(${JSON.stringify(log.requestPayload)}, null, 2));" class="text-slate-400 hover:text-white">복사</button>
                          </div>
                          <pre class="text-emerald-300">${JSON.stringify(log.requestPayload, null, 2)}</pre>
                        </div>

                        <!-- Response View -->
                        <div class="bg-slate-900 rounded-xl p-3 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48">
                          <div class="text-[10px] font-bold text-slate-400 mb-1 flex justify-between">
                            <span>Response Payload:</span>
                            <button type="button" onclick="copyTextToClipboard(JSON.stringify(${JSON.stringify(log.responsePayload)}, null, 2));" class="text-slate-400 hover:text-white">복사</button>
                          </div>
                          <pre class="text-cyan-300">${JSON.stringify(log.responsePayload, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          ` : ''}

        </div>

        <!-- 모달 푸터 -->
        <div class="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span class="text-xs text-slate-500 font-medium">
            JDBP Core I/O Spec Version: <strong>v2.4-Standard-Contract</strong>
          </span>
          <button
            type="button"
            onclick="closeAiModuleConfigModal();"
            class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  `;
}

// Variable Modal
function renderVariableModal(v) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white border-2 border-slate-400 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-900">
        <div class="bg-slate-100 px-6 py-4 border-b-2 border-slate-200 flex justify-between items-center">
          <div>
            <span class="text-xs font-mono text-blue-700 font-bold">${v.id}</span>
            <h3 class="font-black text-slate-900 text-lg">${v.nameKo} 구간별 위험도 분석</h3>
          </div>
          <button type="button" onclick="state.selectedVariableModal=null; renderApp();" class="text-slate-500 hover:text-slate-900 text-xl font-bold">✕</button>
        </div>

        <div class="p-6 space-y-4 text-sm">
          <div class="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-1">
            <span class="text-xs font-black text-blue-900 block">산출 로직:</span>
            <p class="text-slate-800 font-bold">${v.easyExplain}</p>
            <code class="text-xs text-blue-800 font-mono block mt-1">${v.calcLogic}</code>
          </div>

          <div>
            <h4 class="font-black text-slate-900 mb-2">구간별 고객수 및 실제 연체율 분포</h4>
            <div class="border-2 border-slate-200 rounded-xl overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-2.5 text-left">구간 (범위)</th>
                    <th class="px-4 py-2.5 text-right">해당 건수 (건)</th>
                    <th class="px-4 py-2.5 text-right">구간 연체율 (%)</th>
                    <th class="px-4 py-2.5 text-center">위험도 판정</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 font-medium">
                  ${v.bins.map(b => `
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3 font-mono font-bold text-slate-900">${b.bin}</td>
                      <td class="px-4 py-3 text-right font-mono text-slate-700">${b.count.toLocaleString()}건</td>
                      <td class="px-4 py-3 text-right font-mono text-rose-600 font-black">${b.delinquencyRate.toFixed(2)}%</td>
                      <td class="px-4 py-3 text-center font-bold text-xs">
                        <span class="px-2 py-0.5 rounded-full ${
                          b.riskLevel.includes('안전') || b.riskLevel.includes('우량') ? 'bg-emerald-100 text-emerald-800' :
                          b.riskLevel.includes('보통') || b.riskLevel.includes('정상') ? 'bg-blue-100 text-blue-800' :
                          'bg-rose-100 text-rose-800 font-black'
                        }">${b.riskLevel}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="button" onclick="state.selectedVariableModal=null; renderApp();" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm shadow">
              확인 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Initial mounting
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    renderApp();
  });

  // Close account dropdown & status dropdown when clicking outside
  window.addEventListener('click', (e) => {
    let shouldRender = false;
    if (state.isAccountMenuOpen) {
      const card = document.getElementById('account-card');
      const menu = document.getElementById('account-dropdown-menu');
      if (!card?.contains(e.target) && !menu?.contains(e.target)) {
        state.isAccountMenuOpen = false;
        shouldRender = true;
      }
    }
    if (state.searchFilter?.isStatusDropdownOpen) {
      const btn = document.getElementById('status-combobox-btn');
      const menu = document.getElementById('status-combobox-dropdown');
      if (!btn?.contains(e.target) && !menu?.contains(e.target)) {
        state.searchFilter.isStatusDropdownOpen = false;
        shouldRender = true;
      }
    }
    if (shouldRender) {
      renderApp();
    }
  });
}
