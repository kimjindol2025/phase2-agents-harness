# AI 에이전트 하네스 표준 적용 가이드

**최종 업데이트**: 2026-04-04
**상태**: 즉시 적용 가능

---

## 개요

이 가이드는 Phase 2 AI 에이전트 하네스 프로젝트에 4개 표준을 적용하기 위한 완전한 지침입니다:

1. **입력 검증** (Input Validation)
2. **에러 처리** (Error Handling)
3. **테스트 자동화** (Test Automation)
4. **문서화** (Documentation)

---

## 1. 입력 검증 표준

### 적용 대상
- 54개 모든 에이전트의 입력값
- 오케스트레이터의 설정값
- 워크플로우 체인의 중간 데이터

### 표준 파일
- **위치**: `standards/validation-harness.fl`
- **함수**: `validateAgentMeta`, `validateAgentInputs`, `validateDependencies`, `validateExecutionConfig`, `validateOutputFormat`
- **에이전트별 함수**: `validateSqlQuery`, `validateSourceCode`, `validateLogInput`

### 사용 방법

#### 에이전트 등록 시
```freelang
import validation_harness

fn register_agent(meta: AgentMeta) -> Result {
    // Step 1: 메타데이터 검증
    var meta_result = validation_harness::validateAgentMeta(
        meta.id,
        meta.name,
        meta.category
    )

    if !meta_result.valid {
        return Result::Err(create_error(
            "INVALID_META",
            meta_result.message,
            meta.id
        ))
    }

    // Step 2: 의존성 검증 (순환 참조 방지)
    var dep_result = validation_harness::validateDependencies(
        meta.id,
        meta.dependencies,
        all_agent_ids
    )

    if !dep_result.valid {
        return Result::Err(create_error(
            "INVALID_DEPS",
            dep_result.message,
            meta.id
        ))
    }

    // Step 3: 등록
    return register_to_repository(meta)
}
```

#### 에이전트 실행 시
```freelang
fn execute_agent(agent_id: str, input_code: str, config: Config) -> Result {
    // Step 1: 입력 검증
    var input_result = validation_harness::validateAgentInputs(
        input_code,
        config.max_input_lines
    )

    if !input_result.valid {
        return Result::Err(create_validation_error(input_result.message))
    }

    // Step 2: 실행 설정 검증
    var exec_result = validation_harness::validateExecutionConfig(
        config.parallel_enabled,
        config.timeout_ms
    )

    if !exec_result.valid {
        return Result::Err(create_validation_error(exec_result.message))
    }

    // Step 3: 에이전트별 전문 검증
    match agent_id {
        "sql-optimizer" => {
            var sql_result = validation_harness::validateSqlQuery(
                input_code,
                50000
            )
            if !sql_result.valid {
                return Result::Err(create_validation_error(sql_result.message))
            }
        },
        "security-scanner" => {
            var code_result = validation_harness::validateSourceCode(
                input_code,
                "py"
            )
            if !code_result.valid {
                return Result::Err(create_validation_error(code_result.message))
            }
        },
        _ => {}
    }

    // Step 4: 실행
    return run_agent(agent_id, input_code, config)
}
```

### 체크리스트
- [ ] 모든 에이전트 메타데이터 검증 적용
- [ ] 모든 입력값 길이/범위 검증 적용
- [ ] 모든 의존성 순환 참조 검증 적용
- [ ] 에이전트별 전문 검증 함수 정의

---

## 2. 에러 처리 표준

### 적용 대상
- 모든 에이전트 실행 경로
- 오케스트레이터 조율 로직
- 워크플로우 체인 실행
- 의존성 해결 프로세스

### 표준 파일
- **위치**: `standards/error-handling-harness.fl`
- **타입**: `AgentError`, `ErrorChain`, `Result`
- **함수**: `createAgentError`, `getErrorRecoveryInfo`, `logError`, `handleResult`

### 사용 방법

#### 에러 생성 및 복구
```freelang
import error_handling_harness

fn execute_with_recovery(agent_id: str, input: str) -> Result {
    try {
        // 에이전트 실행
        var result = run_agent(agent_id, input)
        return Result::Ok(result)
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

        // Step 3: 복구 전략 조회
        var recovery = error_handling_harness::getErrorRecoveryInfo(agent_error)

        if recovery.can_retry {
            // 재시도 로직
            sleep(recovery.retry_delay_ms)
            return execute_with_recovery(agent_id, input)
        } else if recovery.fallback_agent != "" {
            // 폴백 에이전트로 전환
            return execute_with_recovery(recovery.fallback_agent, input)
        } else {
            // 실패 처리
            return Result::Err(agent_error)
        }
    }
}
```

#### 에러 로깅
```freelang
var error_log = error_handling_harness::createErrorLog()

match execute_result {
    Result::Ok(value) => {
        // 성공 처리
    },
    Result::Err(error) => {
        // 에러 로깅
        error_log = error_handling_harness::logError(error_log, error)

        // 에러 요약 출력
        var summary = error_handling_harness::getErrorSummary(error_log)
        print(summary)
    }
}
```

#### 순환 의존성 감지
```freelang
fn detect_circular_dependencies(agents: [AgentMeta]) -> [AgentError] {
    var errors = []

    var i = 0
    while i < length(agents) {
        var agent = agents[i]

        // 순환 의존성 검사
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

### 체크리스트
- [ ] 모든 try-catch에 에러 생성 로직 추가
- [ ] 모든 에러에 컨텍스트 정보 포함
- [ ] 에러 복구 전략 구현 (재시도, 폴백, 실패)
- [ ] 에러 로깅 및 모니터링 활성화
- [ ] 순환 의존성 감지 활성화

---

## 3. 테스트 자동화 표준

### 적용 대상
- 54개 에이전트 기능 테스트
- 오케스트레이터 조율 로직 테스트
- 워크플로우 체인 실행 테스트
- 의존성 해결 테스트
- 에러 복구 메커니즘 테스트

### 표준 파일
- **위치**: `tests/` 디렉토리
- **패턴**: `tests/<agent-name>/<feature>.test.fl`

### 테스트 구조

#### 에이전트 단위 테스트 (Unit Test)
```freelang
// tests/sql-optimizer/validation.test.fl

import testing
import validation_harness

describe("SQL-Optimizer Validation", {
    test("should validate simple SELECT query", {
        var result = validation_harness::validateSqlQuery(
            "SELECT * FROM users WHERE id = 1",
            50000
        )
        assert_true(result.valid)
    }),

    test("should reject query without SELECT", {
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
    })
})
```

#### 통합 테스트 (Integration Test)
```freelang
// tests/orchestrator/execution.test.fl

import testing
import orchestrator
import validation_harness
import error_handling_harness

describe("Orchestrator Execution", {
    test("should execute single agent successfully", {
        var config = OrchestrationConfig {
            project_name: "test",
            input_code: "SELECT * FROM test",
            parallel_enabled: false,
            timeout_ms: 10000
        }

        var result = orchestrator::execute(config)
        assert_equals(result.status, "success")
        assert_true(result.total_agents > 0)
    }),

    test("should detect circular dependencies", {
        var agents = [
            AgentMeta {
                id: "agent-a",
                dependencies: ["agent-b"]
            },
            AgentMeta {
                id: "agent-b",
                dependencies: ["agent-a"]
            }
        ]

        var errors = detect_circular_dependencies(agents)
        assert_equals(length(errors), 2)
    })
})
```

#### 에러 처리 테스트 (Error Handling Test)
```freelang
// tests/error-handling/recovery.test.fl

describe("Error Recovery", {
    test("should retry on timeout", {
        var error = error_handling_harness::createAgentError(
            AgentErrorCode::TIMEOUT_ERROR,
            "Execution timeout",
            "test-agent"
        )

        var recovery = error_handling_harness::getErrorRecoveryInfo(error)
        assert_true(recovery.can_retry)
        assert_true(recovery.retry_delay_ms > 0)
    }),

    test("should suggest fallback on dependency error", {
        var error = error_handling_harness::createDependencyError(
            "test-agent",
            ["missing-agent"]
        )

        var recovery = error_handling_harness::getErrorRecoveryInfo(error)
        assert_true(recovery.can_retry)
    })
})
```

### 테스트 실행 명령
```bash
# 전체 테스트 실행
make test

# 특정 에이전트 테스트
make test-agent agent=sql-optimizer

# 커버리지 리포트
make test-coverage

# CI/CD 테스트
make test-ci
```

### 테스트 커버리지 목표
- **유닛 테스트**: 각 에이전트 85%+ 커버리지
- **통합 테스트**: 오케스트레이터 90%+ 커버리지
- **에러 처리**: 100% 커버리지 (모든 에러 경로)

### 체크리스트
- [ ] 모든 에이전트에 단위 테스트 추가
- [ ] 오케스트레이터 통합 테스트 추가
- [ ] 에러 복구 메커니즘 테스트 추가
- [ ] CI/CD 자동화 테스트 구성
- [ ] 커버리지 보고서 생성

---

## 4. 문서화 표준

### 적용 대상
- 54개 에이전트 API 스펙
- 오케스트레이터 실행 흐름
- 워크플로우 체인 구조
- 의존성 그래프
- 에러 처리 전략

### 문서 구조

#### 에이전트 API 문서
```markdown
# [Agent-Name] Agent API

## Overview
- **ID**: agent-id
- **Category**: dev | ops | deploy | learn
- **Confidence**: 0.85~0.95
- **Execution Time**: 500~2000ms

## Inputs
```json
{
  "input_code": "string (required)",
  "format": "string (optional)",
  "options": {}
}
```

## Outputs
```json
{
  "status": "success | failure",
  "result": {},
  "issues": [],
  "recommendations": []
}
```

## Dependencies
- Depends on: [agent-ids]
- Required for: [agent-ids]

## Error Handling
- **Validation Errors**: Reject input
- **Timeout**: Retry with increased timeout
- **Dependency Missing**: Wait and retry

## Examples
```
Input: ...
Output: ...
```

## Performance
- Average execution: 800ms
- P95 latency: 1200ms
- Success rate: 99.5%
```

#### 오케스트레이터 설계 문서
```markdown
# Orchestrator Design

## Architecture
```
┌─────────────────────────────────────────┐
│    OrchestrationEngine                  │
│  ┌─────────────────────────────────┐   │
│  │ Input Validation                │   │
│  └──────────────┬──────────────────┘   │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │ Dependency Resolution            │   │
│  │ (Circular Detection)             │   │
│  └──────────────┬──────────────────┘   │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │ Agent Execution Engine           │   │
│  │ (Sequential | Parallel)          │   │
│  └──────────────┬──────────────────┘   │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │ Error Recovery & Logging         │   │
│  └──────────────┬──────────────────┘   │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │ Output Formatting & Validation   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Flow
1. **Validation Phase**: Input validation & config check
2. **Resolution Phase**: Dependency resolution & cycle detection
3. **Execution Phase**: Sequential/parallel agent execution
4. **Recovery Phase**: Error handling & retry logic
5. **Output Phase**: Format output & validate completeness
```

#### 의존성 그래프 문서
```
## Dependency Graph

### Circular Dependency Risks
- [Identify potential circular dependencies]
- [Mitigation strategies]

### Agent Dependencies
```
sql-optimizer
├── no dependencies

security-scanner
├── code-analyzer
│   ├── no dependencies

document-generator
├── code-analyzer

log-analyzer
├── no dependencies

performance-profiler
├── (no dependencies)
```

### Recommended Execution Order
1. sql-optimizer (independent)
2. log-analyzer (independent)
3. code-analyzer (independent)
4. security-scanner (depends on code-analyzer)
5. document-generator (depends on code-analyzer)
6. performance-profiler
```

#### 에러 처리 문서
```markdown
# Error Handling Guide

## Error Types

### VALIDATION_ERROR
- **Cause**: Input validation failed
- **Recovery**: Fix input and retry
- **Can Retry**: No
- **Fallback**: None

### TIMEOUT_ERROR
- **Cause**: Agent execution exceeded timeout
- **Recovery**: Retry with increased timeout
- **Can Retry**: Yes (delay: 5000ms)
- **Fallback**: None

### DEPENDENCY_ERROR
- **Cause**: Required dependency unavailable
- **Recovery**: Wait for dependency
- **Can Retry**: Yes (delay: 3000ms)
- **Fallback**: fallback-analyzer

### CIRCULAR_DEPENDENCY
- **Cause**: Circular reference in dependencies
- **Recovery**: Refactor dependencies
- **Can Retry**: No
- **Fallback**: None

## Recovery Strategies
- Exponential Backoff
- Fallback Agents
- Manual Intervention
```

### 문서 생성 자동화

```bash
# Swagger/OpenAPI 문서 생성
make docs-openapi

# Markdown 문서 생성
make docs-markdown

# HTML 문서 생성
make docs-html

# 전체 문서 생성
make docs-all
```

### 문서 템플릿
- **위치**: `standards/docs-templates/`
- **파일**:
  - `agent-api-template.md`
  - `orchestrator-design-template.md`
  - `dependency-graph-template.md`
  - `error-handling-template.md`

### 체크리스트
- [ ] 54개 에이전트 API 문서 작성
- [ ] 오케스트레이터 설계 문서 작성
- [ ] 의존성 그래프 문서 작성
- [ ] 에러 처리 가이드 작성
- [ ] OpenAPI/Swagger 스펙 생성
- [ ] 문서 자동 생성 스크립트 작성

---

## 적용 로드맵

### Phase A: 기초 구성 (1주)
- [x] 입력 검증 모듈 작성
- [x] 에러 처리 모듈 작성
- [ ] 테스트 프레임워크 설정
- [ ] 문서 템플릿 준비

### Phase B: 에이전트 적용 (2주)
- [ ] 5개 Phase 2 에이전트에 표준 적용
- [ ] 통합 테스트 작성
- [ ] API 문서 작성

### Phase C: 확대 및 최적화 (3주)
- [ ] 54개 에이전트 완전 적용
- [ ] 자동화 테스트 CI/CD 통합
- [ ] 문서 자동 생성

### Phase D: 검증 및 배포 (1주)
- [ ] 커버리지 검증 (85%+)
- [ ] 성능 벤치마크
- [ ] Gogs 배포

---

## 문제 해결

### Q: 순환 의존성을 어떻게 감지하나?
**A**: `error_handling_harness::isCyclicDependency()` 함수를 사용하여 DFS 알고리즘으로 순환 참조를 감지합니다. 모든 에이전트 등록 시 자동으로 검사됩니다.

### Q: 테스트를 어떻게 실행하나?
**A**: `make test`로 전체 테스트를 실행하거나, `make test-agent agent=<name>`으로 특정 에이전트만 테스트할 수 있습니다.

### Q: 에러 복구가 실패하면?
**A**: 에러 로그에 모든 시도가 기록되며, 마지막 에러 메시지와 복구 제안이 사용자에게 반환됩니다.

### Q: 문서를 자동 생성할 수 있나?
**A**: 네, `make docs-openapi` 명령으로 에이전트 메타데이터에서 OpenAPI 스펙을 자동 생성합니다.

---

## 성공 기준

| 항목 | 목표 | 측정 방법 |
|-----|------|---------|
| 입력 검증 | 100% 커버리지 | 수동 검증 + 자동 테스트 |
| 에러 처리 | 모든 경로 복구 | 에러 로그 분석 |
| 테스트 | 85%+ 커버리지 | Istanbul 리포트 |
| 문서 | 54개 에이전트 100% | 문서 존재 확인 |

---

## 참고 자료

- 표준 파일: `standards/`
- 테스트 예제: `tests/`
- 프로젝트 지침: `CLAUDE.md`
- 결정 로그: `DECISION_LOG.md`

---

**마지막 업데이트**: 2026-04-04
**작성자**: Code Review Team
**버전**: 1.0
