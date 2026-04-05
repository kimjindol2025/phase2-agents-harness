// ============================================================================
// Error Handling Harness - TypeScript 버전
// ============================================================================

import { AgentError, ErrorRecoveryInfo, ExecutionResult } from '../types';

type AgentErrorCode =
  | 'VALIDATION_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'EXECUTION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CIRCULAR_DEPENDENCY'
  | 'UNKNOWN_AGENT'
  | 'RESOURCE_ERROR'
  | 'PERMISSION_ERROR'
  | 'NETWORK_ERROR'
  | 'PARSING_ERROR'
  | 'COMPUTATION_ERROR'
  | 'STATE_ERROR'
  | 'INTERNAL_ERROR';

class ErrorHandlingHarness {
  /**
   * 에러 생성
   */
  static createAgentError(
    code: AgentErrorCode,
    message: string,
    agentId: string
  ): AgentError {
    return {
      code,
      message,
      agent_id: agentId,
      timestamp: new Date().toISOString(),
      context: '',
      stacktrace: '',
      recovery_suggestion: this.getSuggestion(code),
    };
  }

  /**
   * 에러 타입별 복구 제안
   */
  private static getSuggestion(code: AgentErrorCode): string {
    const suggestions: Record<AgentErrorCode, string> = {
      VALIDATION_ERROR: '입력 값을 확인하고 다시 시도하세요',
      DEPENDENCY_ERROR: '의존성 에이전트 상태를 확인하세요',
      EXECUTION_ERROR: '에이전트 설정을 확인하고 재실행하세요',
      TIMEOUT_ERROR: '타임아웃 값을 증가시키고 재시도하세요',
      CIRCULAR_DEPENDENCY: '에이전트 의존성 구조를 검토하세요',
      UNKNOWN_AGENT: '등록된 에이전트 목록을 확인하세요',
      RESOURCE_ERROR: '리소스 가용성을 확인하세요',
      PERMISSION_ERROR: '필요한 권한을 확인하세요',
      NETWORK_ERROR: '네트워크 연결을 확인하세요',
      PARSING_ERROR: '입력 형식을 검증하세요',
      COMPUTATION_ERROR: '계산 로직을 검토하세요',
      STATE_ERROR: '시스템 상태를 확인하세요',
      INTERNAL_ERROR: '관리자에게 보고하세요',
    };
    return suggestions[code];
  }

  /**
   * 복구 가능 여부 확인
   */
  static canRecover(errorCode: AgentErrorCode): ErrorRecoveryInfo {
    const retryableErrors = [
      'TIMEOUT_ERROR',
      'NETWORK_ERROR',
      'RESOURCE_ERROR',
    ];
    const fallbackErrors = ['DEPENDENCY_ERROR', 'EXECUTION_ERROR'];

    if (retryableErrors.includes(errorCode)) {
      return {
        can_retry: true,
        retry_delay_ms: 1000,
        recovery_action: 'retry',
        fallback_agent: '',
      };
    }

    if (fallbackErrors.includes(errorCode)) {
      return {
        can_retry: false,
        retry_delay_ms: 0,
        recovery_action: 'fallback',
        fallback_agent: `backup-${errorCode.toLowerCase()}`,
      };
    }

    return {
      can_retry: false,
      retry_delay_ms: 0,
      recovery_action: 'fail',
      fallback_agent: '',
    };
  }

  /**
   * 에러 로깅
   */
  static logError(error: AgentError): void {
    console.error(
      `[${error.timestamp}] ${error.agent_id}: ${error.code} - ${error.message}`
    );
    if (error.context) {
      console.error(`Context: ${error.context}`);
    }
    if (error.recovery_suggestion) {
      console.error(`Suggestion: ${error.recovery_suggestion}`);
    }
  }

  /**
   * 에러 처리
   */
  static handleError(
    error: AgentError,
    fallbackAgent?: string
  ): ExecutionResult {
    const recovery = this.canRecover(error.code as AgentErrorCode);

    return {
      agent_id: error.agent_id,
      status: 'failure',
      error,
      metadata: {
        execution_time_ms: 0,
        memory_used_mb: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 재시도 로직
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000,
    backoffMultiplier: number = 2
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = initialDelayMs;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= backoffMultiplier;
        }
      }
    }

    throw lastError || new Error('Maximum retries exceeded');
  }

  /**
   * 에러 통계
   */
  static createErrorStats(errors: AgentError[]) {
    const stats = {
      total: errors.length,
      by_code: {} as Record<string, number>,
      by_agent: {} as Record<string, number>,
    };

    for (const error of errors) {
      stats.by_code[error.code] = (stats.by_code[error.code] || 0) + 1;
      stats.by_agent[error.agent_id] =
        (stats.by_agent[error.agent_id] || 0) + 1;
    }

    return stats;
  }
}

export default ErrorHandlingHarness;
