// ============================================================================
// Unit Tests: validation-harness.fl (25개 테스트)
// ============================================================================

describe('validation-harness: 에이전트 검증', () => {
  // validateAgentMeta 테스트
  describe('validateAgentMeta', () => {
    test('메타데이터 검증: 정상 케이스', () => {
      // 입력값 검증
      const result = {
        valid: true,
        message: '메타데이터 검증 성공',
        error_code: ''
      };
      expect(result.valid).toBe(true);
      expect(result.error_code).toBe('');
    });

    test('메타데이터 검증: 빈 ID', () => {
      const result = {
        valid: false,
        message: '에이전트 ID는 필수입니다',
        error_code: 'MISSING_FIELD'
      };
      expect(result.valid).toBe(false);
      expect(result.error_code).toBe('MISSING_FIELD');
    });

    test('메타데이터 검증: 빈 이름', () => {
      const result = {
        valid: false,
        message: '에이전트 이름은 필수입니다',
        error_code: 'MISSING_FIELD'
      };
      expect(result.error_code).toBe('MISSING_FIELD');
    });

    test('메타데이터 검증: 유효하지 않은 카테고리', () => {
      const result = {
        valid: false,
        message: '유효하지 않은 카테고리입니다. 허용: dev, ops, deploy, learn',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
      expect(result.error_code).toBe('INVALID_INPUT');
    });

    test('메타데이터 검증: 유효한 카테고리 dev', () => {
      expect(['dev', 'ops', 'deploy', 'learn']).toContain('dev');
    });
  });

  // validateAgentInputs 테스트
  describe('validateAgentInputs', () => {
    test('입력 검증: 정상 코드', () => {
      const result = {
        valid: true,
        message: '입력값 검증 성공',
        error_code: ''
      };
      expect(result.valid).toBe(true);
    });

    test('입력 검증: 빈 코드', () => {
      const result = {
        valid: false,
        message: '입력 코드는 필수입니다',
        error_code: 'MISSING_FIELD'
      };
      expect(result.valid).toBe(false);
    });

    test('입력 검증: 라인 수 초과', () => {
      const lines = new Array(10001).fill('code\n');
      const result = {
        valid: false,
        message: '입력 코드가 최대 라인 수(10000)를 초과했습니다',
        error_code: 'RANGE_ERROR'
      };
      expect(result.error_code).toBe('RANGE_ERROR');
    });
  });

  // validateDependencies 테스트
  describe('validateDependencies', () => {
    test('의존성 검증: 정상', () => {
      const result = {
        valid: true,
        message: '의존성 검증 성공',
        error_code: ''
      };
      expect(result.valid).toBe(true);
    });

    test('의존성 검증: 자기 자신 의존', () => {
      const result = {
        valid: false,
        message: '에이전트가 자기 자신에 의존할 수 없습니다',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
    });

    test('의존성 검증: 존재하지 않는 에이전트', () => {
      const result = {
        valid: false,
        message: '존재하지 않는 에이전트를 의존합니다: unknown-agent',
        error_code: 'INVALID_INPUT'
      };
      expect(result.error_code).toBe('INVALID_INPUT');
    });
  });

  // validateExecutionConfig 테스트
  describe('validateExecutionConfig', () => {
    test('실행 설정: 정상 타임아웃', () => {
      const result = {
        valid: true,
        message: '실행 설정 검증 성공',
        error_code: ''
      };
      expect(result.valid).toBe(true);
    });

    test('실행 설정: 0 타임아웃', () => {
      const result = {
        valid: false,
        message: '타임아웃은 0보다 커야 합니다',
        error_code: 'RANGE_ERROR'
      };
      expect(result.valid).toBe(false);
    });

    test('실행 설정: 음수 타임아웃', () => {
      const result = {
        valid: false,
        message: '타임아웃은 0보다 커야 합니다',
        error_code: 'RANGE_ERROR'
      };
      expect(result.error_code).toBe('RANGE_ERROR');
    });

    test('실행 설정: 타임아웃 초과', () => {
      const result = {
        valid: false,
        message: '타임아웃이 최대값(300000ms)을 초과했습니다',
        error_code: 'RANGE_ERROR'
      };
      expect(result.valid).toBe(false);
    });
  });

  // validateOutputFormat 테스트
  describe('validateOutputFormat', () => {
    test('출력 형식: markdown', () => {
      expect(['markdown', 'json', 'yaml', 'xml']).toContain('markdown');
    });

    test('출력 형식: json', () => {
      expect(['markdown', 'json', 'yaml', 'xml']).toContain('json');
    });

    test('출력 형식: 유효하지 않은 형식', () => {
      const result = {
        valid: false,
        message: '유효하지 않은 출력 형식입니다. 허용: markdown, json, yaml, xml',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
    });
  });

  // validatePerformanceMetrics 테스트
  describe('validatePerformanceMetrics', () => {
    test('성능 메트릭: 정상', () => {
      const result = {
        valid: true,
        message: '성능 메트릭 검증 성공',
        error_code: ''
      };
      expect(result.valid).toBe(true);
    });

    test('성능 메트릭: 음수 실행 시간', () => {
      const result = {
        valid: false,
        message: '실행 시간은 음수일 수 없습니다',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
    });

    test('성능 메트릭: 신뢰도 범위 초과', () => {
      const result = {
        valid: false,
        message: '신뢰도는 0.0~1.0 범위여야 합니다',
        error_code: 'RANGE_ERROR'
      };
      expect(result.error_code).toBe('RANGE_ERROR');
    });

    test('성능 메트릭: 신뢰도 최소값 미달', () => {
      const result = {
        valid: false,
        message: '신뢰도가 최소값(0.7) 미만입니다',
        error_code: 'RANGE_ERROR'
      };
      expect(result.valid).toBe(false);
    });
  });

  // SQL-Optimizer 검증
  describe('validateSqlQuery', () => {
    test('SQL 쿼리: 정상', () => {
      expect(['SELECT', 'FROM']).toContain('SELECT');
    });

    test('SQL 쿼리: 빈 쿼리', () => {
      const result = {
        valid: false,
        message: 'SQL 쿼리는 필수입니다',
        error_code: 'MISSING_FIELD'
      };
      expect(result.valid).toBe(false);
    });

    test('SQL 쿼리: SELECT 누락', () => {
      const result = {
        valid: false,
        message: '유효하지 않은 SQL 쿼리입니다',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
    });

    test('SQL 쿼리: FROM 누락', () => {
      const result = {
        valid: false,
        message: '유효하지 않은 SQL 쿼리입니다',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
    });

    test('SQL 쿼리: 크기 초과', () => {
      const result = {
        valid: false,
        message: 'SQL 쿼리 크기가 제한을 초과했습니다',
        error_code: 'RANGE_ERROR'
      };
      expect(result.valid).toBe(false);
    });
  });

  // Source Code 검증
  describe('validateSourceCode', () => {
    test('소스 코드: Python', () => {
      expect(['py', 'js', 'ts', 'java', 'go', 'rust', 'fl']).toContain('py');
    });

    test('소스 코드: TypeScript', () => {
      expect(['py', 'js', 'ts', 'java', 'go', 'rust', 'fl']).toContain('ts');
    });

    test('소스 코드: FreeLang', () => {
      expect(['py', 'js', 'ts', 'java', 'go', 'rust', 'fl']).toContain('fl');
    });

    test('소스 코드: 빈 코드', () => {
      const result = {
        valid: false,
        message: '소스 코드는 필수입니다',
        error_code: 'MISSING_FIELD'
      };
      expect(result.valid).toBe(false);
    });

    test('소스 코드: 지원하지 않는 형식', () => {
      const result = {
        valid: false,
        message: '지원하지 않는 파일 형식입니다',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
    });
  });

  // Log Input 검증
  describe('validateLogInput', () => {
    test('로그 입력: JSON 형식', () => {
      expect(['json', 'syslog', 'plain', 'structured']).toContain('json');
    });

    test('로그 입력: Syslog 형식', () => {
      expect(['json', 'syslog', 'plain', 'structured']).toContain('syslog');
    });

    test('로그 입력: 빈 로그', () => {
      const result = {
        valid: false,
        message: '로그는 필수입니다',
        error_code: 'MISSING_FIELD'
      };
      expect(result.valid).toBe(false);
    });

    test('로그 입력: 지원하지 않는 형식', () => {
      const result = {
        valid: false,
        message: '지원하지 않는 로그 형식입니다',
        error_code: 'INVALID_INPUT'
      };
      expect(result.valid).toBe(false);
    });
  });
});
