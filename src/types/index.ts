export interface SearchConstraint {
  targetMetric: 'delinquency' | 'profit' | 'conversion';
  maxApprovalDrop: number; // e.g., 5.0 (%)
  minSampleSize: number;   // e.g., 1.0 (%)
  targetProduct: string;
}

export interface CandidateStrategy {
  id: string;
  name: string; // e.g., "안 1·건전성 중시", "안 2·균형", "안 3·손익 중시"
  subtitle?: string;
  ruleDescription: string; // e.g., "DTI 30% 초과 AND 최근 6개월 조회 3건 이상 -> 부결"
  delinquencyDiff: number; // -1.5 (%p)
  approvalDiff: number;    // -3.1 (%p)
  profitDiff: number;      // +4.0 (억원)
  targetCount: number;
  validations: {
    sampleValid: boolean;
    ootValid: boolean;
    maturityValid: boolean;
    monotonicityValid?: boolean;
  };
  isRecommended?: boolean;
}

export interface BreakdownRow {
  groupName: string; // e.g., "1~2등급", "3등급"
  count: number;
  ratio: number;
  delinquencyRate: number;
  profitContribution: number;
  actionVerdict: '제외 검토' | '유지' | '부결';
  isInsufficientSample?: boolean; // 표본 부족 플래그 (회색 처리용)
  note?: string;
}

export interface DiscussionThreadItem {
  id: string;
  department: string;
  userName: string;
  userRole: string;
  timestamp: string;
  message: string;
  queryType?: 'filter_change' | 'drill_down' | 'agreement';
  appliedChangeSummary?: string;
}

export interface ApprovalDraft {
  title: string;
  reason: string;
  finalRule: string;
  expectedImpact: {
    approvalDiff: number;
    delinquencyDiff: number;
    profitDiff: number;
  };
  validationSummary: string[];
  discussionHistory: string[];
  status: 'draft' | 'submitted';
}

export interface VariableDefinition {
  id: string;
  nameKo: string;
  category: '부채비율' | '신용조회' | '소득/재직' | '다중채무' | '금융이력';
  easyExplain?: string;
  description: string;
  calcLogic: string;
  monotonicityStatus: string;
  iv: number; // Information Value (>0.3 strong)
  psi: number; // Population Stability Index (<0.1 stable)
  sampleAdequacy: string;
  lastUpdated: string;
  bins: { bin: string; count: number; delinquencyRate: number; woe?: number; riskLevel?: string }[];
}

export interface AgentLog {
  id: string;
  stage: string;
  message: string;
  timestamp: string;
}

/**
 * Task Request (업무 요청 단계 데이터 계약)
 */
export interface TaskRequest {
  id: string;
  title: string;
  requesterDept: string;
  requesterName: string;
  requestDate: string;
  targetProduct: string;
  targetMetric: 'delinquency' | 'profit' | 'conversion';
  urgency: '긴급' | '보통' | '정기';
  backgroundReason: string;
  desiredConstraints: {
    maxApprovalDrop: number;
    minSampleSize: number;
  };
  assignedTo: string;
  status: 'draft' | 'requested' | 'ai_completed' | 'in_discussion' | 'approved';
  aiBriefing?: {
    completedAt: string;
    summary: string;
    recommendedStrategyId: string;
    processedRecords: number;
  };
}

/**
 * Natural Language Agent Interaction (자연어 에이전트 대화)
 */
export interface AgentConversationItem {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
  appliedAction?: {
    actionType: string;
    parameterChanges: Record<string, any>;
    resultDelta: string;
  };
}
