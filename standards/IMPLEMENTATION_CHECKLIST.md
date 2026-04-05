# AI 에이전트 하네스 표준 적용 체크리스트

**최종 업데이트**: 2026-04-04
**담당**: Development Team
**상태**: Phase B 준비 완료

---

## 0. 준비 (Preparation) - 1일

### 환경 설정
- [ ] FreeLang v4 설치 및 검증
- [ ] 표준 파일 다운로드 (`standards/` 디렉토리)
- [ ] 테스트 프레임워크 설정
- [ ] Git 브랜치 생성 (`feature/standards-integration`)

### 문서 검토
- [ ] INTEGRATION_GUIDE.md 정독
- [ ] TEST_PLAN.md 정독
- [ ] PERFORMANCE_MONITORING.md 정독
- [ ] 팀 미팅에서 일정 확인

---

## 1. 입력 검증 표준 적용 (Week 1)

### 1.1 검증 모듈 로드 (Day 1)
- [ ] `standards/validation-harness.fl` 프로젝트에 복사
- [ ] FreeLang 컴파일 확인
- [ ] 모듈 임포트 테스트

### 1.2 SQL-Optimizer에 적용 (Day 2)

```freelang
// agents-impl/sql-optimizer/optimizer.fl 수정

// Before
fn execute(input: str) -> Result {
    // 검증 없이 바로 처리
    return process_sql(input)
}

// After
fn execute(input: str) -> Result {
    import validation_harness

    // Step 1: 입력 검증
    var input_result = validation_harness::validateAgentInputs(input, 10000)
    if !input_result.valid {
        return Result::Err(input_result.message)
    }

    // Step 2: SQL 전문 검증
    var sql_result = validation_harness::validateSqlQuery(input, 50000)
    if !sql_result.valid {
        return Result::Err(sql_result.message)
    }

    // Step 3: 처리
    return process_sql(input)
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 컴파일 성공
- [ ] 기존 테스트 통과

### 1.3 Security-Scanner에 적용 (Day 3)

```freelang
// agents-impl/security-scanner/scanner.fl 수정

fn execute(input: str, file_type: str) -> Result {
    import validation_harness

    var code_result = validation_harness::validateSourceCode(input, file_type)
    if !code_result.valid {
        return Result::Err(code_result.message)
    }

    return scan_vulnerabilities(input)
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 컴파일 성공
- [ ] 기존 테스트 통과

### 1.4 Document-Generator에 적용 (Day 4)

```freelang
// agents-impl/document-generator/generator.fl 수정

fn execute(input: str, file_type: str) -> Result {
    import validation_harness

    var code_result = validation_harness::validateSourceCode(input, file_type)
    if !code_result.valid {
        return Result::Err(code_result.message)
    }

    return generate_documentation(input)
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 컴파일 성공
- [ ] 기존 테스트 통과

### 1.5 Log-Analyzer에 적용 (Day 5)

```freelang
// agents-impl/log-analyzer/analyzer.fl 수정

fn execute(input: str, log_format: str) -> Result {
    import validation_harness

    var log_result = validation_harness::validateLogInput(input, log_format)
    if !log_result.valid {
        return Result::Err(log_result.message)
    }

    return analyze_logs(input)
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 컴파일 성공
- [ ] 기존 테스트 통과

### 1.6 Performance-Profiler에 적용 (Day 6)

```freelang
// agents-impl/performance-profiler/profiler.fl 수정

fn execute(input: str) -> Result {
    import validation_harness

    var input_result = validation_harness::validateAgentInputs(input, 10000)
    if !input_result.valid {
        return Result::Err(input_result.message)
    }

    return profile_performance(input)
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 컴파일 성공
- [ ] 기존 테스트 통과

### 1.7 오케스트레이터에 통합 (Day 7)

```freelang
// harness/orchestrator-main.fl 수정

import validation_harness

fn execute_agent(agent_id: str, input: str, config: Config) -> Result {
    // Step 1: 메타데이터 검증
    var meta_result = validation_harness::validateAgentMeta(
        agent_id,
        get_agent_name(agent_id),
        get_agent_category(agent_id)
    )
    if !meta_result.valid {
        return Result::Err(meta_result.message)
    }

    // Step 2: 의존성 검증
    var dep_result = validation_harness::validateDependencies(
        agent_id,
        get_dependencies(agent_id),
        get_all_agent_ids()
    )
    if !dep_result.valid {
        return Result::Err(dep_result.message)
    }

    // Step 3: 실행 설정 검증
    var exec_result = validation_harness::validateExecutionConfig(
        config.parallel_enabled,
        config.timeout_ms
    )
    if !exec_result.valid {
        return Result::Err(exec_result.message)
    }

    // Step 4: 출력 형식 검증
    var fmt_result = validation_harness::validateOutputFormat(config.output_format)
    if !fmt_result.valid {
        return Result::Err(fmt_result.message)
    }

    // Step 5: 실행
    return run_agent(agent_id, input)
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 컴파일 성공
- [ ] 통합 테스트 통과

---

## 2. 에러 처리 표준 적용 (Week 2)

### 2.1 에러 처리 모듈 로드 (Day 8)
- [ ] `standards/error-handling-harness.fl` 프로젝트에 복사
- [ ] FreeLang 컴파일 확인
- [ ] 모듈 임포트 테스트

### 2.2 오케스트레이터에 에러 처리 추가 (Day 9-10)

```freelang
// harness/orchestrator-main.fl 수정

import error_handling_harness

fn execute_agent_with_recovery(agent_id: str, input: str, config: Config) -> Result {
    try {
        // 에이전트 실행
        return execute_agent(agent_id, input, config)
    } catch error {
        // Step 1: 에러 객체 생성
        var agent_error = error_handling_harness::createAgentError(
            AgentErrorCode::EXECUTION_ERROR,
            error.message,
            agent_id
        )

        // Step 2: 컨텍스트 추가
        agent_error = error_handling_harness::withContext(
            agent_error,
            "input_size=" + str(length(input))
        )

        // Step 3: 복구 정보 조회
        var recovery = error_handling_harness::getErrorRecoveryInfo(agent_error)

        // Step 4: 복구 시도
        if recovery.can_retry && config.retry_enabled {
            sleep(recovery.retry_delay_ms)
            return execute_agent_with_recovery(agent_id, input, config)
        }

        // Step 5: 로깅
        error_log = error_handling_harness::logError(error_log, agent_error)

        // Step 6: 반환
        return Result::Err(agent_error)
    }
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 컴파일 성공
- [ ] 에러 복구 테스트 통과

### 2.3 순환 의존성 감지 추가 (Day 11)

```freelang
// harness/orchestrator-main.fl 수정

fn detect_and_report_circular_dependencies() -> [AgentError] {
    var errors = []
    var agents = load_all_agents()

    var i = 0
    while i < length(agents) {
        var agent = agents[i]

        if error_handling_harness::isCyclicDependency(
            agent.id,
            agent.dependencies,
            get_all_agent_dependencies()
        ) {
            var error = error_handling_harness::createCircularDependencyError(
                agent.id,
                get_dependency_cycle_path(agent.id)
            )
            errors.push(error)
        }

        i = i + 1
    }

    return errors
}
```

체크:
- [ ] 코드 수정 완료
- [ ] 순환 의존성 감지 테스트 통과

### 2.4 에러 로깅 및 모니터링 (Day 12)

```freelang
// harness/orchestrator-main.fl 수정

var error_log = error_handling_harness::createErrorLog()

fn log_execution_errors(result: Result) {
    match result {
        Result::Ok(_) => {},
        Result::Err(error) => {
            error_log = error_handling_harness::logError(error_log, error)

            // 에러 요약 출력
            var summary = error_handling_harness::getErrorSummary(error_log)
            print(summary)
        }
    }
}
```

체크:
- [ ] 에러 로깅 동작 확인
- [ ] 에러 요약 리포트 생성 확인

---

## 3. 테스트 자동화 표준 적용 (Week 3)

### 3.1 테스트 프레임워크 설정 (Day 13)
- [ ] 테스트 러너 설치 (FreeLang test framework)
- [ ] `Makefile` 또는 build.json에 테스트 명령 추가
- [ ] GitHub Actions 워크플로우 생성 (`.github/workflows/test.yml`)

### 3.2 SQL-Optimizer 테스트 작성 (Day 14)

**파일**: `tests/sql-optimizer/validator.test.fl`

```freelang
describe("SQL-Optimizer Validation", {
    test("should accept simple SELECT", {
        var result = validation_harness::validateSqlQuery(
            "SELECT * FROM users WHERE id = 1",
            50000
        )
        assert_true(result.valid)
    }),

    test("should reject INSERT without SELECT", {
        var result = validation_harness::validateSqlQuery(
            "INSERT INTO users VALUES (1, 'test')",
            50000
        )
        assert_false(result.valid)
    }),

    test("should reject empty query", {
        var result = validation_harness::validateSqlQuery(
            "",
            50000
        )
        assert_false(result.valid)
    }),

    test("should detect N+1 queries", {
        var result = run_agent("sql-optimizer", "SELECT * FROM orders o WHERE u.id IN (SELECT user_id FROM users)")
        assert_true(result.has_recommendation("N+1 query detected"))
    })
})
```

체크:
- [ ] 테스트 파일 생성
- [ ] 테스트 실행 성공 (최소 4개)
- [ ] 커버리지 > 80%

### 3.3 Security-Scanner 테스트 작성 (Day 15)

**파일**: `tests/security-scanner/validator.test.fl`

```freelang
describe("Security-Scanner", {
    test("should accept Python code", {
        var result = validation_harness::validateSourceCode("def foo(): pass", "py")
        assert_true(result.valid)
    }),

    test("should detect SQL injection", {
        var result = run_agent("security-scanner",
            "SELECT * FROM users WHERE id = " + input)
        assert_true(result.has_vulnerability("SQL injection"))
    })
})
```

체크:
- [ ] 테스트 파일 생성
- [ ] 테스트 실행 성공 (최소 4개)

### 3.4 Document-Generator 테스트 작성 (Day 16)

**파일**: `tests/document-generator/validator.test.fl`

체크:
- [ ] 테스트 파일 생성
- [ ] 테스트 실행 성공 (최소 4개)

### 3.5 Log-Analyzer 테스트 작성 (Day 17)

**파일**: `tests/log-analyzer/validator.test.fl`

체크:
- [ ] 테스트 파일 생성
- [ ] 테스트 실행 성공 (최소 4개)

### 3.6 Performance-Profiler 테스트 작성 (Day 18)

**파일**: `tests/performance-profiler/validator.test.fl`

체크:
- [ ] 테스트 파일 생성
- [ ] 테스트 실행 성공 (최소 4개)

### 3.7 오케스트레이터 통합 테스트 작성 (Day 19-20)

**파일**: `tests/orchestrator/full-integration.test.fl`

```freelang
describe("Orchestrator Integration", {
    test("should validate input before execution", { ... }),
    test("should detect circular dependencies", { ... }),
    test("should execute agents sequentially", { ... }),
    test("should execute agents in parallel", { ... }),
    test("should handle timeouts", { ... }),
    test("should collect metrics", { ... })
})
```

체크:
- [ ] 통합 테스트 파일 생성
- [ ] 최소 6개 통합 테스트
- [ ] CI/CD 파이프라인에서 자동 실행

---

## 4. 성능 모니터링 및 문서화 (Week 4)

### 4.1 메트릭 수집 구현 (Day 21)

```freelang
// agents-impl/metrics-collector.fl 생성

import metrics
import time

fn collect_execution_metrics(agent_id, start_time, end_time, status) {
    var metrics = ExecutionMetrics {
        agent_id: agent_id,
        start_time: start_time,
        end_time: end_time,
        duration_ms: (end_time - start_time),
        status: status,
        memory_used_mb: get_memory_usage(),
        ...
    }

    store_metrics(metrics)
    return metrics
}
```

체크:
- [ ] 메트릭 수집 함수 구현
- [ ] 메트릭 저장소 설정 (파일 또는 DB)

### 4.2 성능 대시보드 배포 (Day 22-23)

```bash
# scripts/performance-dashboard.js 배포

npm install express chart.js
node scripts/performance-dashboard.js

# http://localhost:3000에서 접근 가능
```

체크:
- [ ] 대시보드 배포 성공
- [ ] 메트릭 시각화 확인

### 4.3 OpenAPI 스펙 생성 (Day 24)

```bash
node scripts/generate-openapi.js > docs/openapi.yaml
```

체크:
- [ ] OpenAPI 스펙 생성
- [ ] Swagger UI에서 확인

### 4.4 마크다운 문서 생성 (Day 25)

```bash
node scripts/generate-docs.js > docs/AGENTS.md
```

체크:
- [ ] 마크다운 문서 생성
- [ ] 각 에이전트 문서 확인

### 4.5 GitHub Actions 성능 모니터링 설정 (Day 26)

**파일**: `.github/workflows/performance.yml`

체크:
- [ ] 워크플로우 파일 생성
- [ ] 자동 성능 테스트 실행 확인
- [ ] 성능 리포트 생성 확인

---

## 5. 검증 및 배포 (Week 5)

### 5.1 통합 테스트 실행 (Day 27)

```bash
make test

# 결과 확인
# Unit Tests: 50개+ 통과
# Integration Tests: 18개 통과
# Performance Tests: 8개 통과
```

체크:
- [ ] 전체 테스트 성공률 99%+
- [ ] 커버리지 85%+ 달성

### 5.2 성능 벤치마크 실행 (Day 28)

```bash
make test-performance

# 임계값 확인
# sql-optimizer: < 1000ms ✓
# security-scanner: < 1500ms ✓
# document-generator: < 2000ms ✓
# log-analyzer: < 3000ms ✓
# performance-profiler: < 2000ms ✓
```

체크:
- [ ] 모든 에이전트 성능 임계값 충족
- [ ] 병렬 실행 효율성 확인

### 5.3 문서 완성도 검증 (Day 29)

- [ ] 54개 에이전트 API 문서 작성
- [ ] 오케스트레이터 설계 문서 작성
- [ ] 의존성 그래프 문서 작성
- [ ] 에러 처리 가이드 작성

체크:
- [ ] 모든 문서 존재 확인
- [ ] 스펠 및 내용 검수

### 5.4 Gogs 커밋 및 배포 (Day 30)

```bash
git add -A
git commit -m "feat: Apply 4 standards to ai-harness (validation, error-handling, testing, monitoring)"
git push origin feature/standards-integration
```

체크:
- [ ] 커밋 메시지 작성
- [ ] Gogs 푸시 성공
- [ ] Pull Request 생성

### 5.5 최종 검수 및 승인 (Day 31)

- [ ] Architecture Team 검수
- [ ] Code Review Team 승인
- [ ] DevOps Team 배포 준비

체크:
- [ ] 모든 피드백 반영
- [ ] 최종 승인 획득

---

## 6. 종합 검수 (Final Verification)

### 입력 검증
- [ ] 모든 에이전트 validateAgentInputs 호출 확인
- [ ] 모든 의존성 validateDependencies 호출 확인
- [ ] 모든 설정 validateExecutionConfig 호출 확인

### 에러 처리
- [ ] 모든 try-catch에 에러 생성 확인
- [ ] 모든 에러에 복구 정보 확인
- [ ] 순환 의존성 감지 자동화 확인

### 테스트
- [ ] 50개+ 단위 테스트 실행 성공
- [ ] 18개 통합 테스트 실행 성공
- [ ] CI/CD 파이프라인 자동 테스트 확인

### 문서화
- [ ] OpenAPI 스펙 완성
- [ ] 마크다운 문서 완성
- [ ] 성능 리포트 생성 확인

### 성능
- [ ] 모든 에이전트 임계값 충족
- [ ] 평균 실행 시간 기준 충족
- [ ] 메모리 사용량 기준 충족

---

## 7. 신호등 상태 (Traffic Light Status)

### Week 1 (Day 1-7)
```
입력 검증: [████████████████████] 100% ✅
에러 처리: [░░░░░░░░░░░░░░░░░░░░] 0%
테스트: [░░░░░░░░░░░░░░░░░░░░] 0%
문서화: [░░░░░░░░░░░░░░░░░░░░] 0%
```

### Week 2 (Day 8-14)
```
입력 검증: [████████████████████] 100% ✅
에러 처리: [████████████████████] 100% ✅
테스트: [████░░░░░░░░░░░░░░░░] 20%
문서화: [░░░░░░░░░░░░░░░░░░░░] 0%
```

### Week 3 (Day 15-20)
```
입력 검증: [████████████████████] 100% ✅
에러 처리: [████████████████████] 100% ✅
테스트: [████████████████████] 100% ✅
문서화: [░░░░░░░░░░░░░░░░░░░░] 0%
```

### Week 4 (Day 21-26)
```
입력 검증: [████████████████████] 100% ✅
에러 처리: [████████████████████] 100% ✅
테스트: [████████████████████] 100% ✅
문서화: [████████████████░░░░░] 80%
```

### Week 5 (Day 27-31)
```
입력 검증: [████████████████████] 100% ✅
에러 처리: [████████████████████] 100% ✅
테스트: [████████████████████] 100% ✅
문서화: [████████████████████] 100% ✅
```

---

## 8. 리스크 관리

### 잠재적 위험
| 위험 | 확률 | 영향 | 대응 |
|-----|------|------|------|
| 기존 에이전트 호환성 | 중 | 중 | 포장 계층 사용 |
| 성능 저하 | 중 | 중 | 최적화 및 캐싱 |
| 테스트 실패 | 낮 | 중 | 사전 리뷰 |
| 문서 부정확성 | 낮 | 낮 | 검수 강화 |

### 완화 전략
- 주간 진행 상황 점검
- 일일 빌드 및 테스트
- 즉시 문제 보고 및 해결

---

## 9. 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|-----|------|---------|
| 표준 적용률 | 100% | 체크리스트 완료 |
| 테스트 성공률 | 99%+ | CI/CD 리포트 |
| 커버리지 | 85%+ | Istanbul 리포트 |
| 문서 완성도 | 100% | 수동 검증 |
| 성능 달성율 | 100% | 벤치마크 리포트 |

---

## 10. 추적 및 보고

### 주간 진행 상황
- **Week 1**: 입력 검증 100% 완료 ✅
- **Week 2**: 에러 처리 100% 완료 (예상)
- **Week 3**: 테스트 자동화 100% 완료 (예상)
- **Week 4**: 성능 모니터링 80% 완료 (예상)
- **Week 5**: 최종 검증 및 배포 (예상)

### 일일 보고
```bash
# 매일 오후 5시에 실행
./scripts/daily-status-report.sh

# 결과: 이메일 및 Slack 알림
```

---

**마지막 업데이트**: 2026-04-04
**담당자**: Development Team
**상태**: 즉시 시작 가능 ✅

