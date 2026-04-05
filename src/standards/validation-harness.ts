// ============================================================================
// Validation Harness - TypeScript 버전
// ============================================================================

import { ValidationResult, AgentConfig, AgentMetadata } from '../types';

class ValidationHarness {
  /**
   * 에이전트 메타데이터 검증
   */
  static validateAgentMeta(
    id: string,
    name: string,
    category: string
  ): ValidationResult {
    if (!id || id.trim() === '') {
      return {
        valid: false,
        message: '에이전트 ID는 필수입니다',
        error_code: 'MISSING_FIELD',
      };
    }

    if (!name || name.trim() === '') {
      return {
        valid: false,
        message: '에이전트 이름은 필수입니다',
        error_code: 'MISSING_FIELD',
      };
    }

    const validCategories = ['dev', 'ops', 'deploy', 'learn'];
    if (!validCategories.includes(category)) {
      return {
        valid: false,
        message: `유효하지 않은 카테고리입니다. 허용: ${validCategories.join(', ')}`,
        error_code: 'INVALID_INPUT',
      };
    }

    return {
      valid: true,
      message: '메타데이터 검증 성공',
    };
  }

  /**
   * 에이전트 입력값 검증
   */
  static validateAgentInputs(
    inputCode: string,
    maxLines: number = 10000
  ): ValidationResult {
    if (!inputCode || inputCode.trim() === '') {
      return {
        valid: false,
        message: '입력 코드는 필수입니다',
        error_code: 'MISSING_FIELD',
      };
    }

    const lineCount = inputCode.split('\n').length;
    if (lineCount > maxLines) {
      return {
        valid: false,
        message: `입력 코드가 최대 라인 수(${maxLines})를 초과했습니다`,
        error_code: 'RANGE_ERROR',
      };
    }

    return {
      valid: true,
      message: '입력값 검증 성공',
    };
  }

  /**
   * 의존성 검증
   */
  static validateDependencies(
    agentId: string,
    dependencies: string[],
    allAgents: string[]
  ): ValidationResult {
    // 자기 자신 의존 확인
    if (dependencies.includes(agentId)) {
      return {
        valid: false,
        message: '에이전트가 자기 자신에 의존할 수 없습니다',
        error_code: 'INVALID_INPUT',
      };
    }

    // 존재하지 않는 에이전트 확인
    for (const dep of dependencies) {
      if (!allAgents.includes(dep)) {
        return {
          valid: false,
          message: `존재하지 않는 에이전트를 의존합니다: ${dep}`,
          error_code: 'INVALID_INPUT',
        };
      }
    }

    return {
      valid: true,
      message: '의존성 검증 성공',
    };
  }

  /**
   * 실행 설정 검증
   */
  static validateExecutionConfig(
    parallelEnabled: boolean,
    timeoutMs: number
  ): ValidationResult {
    if (timeoutMs <= 0) {
      return {
        valid: false,
        message: '타임아웃은 0보다 커야 합니다',
        error_code: 'RANGE_ERROR',
      };
    }

    const maxTimeout = 300000; // 5분
    if (timeoutMs > maxTimeout) {
      return {
        valid: false,
        message: `타임아웃이 최대값(${maxTimeout}ms)을 초과했습니다`,
        error_code: 'RANGE_ERROR',
      };
    }

    return {
      valid: true,
      message: '실행 설정 검증 성공',
    };
  }

  /**
   * 출력 형식 검증
   */
  static validateOutputFormat(format: string): ValidationResult {
    const validFormats = ['markdown', 'json', 'yaml', 'xml'];

    if (!validFormats.includes(format)) {
      return {
        valid: false,
        message: `유효하지 않은 출력 형식입니다. 허용: ${validFormats.join(', ')}`,
        error_code: 'INVALID_INPUT',
      };
    }

    return {
      valid: true,
      message: '출력 형식 검증 성공',
    };
  }

  /**
   * SQL 쿼리 검증
   */
  static validateSqlQuery(sqlCode: string, maxSize: number = 50000): ValidationResult {
    if (!sqlCode || sqlCode.trim() === '') {
      return {
        valid: false,
        message: 'SQL 쿼리는 필수입니다',
        error_code: 'MISSING_FIELD',
      };
    }

    if (sqlCode.length > maxSize) {
      return {
        valid: false,
        message: 'SQL 쿼리 크기가 제한을 초과했습니다',
        error_code: 'RANGE_ERROR',
      };
    }

    const upperSql = sqlCode.toUpperCase();
    if (!upperSql.includes('SELECT') || !upperSql.includes('FROM')) {
      return {
        valid: false,
        message: '유효하지 않은 SQL 쿼리입니다',
        error_code: 'INVALID_INPUT',
      };
    }

    return {
      valid: true,
      message: 'SQL 쿼리 검증 성공',
    };
  }

  /**
   * 소스 코드 검증
   */
  static validateSourceCode(code: string, fileType: string): ValidationResult {
    if (!code || code.trim() === '') {
      return {
        valid: false,
        message: '소스 코드는 필수입니다',
        error_code: 'MISSING_FIELD',
      };
    }

    const validTypes = ['py', 'js', 'ts', 'java', 'go', 'rust', 'fl'];
    if (!validTypes.includes(fileType)) {
      return {
        valid: false,
        message: '지원하지 않는 파일 형식입니다',
        error_code: 'INVALID_INPUT',
      };
    }

    return {
      valid: true,
      message: '소스 코드 검증 성공',
    };
  }

  /**
   * 로그 입력 검증
   */
  static validateLogInput(logs: string, logFormat: string): ValidationResult {
    if (!logs || logs.trim() === '') {
      return {
        valid: false,
        message: '로그는 필수입니다',
        error_code: 'MISSING_FIELD',
      };
    }

    const validFormats = ['json', 'syslog', 'plain', 'structured'];
    if (!validFormats.includes(logFormat)) {
      return {
        valid: false,
        message: '지원하지 않는 로그 형식입니다',
        error_code: 'INVALID_INPUT',
      };
    }

    return {
      valid: true,
      message: '로그 입력 검증 성공',
    };
  }

  /**
   * 성능 메트릭 검증
   */
  static validatePerformanceMetrics(
    executionTime: number,
    confidence: number
  ): ValidationResult {
    if (executionTime < 0) {
      return {
        valid: false,
        message: '실행 시간은 음수일 수 없습니다',
        error_code: 'INVALID_INPUT',
      };
    }

    if (confidence < 0.0 || confidence > 1.0) {
      return {
        valid: false,
        message: '신뢰도는 0.0~1.0 범위여야 합니다',
        error_code: 'RANGE_ERROR',
      };
    }

    if (confidence < 0.7) {
      return {
        valid: false,
        message: '신뢰도가 최소값(0.7) 미만입니다',
        error_code: 'RANGE_ERROR',
      };
    }

    return {
      valid: true,
      message: '성능 메트릭 검증 성공',
    };
  }
}

export default ValidationHarness;
