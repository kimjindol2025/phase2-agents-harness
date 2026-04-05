# AI 에이전트 하네스 테스트 계획

**최종 업데이트**: 2026-04-04
**상태**: Phase 2 테스트 체계화

---

## 개요

이 문서는 54개 AI 에이전트 하네스의 자동화 테스트 전략을 정의합니다.

### 테스트 범위
- **Unit Tests**: 각 에이전트 기능별 (54개 에이전트 × 5~10개 테스트)
- **Integration Tests**: 오케스트레이터, 워크플로우, 의존성 해결 (18개 테스트)
- **Error Handling Tests**: 에러 복구 메커니즘 (12개 테스트)
- **Performance Tests**: 성능 벤치마크 및 임계값 검증 (8개 테스트)

### 목표
- **커버리지**: 85%+ (각 에이전트당)
- **성공률**: 99%+ (자동화 테스트)
- **실행 시간**: 5분 이내 (전체 테스트)

---

## 1. 단위 테스트 (Unit Tests)

### 1.1 SQL-Optimizer 테스트

**파일**: `tests/sql-optimizer/validator.test.fl`

```freelang
describe("SQL-Optimizer", {
    // 입력 검증 테스트
    test("validation: should accept simple SELECT", { ... }),
    test("validation: should accept SELECT with WHERE", { ... }),
    test("validation: should accept SELECT with JOIN", { ... }),
    test("validation: should accept SELECT with GROUP BY", { ... }),
    test("validation: should reject INSERT without SELECT", { ... }),
    test("validation: should reject empty query", { ... }),
    test("validation: should reject query > 50KB", { ... }),

    // 최적화 로직 테스트
    test("optimization: should detect N+1 queries", { ... }),
    test("optimization: should suggest index creation", { ... }),
    test("optimization: should identify query timeout risks", { ... }),

    // 통계 및 리포팅
    test("reporting: should generate markdown report", { ... }),
    test("reporting: should generate JSON report", { ... })
})
```

**테스트 케이스**:
1. **유효한 입력**
   - 간단한 SELECT: `SELECT * FROM users`
   - WHERE 조건: `SELECT * FROM users WHERE id = 1`
   - JOIN: `SELECT * FROM users u JOIN orders o ON u.id = o.user_id`
   - GROUP BY: `SELECT user_id, COUNT(*) FROM orders GROUP BY user_id`
   - SUBQUERY: `SELECT * FROM (SELECT * FROM users) t`

2. **무효한 입력**
   - 빈 쿼리: `""`
   - SELECT 없음: `INSERT INTO users VALUES (1, 'test')`
   - 초과 크기: 50KB 이상
   - 형식 오류: `SELECT * FORM users` (오타)

3. **최적화 시나리오**
   - N+1 쿼리 감지: 루프 내 쿼리
   - 인덱스 제안: WHERE 조건에서 인덱스 부족
   - 타임아웃 예측: 대용량 테이블 조인

4. **출력 검증**
   - Markdown 형식 정확성
   - JSON 스키마 준수

### 1.2 Security-Scanner 테스트

**파일**: `tests/security-scanner/validator.test.fl`

```freelang
describe("Security-Scanner", {
    // 입력 검증 테스트
    test("validation: should accept Python code", { ... }),
    test("validation: should accept JavaScript code", { ... }),
    test("validation: should accept Java code", { ... }),
    test("validation: should accept Go code", { ... }),
    test("validation: should reject unsupported language", { ... }),

    // 보안 탐지 테스트
    test("detection: should find SQL injection vulnerability", { ... }),
    test("detection: should find XSS vulnerability", { ... }),
    test("detection: should find hardcoded secrets", { ... }),
    test("detection: should find weak crypto usage", { ... }),

    // 권장사항 테스트
    test("recommendation: should suggest parameterized queries", { ... }),
    test("recommendation: should suggest input validation", { ... })
})
```

**테스트 케이스**:
1. **언어 지원**
   - Python, JavaScript, TypeScript, Java, Go, Rust, FreeLang

2. **취약점 탐지**
   - SQL Injection: `"SELECT * FROM users WHERE id = " + input`
   - XSS: `<div>${userInput}</div>`
   - Hardcoded Secrets: API 키, 토큰
   - 약한 암호화: MD5, SHA1 사용
   - 권한 검증 누락

3. **권장 사항 생성**
   - Parameterized queries 제안
   - 입력 검증 추가 제안
   - 강한 암호화 사용 제안

### 1.3 Document-Generator 테스트

**파일**: `tests/document-generator/validator.test.fl`

```freelang
describe("Document-Generator", {
    // 입력 검증 테스트
    test("validation: should accept Python code", { ... }),
    test("validation: should accept JavaScript code", { ... }),

    // 문서 생성 테스트
    test("generation: should create API documentation", { ... }),
    test("generation: should create class documentation", { ... }),
    test("generation: should create function documentation", { ... }),

    // 형식 테스트
    test("format: should generate markdown", { ... }),
    test("format: should generate HTML", { ... }),
    test("format: should generate OpenAPI spec", { ... })
})
```

**테스트 케이스**:
1. **코드 분석**
   - 함수 추출
   - 파라미터 분석
   - 반환 타입 분석

2. **문서 생성**
   - API 문서
   - 클래스 다이어그램
   - 시퀀스 다이어그램

3. **출력 형식**
   - Markdown
   - HTML
   - OpenAPI 3.0

### 1.4 Log-Analyzer 테스트

**파일**: `tests/log-analyzer/validator.test.fl`

```freelang
describe("Log-Analyzer", {
    // 입력 검증 테스트
    test("validation: should accept JSON logs", { ... }),
    test("validation: should accept syslog format", { ... }),
    test("validation: should accept plain text logs", { ... }),

    // 분류 테스트
    test("classification: should identify ERROR level", { ... }),
    test("classification: should identify WARN level", { ... }),
    test("classification: should identify INFO level", { ... }),

    // 패턴 탐지 테스트
    test("pattern: should detect connection timeouts", { ... }),
    test("pattern: should detect out of memory errors", { ... }),
    test("pattern: should detect permission denied", { ... })
})
```

**테스트 케이스**:
1. **로그 형식 지원**
   - JSON: 구조화된 로그
   - Syslog: RFC 3164/5424
   - Plain Text: 자유형식

2. **에러 분류**
   - ERROR, WARN, INFO, DEBUG
   - 심각도 판정

3. **패턴 감지**
   - 연결 타임아웃
   - 메모리 부족
   - 권한 거부
   - 네트워크 오류

### 1.5 Performance-Profiler 테스트

**파일**: `tests/performance-profiler/validator.test.fl`

```freelang
describe("Performance-Profiler", {
    // 입력 검증 테스트
    test("validation: should accept execution metrics", { ... }),

    // 성능 분석 테스트
    test("analysis: should identify hot spots", { ... }),
    test("analysis: should detect memory leaks", { ... }),
    test("analysis: should measure latency", { ... }),

    // 최적화 제안 테스트
    test("recommendation: should suggest caching", { ... }),
    test("recommendation: should suggest parallelization", { ... })
})
```

---

## 2. 통합 테스트 (Integration Tests)

### 2.1 오케스트레이터 테스트

**파일**: `tests/orchestrator/execution.test.fl`

```freelang
describe("Orchestrator", {
    // 기본 실행 테스트
    test("execution: should execute single agent", { ... }),
    test("execution: should execute two agents sequentially", { ... }),
    test("execution: should execute three agents in parallel", { ... }),

    // 설정 검증 테스트
    test("config: should validate input format", { ... }),
    test("config: should validate output format", { ... }),
    test("config: should validate timeout settings", { ... }),

    // 의존성 해결 테스트
    test("dependency: should resolve linear dependencies", { ... }),
    test("dependency: should handle missing dependencies", { ... }),
    test("dependency: should detect circular dependencies", { ... }),

    // 병렬 실행 테스트
    test("parallelism: should execute independent agents concurrently", { ... }),
    test("parallelism: should respect dependency order", { ... }),

    // 결과 수집 테스트
    test("result: should collect all agent outputs", { ... }),
    test("result: should merge multiple formats", { ... })
})
```

**테스트 시나리오**:

1. **단순 실행**
   ```
   Input: "SELECT * FROM users"
   Agents: [sql-optimizer]
   Expected: Optimization report
   ```

2. **순차 실행**
   ```
   Input: "def func(x): pass"
   Agents: [code-analyzer → security-scanner]
   Expected: Analysis → Vulnerabilities
   ```

3. **병렬 실행**
   ```
   Input: "Complex code"
   Agents: [code-analyzer (parallel) security-scanner, performance-profiler]
   Expected: All results merged
   ```

4. **의존성 해결**
   ```
   Dependencies: A → B → C
   Execution: C must wait for B, B must wait for A
   ```

5. **순환 의존성 감지**
   ```
   Dependencies: A → B → A
   Expected: Error with cycle path
   ```

### 2.2 워크플로우 테스트

**파일**: `tests/workflow/chain.test.fl`

```freelang
describe("Workflow Chain", {
    // 프롬프트 체인 테스트
    test("chain: should execute prompt chain phases", { ... }),
    test("chain: should pass output as next input", { ... }),
    test("chain: should handle phase failures", { ... }),

    // 결과 검증 테스트
    test("validation: should validate chain output", { ... }),
    test("validation: should reject incomplete results", { ... })
})
```

### 2.3 에러 처리 통합 테스트

**파일**: `tests/error-handling/integration.test.fl`

```freelang
describe("Error Handling Integration", {
    // 타임아웃 처리
    test("timeout: should handle agent timeout gracefully", { ... }),
    test("timeout: should retry with increased timeout", { ... }),

    // 의존성 오류
    test("dependency: should handle missing dependency", { ... }),
    test("dependency: should use fallback agent", { ... }),

    // 검증 오류
    test("validation: should reject invalid input", { ... }),
    test("validation: should provide error details", { ... }),

    // 복구 메커니즘
    test("recovery: should log error for analysis", { ... }),
    test("recovery: should provide recovery suggestions", { ... })
})
```

---

## 3. 성능 테스트 (Performance Tests)

### 3.1 성능 벤치마크

**파일**: `tests/performance/benchmark.test.fl`

```freelang
describe("Performance Benchmarks", {
    // SQL-Optimizer 성능
    test("sql-optimizer: 100-line query < 800ms", { ... }),
    test("sql-optimizer: 500-line query < 1500ms", { ... }),

    // Security-Scanner 성능
    test("security-scanner: 1K-line code < 1000ms", { ... }),

    // Document-Generator 성능
    test("document-generator: 500-line code < 1500ms", { ... }),

    // 오케스트레이터 성능
    test("orchestrator: 5 agents < 5000ms", { ... }),
    test("orchestrator: parallel execution < 2500ms", { ... })
})
```

### 3.2 메모리 사용량

**파일**: `tests/performance/memory.test.fl`

```freelang
describe("Memory Profiling", {
    test("sql-optimizer: < 100MB", { ... }),
    test("security-scanner: < 150MB", { ... }),
    test("orchestrator: < 200MB", { ... })
})
```

---

## 4. 테스트 실행

### 4.1 로컬 실행

```bash
# 전체 테스트 실행
make test

# 특정 모듈 테스트
make test-agent agent=sql-optimizer
make test-agent agent=security-scanner

# 통합 테스트만 실행
make test-integration

# 성능 테스트 실행
make test-performance

# 커버리지 리포트 생성
make test-coverage
```

### 4.2 CI/CD 통합

**파일**: `.github/workflows/test.yml`

```yaml
name: Automated Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      # FreeLang 설치
      - name: Install FreeLang
        run: |
          curl -sSL https://gogs.dclub.kr/kim/freelang-v4/releases/download/v1.0/freelang-linux-x64 -o freelang
          chmod +x freelang
          sudo mv freelang /usr/local/bin/

      # 테스트 실행
      - name: Run Unit Tests
        run: make test-unit

      - name: Run Integration Tests
        run: make test-integration

      - name: Run Performance Tests
        run: make test-performance

      # 커버리지 리포트
      - name: Generate Coverage Report
        run: make test-coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage.json
```

---

## 5. 테스트 메트릭

### 5.1 커버리지 목표

| 카테고리 | 목표 | 현재 |
|---------|------|------|
| SQL-Optimizer | 90% | TBD |
| Security-Scanner | 85% | TBD |
| Document-Generator | 85% | TBD |
| Log-Analyzer | 85% | TBD |
| Performance-Profiler | 85% | TBD |
| Orchestrator | 90% | TBD |
| Error Handling | 100% | TBD |
| **전체** | **85%** | TBD |

### 5.2 성능 벤치마크 목표

| 메트릭 | 목표 | 현재 |
|-------|------|------|
| 단일 에이전트 실행 시간 | < 1000ms | TBD |
| 5개 에이전트 순차 실행 | < 5000ms | TBD |
| 5개 에이전트 병렬 실행 | < 2500ms | TBD |
| 메모리 사용량 | < 200MB | TBD |
| 에러 복구 성공률 | > 95% | TBD |

### 5.3 품질 메트릭

| 메트릭 | 목표 | 현재 |
|-------|------|------|
| 테스트 성공률 | > 99% | TBD |
| 실패한 테스트 분석 | 100% | TBD |
| 회귀 테스트 실행 | 100% | TBD |

---

## 6. 테스트 관리

### 6.1 테스트 케이스 추가

새로운 테스트를 추가할 때:

```freelang
// tests/[agent-name]/[feature].test.fl

describe("[Feature Name]", {
    // Setup
    before_each({
        // 테스트 환경 초기화
    }),

    // 테스트 케이스
    test("[specific behavior]", {
        // Given
        var input = ...

        // When
        var result = ...

        // Then
        assert_equals(result.status, "expected")
    }),

    // Teardown
    after_each({
        // 정리 작업
    })
})
```

### 6.2 테스트 문서화

모든 테스트는 다음을 포함해야 합니다:

1. **테스트 제목**: 명확한 행동 설명
2. **전제 조건**: 필요한 상태
3. **실행 단계**: 구체적인 동작
4. **예상 결과**: 기대되는 출력
5. **실패 시 복구**: 정리 작업

### 6.3 테스트 대시보드

```bash
# 테스트 대시보드 열기
make test-dashboard

# 실시간 모니터링
make test-watch
```

---

## 7. 체크리스트

### 초기 설정
- [ ] 테스트 프레임워크 구성
- [ ] CI/CD 파이프라인 설정
- [ ] 커버리지 도구 통합

### Phase 2 (5개 에이전트)
- [ ] SQL-Optimizer: 10개 테스트
- [ ] Security-Scanner: 10개 테스트
- [ ] Document-Generator: 10개 테스트
- [ ] Log-Analyzer: 10개 테스트
- [ ] Performance-Profiler: 10개 테스트
- [ ] 오케스트레이터: 18개 통합 테스트

### 전체 (54개 에이전트)
- [ ] 각 에이전트 5~10개 테스트 (270~540개)
- [ ] 통합 테스트 완료
- [ ] 성능 테스트 완료
- [ ] 커버리지 85%+ 달성

---

## 8. 참고 자료

- 테스트 표준: `standards/TESTING_GUIDE.md`
- 에러 처리: `standards/error-handling-harness.fl`
- 검증: `standards/validation-harness.fl`
- 기존 테스트: `tests/`

---

**마지막 업데이트**: 2026-04-04
**작성자**: Code Review Team
**버전**: 1.0
