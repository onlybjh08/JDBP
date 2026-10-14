import {
  SearchConstraint,
  CandidateStrategy,
  BreakdownRow,
  DiscussionThreadItem,
  ApprovalDraft,
  VariableDefinition,
  AgentLog
} from '../types';

/**
 * Pluggable Mock API Client for "젭대리 (JB대리) Platform"
 * When the peer developer finishes the core analytics/impact calculation backend,
 * this client can be swapped with Axios / Fetch calls to real REST/gRPC endpoints.
 */

// Initial Seed Data
const MOCK_STRATEGIES: CandidateStrategy[] = [
  {
    id: 'strat-1',
    name: '안 1·건전성 중시',
    ruleDescription: 'DTI 28% 초과 OR 최근 6개월 조회 4건 이상 -> 부결',
    delinquencyDiff: -2.2, // -2.2%p
    approvalDiff: -4.8,    // -4.8%p
    profitDiff: 2.8,       // +2.8억원
    targetCount: 16840,
    validations: {
      sampleValid: true,
      ootValid: true,
      maturityValid: true,
      monotonicityValid: true,
    },
    isRecommended: false,
  },
  {
    id: 'strat-2',
    name: '안 2·균형',
    ruleDescription: 'DTI 30% 초과 AND 최근 6개월 조회 3건 이상 -> 부결',
    delinquencyDiff: -1.5, // -1.5%p
    approvalDiff: -3.1,    // -3.1%p
    profitDiff: 4.0,       // +4.0억원
    targetCount: 14820,
    validations: {
      sampleValid: true,
      ootValid: true,
      maturityValid: true,
      monotonicityValid: true,
    },
    isRecommended: true,
  },
  {
    id: 'strat-3',
    name: '안 3·손익 중시',
    ruleDescription: 'DTI 34% 초과 AND 최근 6개월 조회 5건 이상 -> 부결',
    delinquencyDiff: -0.8, // -0.8%p
    approvalDiff: -1.6,    // -1.6%p
    profitDiff: 5.6,       // +5.6억원
    targetCount: 11200,
    validations: {
      sampleValid: true,
      ootValid: false, // 경고
      maturityValid: true,
      monotonicityValid: true,
    },
    isRecommended: false,
  },
];

const MOCK_LOGS: AgentLog[] = [
  {
    id: 'log-1',
    stage: 'PLAN',
    message: '[계획 1] 단조 변수 6개 규칙 스캔 (DTI, 최근 6개월 조회건수, 다중채무수, KCB점수, 한도소진율, 소득구간)...',
    timestamp: '10:14:02',
  },
  {
    id: 'log-2',
    stage: 'SCAN',
    message: '[스캔] PL 신용대출 36개월물 최근 2개년(184,200건) 거래 패턴 및 연체 발생 분포 전수 추출',
    timestamp: '10:14:04',
  },
  {
    id: 'log-3',
    stage: 'DECISION',
    message: '[판단] 최근 6개월 단기 다건 조회 패턴에서 연체 급증 이상 감지, DTI 결합 축으로 탐색 공간 집중 전환',
    timestamp: '10:14:07',
  },
  {
    id: 'log-4',
    stage: 'EVAL',
    message: '[검증] Out-Of-Time(OOT 2025Q4~2026Q1) 12만건 백테스트 및 6개월 경과 성숙도 적합성 검정 완료',
    timestamp: '10:14:09',
  },
  {
    id: 'log-5',
    stage: 'DONE',
    message: '[종료] 승인율 하락 상한(-5.0%p) 및 표본 비중(1.0%) 제약조건 충족 3개 후보 전략안 도출 완료',
    timestamp: '10:14:10',
  },
];

const DEFAULT_BREAKDOWN_ROWS: BreakdownRow[] = [
  {
    groupName: '1~2등급 (우량)',
    count: 142,
    ratio: 0.95,
    delinquencyRate: 0.12,
    profitContribution: 1.45,
    actionVerdict: '제외 검토',
    isInsufficientSample: true, // 표본 1% 미만 (0.95%) -> 회색 처리 + 표본 부족 경고
  },
  {
    groupName: '3등급',
    count: 2180,
    ratio: 14.71,
    delinquencyRate: 0.88,
    profitContribution: 1.92,
    actionVerdict: '유지',
    isInsufficientSample: false,
  },
  {
    groupName: '4등급',
    count: 4320,
    ratio: 29.15,
    delinquencyRate: 1.64,
    profitContribution: 1.84,
    actionVerdict: '유지',
    isInsufficientSample: false,
  },
  {
    groupName: '5등급',
    count: 5120,
    ratio: 34.55,
    delinquencyRate: 2.85,
    profitContribution: 0.24,
    actionVerdict: '부결',
    isInsufficientSample: false,
  },
  {
    groupName: '6등급',
    count: 2340,
    ratio: 15.79,
    delinquencyRate: 4.95,
    profitContribution: -0.85,
    actionVerdict: '부결',
    isInsufficientSample: false,
  },
  {
    groupName: '7등급 이하',
    count: 718,
    ratio: 4.85,
    delinquencyRate: 7.80,
    profitContribution: -0.60,
    actionVerdict: '부결',
    isInsufficientSample: false,
  },
];

const MOCK_DISCUSSIONS: DiscussionThreadItem[] = [
  {
    id: 'disc-1',
    department: '영업추진부',
    userName: '김철수',
    userRole: '팀장',
    timestamp: '2026-10-11 10:25',
    message: '안 2(균형)의 전체 연체 개선 효과는 우수하나, 1~2등급 우량 고객군까지 DTI 30% 일괄 부결 시 타행으로의 우량차주 이탈이 심각합니다. 1~2등급을 예외로 제외했을 때 승인율과 손익 회복치를 시뮬레이션해 주십시오.',
    queryType: 'filter_change',
    appliedChangeSummary: '1~2등급 예외 검토 요청',
  },
  {
    id: 'disc-2',
    department: '젭대리 AI 엔진',
    userName: 'JB대리',
    userRole: 'AI 어시스턴트',
    timestamp: '2026-10-11 10:26',
    message: '1~2등급 제외 시뮬레이션 결과: 대상 모수 142건이 승인군으로 회복되어 승인율 하락폭이 -3.1%p에서 -2.2%p로 0.9%p 완화됩니다. 1~2등급의 기대 연체율은 0.12%로 전체 건전성에 미치는 영향은 0.2%p 미만이며, 이자수익 보전으로 순이익은 +4.8억원으로 0.8억원 추가 개선됩니다.',
    queryType: 'drill_down',
    appliedChangeSummary: '1~2등급 제외 시뮬레이션 적용 완료 (+0.8억원, 승인율 +0.9%p 회복)',
  },
  {
    id: 'disc-3',
    department: '상품개발부',
    userName: '박지영',
    userRole: '수석매니저',
    timestamp: '2026-10-11 10:32',
    message: 'PL 36개월물의 이번 분기 취급 잔액 목표 달성을 위해서는 승인율 -2.5%p 이내 방어가 필수적입니다. AI 엔진이 제시한 "1~2등급 제외 수정안"을 적용하면 수익성과 판매목표 모두 충족되므로 상품개발부는 본 안건에 전적으로 동의합니다.',
    queryType: 'agreement',
    appliedChangeSummary: '상품개발부 최종 조건부 합의',
  },
  {
    id: 'disc-4',
    department: '리스크관리부',
    userName: '이정민',
    userRole: '부장 (주관부서)',
    timestamp: '2026-10-11 10:40',
    message: '통계검증(OOT 백테스트 및 6개월 경과 성숙도) 상에서도 1~2등급 예외 처리 시 통계적 유의성이 유지됩니다. "수정안 B-2(1~2등급 제외)"로 최종 품의서 작성을 진행하겠습니다.',
    queryType: 'agreement',
    appliedChangeSummary: '전 부서 합의 완료 및 결재 상신 준비',
  },
];

const MOCK_VARIABLES: VariableDefinition[] = [
  {
    id: 'VAR_DTI_RATIO',
    nameKo: '총부채원리금상환비율 (DTI)',
    category: '부채비율',
    description: '연간 총소득 대비 모든 금융기관 연간 부채 원리금 상환액 비율',
    calcLogic: '(연간 원리금상환예정액 / 연소득) * 100',
    monotonicityStatus: '단조 증가 (통과)',
    iv: 0.442,
    psi: 0.021,
    sampleAdequacy: '적합 (99.8%)',
    lastUpdated: '2026-10-10',
    bins: [
      { bin: '0% ~ 20%', count: 48500, delinquencyRate: 0.35, woe: -1.2 },
      { bin: '20% ~ 30%', count: 62400, delinquencyRate: 0.82, woe: -0.4 },
      { bin: '30% ~ 40%', count: 41200, delinquencyRate: 2.15, woe: 0.5 },
      { bin: '40% 초과', count: 32100, delinquencyRate: 5.84, woe: 1.4 },
    ],
  },
  {
    id: 'VAR_CB_INQ_6M',
    nameKo: '최근 6개월 신용조회건수',
    category: '신용조회',
    description: 'NICE/KCB 기준 최근 180일간 2금융권 포함 단기 신용조회 발생 횟수',
    calcLogic: 'COUNT(CB_INQUIRY_DATE >= TODAY - 180)',
    monotonicityStatus: '단조 증가 (통과)',
    iv: 0.385,
    psi: 0.015,
    sampleAdequacy: '적합 (99.8%)',
    lastUpdated: '2026-10-10',
    bins: [
      { bin: '0건 ~ 1건', count: 82000, delinquencyRate: 0.42, woe: -1.0 },
      { bin: '2건 ~ 3건', count: 54000, delinquencyRate: 1.45, woe: 0.2 },
      { bin: '4건 ~ 5건', count: 28000, delinquencyRate: 3.80, woe: 1.1 },
      { bin: '6건 이상', count: 20200, delinquencyRate: 8.20, woe: 1.9 },
    ],
  },
  {
    id: 'VAR_MULTI_DEBT_CNT',
    nameKo: '다중채무 금융기관수',
    category: '다중채무',
    description: '현재 잔액이 존재하는 여신 취급 금융기관(은행, 저축은행, 카드사) 총 수',
    calcLogic: 'COUNT_DISTINCT(INSTITUTION_CODE WHERE BALANCE > 0)',
    monotonicityStatus: '단조 증가 (통과)',
    iv: 0.312,
    psi: 0.034,
    sampleAdequacy: '적합 (99.8%)',
    lastUpdated: '2026-10-08',
    bins: [
      { bin: '1개사', count: 65000, delinquencyRate: 0.51, woe: -0.9 },
      { bin: '2개사', count: 58000, delinquencyRate: 1.20, woe: -0.1 },
      { bin: '3개사', count: 39000, delinquencyRate: 3.10, woe: 0.8 },
      { bin: '4개사 이상', count: 22200, delinquencyRate: 6.90, woe: 1.7 },
    ],
  },
  {
    id: 'VAR_CARD_UTIL_RATE',
    nameKo: '신용카드 한도 소진율',
    category: '금융이력',
    description: '보유 신용카드 총 부여한도 대비 최근 3개월 평균 신용판매 잔액 비율',
    calcLogic: '(AVG(BALANCE_3M) / TOTAL_LIMIT) * 100',
    monotonicityStatus: '비단조 (구간보정 완료)',
    iv: 0.286,
    psi: 0.045,
    sampleAdequacy: '양호 (96.5%)',
    lastUpdated: '2026-10-05',
    bins: [
      { bin: '0% ~ 30%', count: 55000, delinquencyRate: 0.65, woe: -0.7 },
      { bin: '30% ~ 60%', count: 71000, delinquencyRate: 0.95, woe: -0.3 },
      { bin: '60% ~ 85%', count: 42000, delinquencyRate: 2.80, woe: 0.7 },
      { bin: '85% 초과', count: 16200, delinquencyRate: 7.10, woe: 1.8 },
    ],
  },
  {
    id: 'VAR_EMP_TENURE_M',
    nameKo: '현 직장 근속개월수',
    category: '소득/재직',
    description: '건강보험공단 또는 국민연금 자격득실확인서 기준 현 사업장 재직 개월수',
    calcLogic: 'MONTHS_BETWEEN(TODAY, JOIN_DATE)',
    monotonicityStatus: '단조 감소 (통과)',
    iv: 0.245,
    psi: 0.019,
    sampleAdequacy: '적합 (99.8%)',
    lastUpdated: '2026-10-09',
    bins: [
      { bin: '12개월 미만', count: 28000, delinquencyRate: 3.40, woe: 0.9 },
      { bin: '12M ~ 36M', count: 62000, delinquencyRate: 1.65, woe: 0.2 },
      { bin: '36M ~ 84M', count: 59000, delinquencyRate: 0.85, woe: -0.4 },
      { bin: '84개월 초과', count: 35200, delinquencyRate: 0.40, woe: -1.1 },
    ],
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockApiClient {
  private currentStrategies: CandidateStrategy[] = [...MOCK_STRATEGIES];
  private currentLogs: AgentLog[] = [...MOCK_LOGS];
  private currentDiscussions: DiscussionThreadItem[] = [...MOCK_DISCUSSIONS];
  private selectedStrategyId: string = 'strat-2';
  private activeFilterMode: string = 'grade'; // 'grade' | 'exclude_grade_1_2' | 'dti_32'
  private approvalDraft: ApprovalDraft = {
    title: '[심사전략 변경 품의] PL 신용대출 36개월물 DTI 및 단기조회 기준 고도화(안)',
    reason: '고금리 장기화에 따른 다중채무 차주의 다건 조회 급증 및 연체 전이 리스크를 사전 차단하고, 우량 차주 이탈을 방지하여 연체율 개선과 당기순이익 극대화를 동시에 달성하고자 함.',
    finalRule: 'DTI 30% 초과 AND 최근 6개월 조회 3건 이상 -> 부결 (단, 심사등급 1~2등급 우량 차주는 제외 검토 및 유지 적용)',
    expectedImpact: {
      approvalDiff: -2.2, // %p
      delinquencyDiff: -1.3, // %p
      profitDiff: 4.8, // +4.8억원
    },
    validationSummary: [
      '표본 대표성 검증: 모수 14,820건 (전체 취급액 대비 8.04% 충족, 최소 기준 1.0% 초과)',
      'OOT(Out-Of-Time) 백테스트: 2025Q4~2026Q1 표본 대상 예측 일치도 AUC 0.841 기록',
      '성숙도(Maturity) 검정: 대출 실행 후 6개월 경과 코호트 연체전이율 단조성 100% 충족',
      '변수 단조성(Monotonicity) 검정: DTI 및 CB조회건수 전 구간 불량률 역전 없는 단조증가 확인',
    ],
    discussionHistory: [
      '영업추진부: 1~2등급 우량차주 일괄 부결 시 이탈 우려 제기 -> AI 시뮬레이션을 통해 1~2등급 제외안 반영 (+0.8억원, 승인율 0.9%p 회복 확인)',
      '상품개발부: PL 36개월물 분기 취급 잔액 및 순이자마진(NIM) 유지 요건 충족 확인 후 최종 조건부 합의 완료',
      '리스크관리부: OOT 및 통계적 유의성 재검증 통과, 전 부서 합의 완료에 따라 원안 상신',
    ],
    status: 'draft',
  };

  /**
   * Screen 1: Strategy Search
   */
  async searchStrategies(constraint: SearchConstraint): Promise<{
    strategies: CandidateStrategy[];
    logs: AgentLog[];
  }> {
    await sleep(600); // Simulate API latency

    let stratMultiplier = 1.0;
    if (constraint.targetMetric === 'profit') stratMultiplier = 1.2;
    if (constraint.targetMetric === 'conversion') stratMultiplier = 0.9;

    const updatedStrategies: CandidateStrategy[] = [
      {
        id: 'strat-1',
        name: '안 1·건전성 중시',
        ruleDescription: 'DTI 28% 초과 OR 최근 6개월 조회 4건 이상 -> 부결',
        delinquencyDiff: Number((-2.2 * stratMultiplier).toFixed(1)),
        approvalDiff: -4.8,
        profitDiff: Number((2.8 * stratMultiplier).toFixed(1)),
        targetCount: 16840,
        validations: {
          sampleValid: true,
          ootValid: true,
          maturityValid: true,
          monotonicityValid: true,
        },
        isRecommended: false,
      },
      {
        id: 'strat-2',
        name: '안 2·균형 (추천)',
        ruleDescription: 'DTI 30% 초과 AND 최근 6개월 조회 3건 이상 -> 부결',
        delinquencyDiff: Number((-1.5 * stratMultiplier).toFixed(1)),
        approvalDiff: -3.1,
        profitDiff: Number((4.0 * stratMultiplier).toFixed(1)),
        targetCount: 14820,
        validations: {
          sampleValid: true,
          ootValid: true,
          maturityValid: true,
          monotonicityValid: true,
        },
        isRecommended: true,
      },
      {
        id: 'strat-3',
        name: '안 3·손익 중시',
        ruleDescription: 'DTI 34% 초과 AND 최근 6개월 조회 5건 이상 -> 부결',
        delinquencyDiff: Number((-0.8 * stratMultiplier).toFixed(1)),
        approvalDiff: -1.6,
        profitDiff: Number((5.6 * stratMultiplier).toFixed(1)),
        targetCount: 11200,
        validations: {
          sampleValid: true,
          ootValid: false,
          maturityValid: true,
          monotonicityValid: true,
        },
        isRecommended: false,
      },
    ];

    this.currentStrategies = updatedStrategies;
    return {
      strategies: updatedStrategies,
      logs: this.currentLogs,
    };
  }

  /**
   * Screen 2: Get Breakdown Table Rows
   */
  async getBreakdown(strategyId: string, filterMode: string = 'grade'): Promise<BreakdownRow[]> {
    await sleep(250);
    this.activeFilterMode = filterMode;

    if (filterMode === 'exclude_grade_1_2') {
      return DEFAULT_BREAKDOWN_ROWS.map((row) => {
        if (row.groupName.includes('1~2등급')) {
          return {
            ...row,
            actionVerdict: '제외 검토' as const,
            profitContribution: 1.65,
            isInsufficientSample: true, // Remains small sample warning
          };
        }
        return row;
      });
    }

    if (filterMode === 'dti_32') {
      return DEFAULT_BREAKDOWN_ROWS.map((row) => {
        if (row.groupName.includes('3등급') || row.groupName.includes('4등급')) {
          return {
            ...row,
            count: Math.round(row.count * 0.88),
            actionVerdict: '유지' as const,
            delinquencyRate: Number((row.delinquencyRate * 1.05).toFixed(2)),
          };
        }
        return row;
      });
    }

    return DEFAULT_BREAKDOWN_ROWS;
  }

  /**
   * Screen 2: Side-by-side Delta comparison
   */
  async getComparisonDelta(filterMode: string) {
    await sleep(200);

    const initial = {
      name: '최초 추천안 (안 2·균형)',
      rule: 'DTI 30% 초과 AND 최근 6개월 조회 3건 이상 -> 부결',
      targetCount: 14820,
      approvalDiff: -3.1,
      delinquencyDiff: -1.5,
      profitDiff: 4.0,
      samplePass: '14,820건 (1.0% 통과)',
    };

    let modified = {
      name: '수정 합의안 (1~2등급 예외 검토)',
      rule: 'DTI 30% 초과 & 6개월 조회 3건 이상 (단, 1~2등급 우량차주 제외)',
      targetCount: 14678,
      approvalDiff: -2.2,
      delinquencyDiff: -1.3,
      profitDiff: 4.8,
      samplePass: '14,678건 (1.0% 통과)',
    };

    if (filterMode === 'dti_32') {
      modified = {
        name: '수정안 (DTI 32% 완화안)',
        rule: 'DTI 32% 초과 AND 최근 6개월 조회 3건 이상 -> 부결',
        targetCount: 13100,
        approvalDiff: -1.9,
        delinquencyDiff: -1.1,
        profitDiff: 4.4,
        samplePass: '13,100건 (1.0% 통과)',
      };
    }

    const delta = {
      countDiff: modified.targetCount - initial.targetCount,
      approvalRecovery: Number((modified.approvalDiff - initial.approvalDiff).toFixed(1)), // +0.9%p
      delinquencyPenalty: Number((modified.delinquencyDiff - initial.delinquencyDiff).toFixed(1)), // +0.2%p
      profitGain: Number((modified.profitDiff - initial.profitDiff).toFixed(1)), // +0.8억원
    };

    return { initial, modified, delta };
  }

  /**
   * Discussion Thread
   */
  async getDiscussionThread(): Promise<DiscussionThreadItem[]> {
    await sleep(150);
    return [...this.currentDiscussions];
  }

  async addDiscussionComment(item: Omit<DiscussionThreadItem, 'id' | 'timestamp'>): Promise<DiscussionThreadItem> {
    await sleep(200);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newItem: DiscussionThreadItem = {
      ...item,
      id: `disc-${Date.now()}`,
      timestamp: `2026-10-11 ${timeStr}`,
    };
    this.currentDiscussions.push(newItem);
    return newItem;
  }

  /**
   * Screen 3: Approval Draft
   */
  async getApprovalDraft(): Promise<ApprovalDraft> {
    await sleep(200);
    return { ...this.approvalDraft };
  }

  async updateApprovalDraft(updated: Partial<ApprovalDraft>): Promise<ApprovalDraft> {
    await sleep(300);
    this.approvalDraft = {
      ...this.approvalDraft,
      ...updated,
    };
    return { ...this.approvalDraft };
  }

  async submitApproval(): Promise<{ success: boolean; docNumber: string; submittedAt: string }> {
    await sleep(500);
    this.approvalDraft.status = 'submitted';
    return {
      success: true,
      docNumber: `JB-RM-2026-1011-${Math.floor(100 + Math.random() * 900)}`,
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * Screen 4: Variable Dictionary
   */
  async getVariables(query?: string, category?: string): Promise<VariableDefinition[]> {
    await sleep(200);
    let list = [...MOCK_VARIABLES];
    if (category && category !== '전체') {
      list = list.filter((v) => v.category === category);
    }
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.nameKo.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      );
    }
    return list;
  }
}

// Pluggable Singleton Instance
export const mockApiClient = new MockApiClient();
export default mockApiClient;
