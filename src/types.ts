// ============================================================================
// Types - AI 에이전트 하네스 타입 정의
// ============================================================================

/**
 * 에이전트 메타데이터
 */
export interface AgentMetadata {
  id: string;
  name: string;
  category: 'dev' | 'ops' | 'deploy' | 'learn';
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
}

/**
 * 에이전트 설정
 */
export interface AgentConfig {
  id: string;
  timeout_ms: number;
  parallel_enabled: boolean;
  output_format: 'markdown' | 'json' | 'yaml' | 'xml';
  retry_policy?: RetryPolicy;
}

/**
 * 재시도 정책
 */
export interface RetryPolicy {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
}

/**
 * 검증 결과
 */
export interface ValidationResult {
  valid: boolean;
  message: string;
  error_code?: string;
  details?: Record<string, unknown>;
}

/**
 * 에러 정보
 */
export interface AgentError {
  code: string;
  message: string;
  agent_id: string;
  timestamp: string;
  context?: string;
  stacktrace?: string;
  recovery_suggestion?: string;
}

/**
 * 복구 정보
 */
export interface ErrorRecoveryInfo {
  can_retry: boolean;
  retry_delay_ms: number;
  recovery_action: 'retry' | 'fallback' | 'fail' | 'escalate';
  fallback_agent?: string;
}

/**
 * 실행 결과
 */
export interface ExecutionResult<T = unknown> {
  agent_id: string;
  status: 'success' | 'failure' | 'timeout' | 'partial';
  result?: T;
  error?: AgentError;
  metadata?: {
    execution_time_ms: number;
    memory_used_mb: number;
    timestamp: string;
  };
}

/**
 * 성능 메트릭
 */
export interface PerformanceMetrics {
  execution_time: number;
  memory_used_mb: number;
  confidence: number;
  throughput: number;
  error_rate: number;
  timestamp: string;
}

/**
 * 에이전트 상태
 */
export type AgentStatus =
  | 'registered'
  | 'running'
  | 'idle'
  | 'error'
  | 'timeout'
  | 'failed';

/**
 * 에이전트 카테고리
 */
export type AgentCategory = 'dev' | 'ops' | 'deploy' | 'learn';

/**
 * 출력 형식
 */
export type OutputFormat = 'markdown' | 'json' | 'yaml' | 'xml';
