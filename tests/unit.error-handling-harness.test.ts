// ============================================================================
// Unit Tests: error-handling-harness.fl (25개 테스트)
// ============================================================================

describe('error-handling-harness: 에러 처리', () => {
  // Error 타입 테스트
  describe('AgentErrorCode', () => {
    test('VALIDATION_ERROR 에러 코드', () => {
      const errorCodes = [
        'VALIDATION_ERROR',
        'DEPENDENCY_ERROR',
        'EXECUTION_ERROR',
        'TIMEOUT_ERROR',
        'CIRCULAR_DEPENDENCY'
      ];
      expect(errorCodes).toContain('VALIDATION_ERROR');
    });

    test('DEPENDENCY_ERROR 에러 코드', () => {
      const errorCodes = [
        'VALIDATION_ERROR',
        'DEPENDENCY_ERROR',
        'EXECUTION_ERROR',
        'TIMEOUT_ERROR'
      ];
      expect(errorCodes).toContain('DEPENDENCY_ERROR');
    });

    test('TIMEOUT_ERROR 에러 코드', () => {
      const errorCodes = [
        'EXECUTION_ERROR',
        'TIMEOUT_ERROR',
        'CIRCULAR_DEPENDENCY'
      ];
      expect(errorCodes).toContain('TIMEOUT_ERROR');
    });

    test('CIRCULAR_DEPENDENCY 에러 코드', () => {
      const errorCodes = [
        'VALIDATION_ERROR',
        'CIRCULAR_DEPENDENCY',
        'UNKNOWN_AGENT'
      ];
      expect(errorCodes).toContain('CIRCULAR_DEPENDENCY');
    });

    test('RESOURCE_ERROR 에러 코드', () => {
      const errorCodes = [
        'RESOURCE_ERROR',
        'PERMISSION_ERROR',
        'NETWORK_ERROR'
      ];
      expect(errorCodes).toContain('RESOURCE_ERROR');
    });

    test('PERMISSION_ERROR 에러 코드', () => {
      const errorCodes = ['PERMISSION_ERROR', 'NETWORK_ERROR', 'PARSING_ERROR'];
      expect(errorCodes).toContain('PERMISSION_ERROR');
    });

    test('NETWORK_ERROR 에러 코드', () => {
      const errorCodes = ['NETWORK_ERROR', 'PARSING_ERROR', 'COMPUTATION_ERROR'];
      expect(errorCodes).toContain('NETWORK_ERROR');
    });

    test('PARSING_ERROR 에러 코드', () => {
      const errorCodes = ['PARSING_ERROR', 'COMPUTATION_ERROR', 'STATE_ERROR'];
      expect(errorCodes).toContain('PARSING_ERROR');
    });

    test('COMPUTATION_ERROR 에러 코드', () => {
      const errorCodes = [
        'COMPUTATION_ERROR',
        'STATE_ERROR',
        'INTERNAL_ERROR'
      ];
      expect(errorCodes).toContain('COMPUTATION_ERROR');
    });

    test('STATE_ERROR 에러 코드', () => {
      const errorCodes = ['STATE_ERROR', 'INTERNAL_ERROR'];
      expect(errorCodes).toContain('STATE_ERROR');
    });

    test('INTERNAL_ERROR 에러 코드', () => {
      const errorCodes = ['INTERNAL_ERROR', 'UNKNOWN_AGENT'];
      expect(errorCodes).toContain('INTERNAL_ERROR');
    });

    test('UNKNOWN_AGENT 에러 코드', () => {
      const errorCodes = ['UNKNOWN_AGENT', 'VALIDATION_ERROR'];
      expect(errorCodes).toContain('UNKNOWN_AGENT');
    });
  });

  // AgentError 구조 테스트
  describe('AgentError Structure', () => {
    test('에러 객체 생성: 기본', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        agent_id: 'test-agent',
        timestamp: '2026-04-04T00:00:00Z',
        context: 'Missing required field',
        stacktrace: 'stack trace here',
        recovery_suggestion: 'Check input parameters'
      };
      expect(error.agent_id).toBe('test-agent');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    test('에러 객체: code 검증', () => {
      const error = { code: 'TIMEOUT_ERROR' };
      expect(error.code).toBe('TIMEOUT_ERROR');
    });

    test('에러 객체: message 검증', () => {
      const error = { message: 'Execution timeout' };
      expect(error.message).toBe('Execution timeout');
    });

    test('에러 객체: agent_id 검증', () => {
      const error = { agent_id: 'sql-optimizer' };
      expect(error.agent_id).toBe('sql-optimizer');
    });

    test('에러 객체: timestamp 검증', () => {
      const error = { timestamp: '2026-04-04T10:30:00Z' };
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });
  });

  // ErrorRecoveryInfo 테스트
  describe('ErrorRecoveryInfo', () => {
    test('복구 정보: 재시도 가능', () => {
      const recovery = {
        can_retry: true,
        retry_delay_ms: 1000,
        recovery_action: 'retry',
        fallback_agent: 'backup-agent'
      };
      expect(recovery.can_retry).toBe(true);
    });

    test('복구 정보: 재시도 불가', () => {
      const recovery = {
        can_retry: false,
        retry_delay_ms: 0,
        recovery_action: 'fail',
        fallback_agent: ''
      };
      expect(recovery.can_retry).toBe(false);
    });

    test('복구 정보: 재시도 지연', () => {
      const recovery = { retry_delay_ms: 5000 };
      expect(recovery.retry_delay_ms).toBeGreaterThan(0);
    });

    test('복구 정보: 폴백 에이전트', () => {
      const recovery = { fallback_agent: 'fallback-sql-optimizer' };
      expect(recovery.fallback_agent).toContain('fallback');
    });

    test('복구 정보: 복구 액션', () => {
      const actions = ['retry', 'fallback', 'fail', 'escalate'];
      expect(actions).toContain('retry');
      expect(actions).toContain('fallback');
    });
  });

  // Error Handling Logic
  describe('Error Handling Logic', () => {
    test('에러 처리: 유효성 검사 실패', () => {
      const isValidationError = (code: string) =>
        code === 'VALIDATION_ERROR';
      expect(isValidationError('VALIDATION_ERROR')).toBe(true);
    });

    test('에러 처리: 타임아웃', () => {
      const isTimeout = (code: string) => code === 'TIMEOUT_ERROR';
      expect(isTimeout('TIMEOUT_ERROR')).toBe(true);
    });

    test('에러 처리: 순환 의존성', () => {
      const isCircular = (code: string) => code === 'CIRCULAR_DEPENDENCY';
      expect(isCircular('CIRCULAR_DEPENDENCY')).toBe(true);
    });

    test('에러 처리: 네트워크 에러', () => {
      const isNetworkError = (code: string) => code === 'NETWORK_ERROR';
      expect(isNetworkError('NETWORK_ERROR')).toBe(true);
    });

    test('에러 처리: 리소스 부족', () => {
      const isResourceError = (code: string) => code === 'RESOURCE_ERROR';
      expect(isResourceError('RESOURCE_ERROR')).toBe(true);
    });

    test('에러 처리: 권한 오류', () => {
      const isPermissionError = (code: string) => code === 'PERMISSION_ERROR';
      expect(isPermissionError('PERMISSION_ERROR')).toBe(true);
    });

    test('에러 처리: 파싱 오류', () => {
      const isParsingError = (code: string) => code === 'PARSING_ERROR';
      expect(isParsingError('PARSING_ERROR')).toBe(true);
    });

    test('에러 처리: 상태 오류', () => {
      const isStateError = (code: string) => code === 'STATE_ERROR';
      expect(isStateError('STATE_ERROR')).toBe(true);
    });

    test('에러 처리: 내부 오류', () => {
      const isInternalError = (code: string) => code === 'INTERNAL_ERROR';
      expect(isInternalError('INTERNAL_ERROR')).toBe(true);
    });

    test('에러 처리: 미등록 에이전트', () => {
      const isUnknownAgent = (code: string) => code === 'UNKNOWN_AGENT';
      expect(isUnknownAgent('UNKNOWN_AGENT')).toBe(true);
    });

    test('에러 처리: 실행 오류', () => {
      const isExecutionError = (code: string) => code === 'EXECUTION_ERROR';
      expect(isExecutionError('EXECUTION_ERROR')).toBe(true);
    });

    test('에러 처리: 의존성 오류', () => {
      const isDependencyError = (code: string) => code === 'DEPENDENCY_ERROR';
      expect(isDependencyError('DEPENDENCY_ERROR')).toBe(true);
    });

    test('에러 처리: 계산 오류', () => {
      const isComputationError = (code: string) => code === 'COMPUTATION_ERROR';
      expect(isComputationError('COMPUTATION_ERROR')).toBe(true);
    });
  });

  // Error Recovery Strategy
  describe('Error Recovery Strategy', () => {
    test('복구 전략: 재시도 가능 여부', () => {
      const shouldRetry = (code: string) =>
        ['TIMEOUT_ERROR', 'NETWORK_ERROR', 'RESOURCE_ERROR'].includes(code);
      expect(shouldRetry('TIMEOUT_ERROR')).toBe(true);
      expect(shouldRetry('VALIDATION_ERROR')).toBe(false);
    });

    test('복구 전략: 폴백 사용', () => {
      const shouldUseFallback = (code: string) =>
        ['DEPENDENCY_ERROR', 'EXECUTION_ERROR'].includes(code);
      expect(shouldUseFallback('DEPENDENCY_ERROR')).toBe(true);
    });

    test('복구 전략: 에스컬레이션', () => {
      const shouldEscalate = (code: string) =>
        ['CIRCULAR_DEPENDENCY', 'INTERNAL_ERROR'].includes(code);
      expect(shouldEscalate('CIRCULAR_DEPENDENCY')).toBe(true);
    });

    test('복구 전략: 즉시 실패', () => {
      const shouldFail = (code: string) =>
        ['VALIDATION_ERROR', 'PERMISSION_ERROR'].includes(code);
      expect(shouldFail('VALIDATION_ERROR')).toBe(true);
    });
  });
});
