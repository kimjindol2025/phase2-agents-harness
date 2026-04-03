# Phase 2 에이전트 하네스 — API 참고서

**Version**: 1.0
**Status**: Stable
**Last Updated**: 2026-04-04

---

## 📚 목차

1. [Orchestrator API](#orchestrator-api)
2. [Prompt Chain API](#prompt-chain-api)
3. [SQL-Optimizer API](#sql-optimizer-api)
4. [공통 데이터 타입](#공통-데이터-타입)
5. [사용 예제](#사용-예제)

---

## Orchestrator API

에이전트를 등록하고 실행하는 핵심 엔진입니다.

### 데이터 타입

#### AgentConfig
```freeling
struct AgentConfig {
    name: str              // 에이전트 식별자
    role: str              // 역할 (예: "Database", "Security")
    tools: [str]           // 사용 가능한 도구 목록
    model: str             // LLM 모델 (claude-opus-4-6, sonnet, haiku)
    max_iterations: i32    // 최대 반복 횟수 (기본: 10)
    timeout_ms: i32        // 타임아웃 (기본: 30000ms)
}
```

#### AgentRun
```freeling
struct AgentRun {
    agent: str             // 실행한 에이전트 이름
    input: str             // 입력 데이터
    output: str            // 실행 결과
    status: str            // "pending" | "success" | "failed" | "timeout"
    iterations: i32        // 실제 반복 횟수
    elapsed_ms: i32        // 소요 시간
    cost_usd: f64          // 추정 비용
    error: str             // 에러 메시지
}
```

#### HarnessResult
```freeling
struct HarnessResult {
    total_runs: i32        // 총 실행 횟수
    succeeded: i32         // 성공한 실행
    failed: i32            // 실패한 실행
    total_cost: f64        // 총 비용
    total_elapsed: i32     // 총 소요 시간
    runs: [AgentRun]       // 상세 실행 기록
}
```

### 함수

#### agent_config_new
```freeling
fn agent_config_new(name: str, role: str, model: str) -> AgentConfig
```
새로운 에이전트 설정 생성

**매개변수**:
- `name`: 에이전트 이름 (예: "SQL-Optimizer")
- `role`: 역할 (예: "Database Performance")
- `model`: 사용할 LLM (예: "claude-opus-4-6")

**반환**: AgentConfig 객체

**예제**:
```freeling
var sql_opt = agent_config_new("SQL-Optimizer", "Database", "claude-opus-4-6")
```

#### agent_config_add_tools
```freeling
fn agent_config_add_tools(config: AgentConfig, tools: [str]) -> AgentConfig
```
에이전트에 도구 추가

**예제**:
```freeling
sql_opt = agent_config_add_tools(sql_opt, ["analyze", "optimize", "benchmark"])
```

#### harness_run
```freeling
fn harness_run(config: AgentConfig, input: str) -> AgentRun
```
단일 에이전트 실행

**매개변수**:
- `config`: 에이전트 설정
- `input`: 처리할 입력 데이터

**반환**: 실행 결과 (AgentRun)

**예제**:
```freeling
var run = harness_run(sql_opt, "SELECT * FROM users WHERE id = 1 (SLOW)")
```

#### harness_run_batch
```freeling
fn harness_run_batch(configs: [AgentConfig], inputs: [str]) -> HarnessResult
```
여러 에이전트를 여러 입력으로 배치 실행

**매개변수**:
- `configs`: 에이전트 설정 배열
- `inputs`: 입력 데이터 배열

**실행 모델**: N개 에이전트 × M개 입력 = N×M개 실행

**반환**: 모든 실행 결과 (HarnessResult)

**예제**:
```freeling
var configs = [sql_opt, security_scanner]
var inputs = ["Query 1", "Query 2", "Query 3"]
var result = harness_run_batch(configs, inputs)  // 2×3 = 6개 실행
```

#### registry_add / registry_get / registry_list
```freeling
fn registry_add(registry: AgentRegistry, config: AgentConfig) -> AgentRegistry
fn registry_get(registry: AgentRegistry, name: str) -> AgentConfig
fn registry_list(registry: AgentRegistry) -> [str]
```
에이전트 레지스트리 관리

---

## Prompt Chain API

멀티-스텝 LLM 파이프라인을 구성합니다.

### 데이터 타입

#### PromptStep
```freeling
struct PromptStep {
    name: str              // 스텝 식별자
    template: str          // 프롬프트 템플릿
    input_keys: [str]      // 입력 변수명
    output_key: str        // 출력 저장 키
    model: str             // 사용할 LLM
    temperature: f64       // 창의성 (0.0 ~ 1.0)
    max_tokens: i32        // 최대 출력 토큰
}
```

#### PromptChain
```freeling
struct PromptChain {
    name: str              // 체인 식별자
    steps: [PromptStep]    // 실행할 스텝 순서
    context: [str]         // 공유 컨텍스트
    variables: [str]       // 변수 목록
}
```

### 함수

#### chain_new
```freeling
fn chain_new(name: str) -> PromptChain
```
새로운 프롬프트 체인 생성

#### chain_add_step
```freeling
fn chain_add_step(chain: PromptChain, step: PromptStep) -> PromptChain
```
체인에 스텝 추가

**실행 순서**: 추가된 순서대로 실행 (이전 스텝의 출력이 다음 입력)

#### chain_execute
```freeling
fn chain_execute(chain: PromptChain, input: str) -> ChainExecution
```
체인 실행

**제어 흐름**:
1. Step 1: input을 입력으로 받아 output_key에 저장
2. Step 2: Step 1의 output을 입력으로 받음
3. ... (반복)
4. 최종 출력 반환

**예제**:
```freeling
var chain = chain_sql_optimization()  // 표준 SQL 최적화 파이프라인
var result = chain_execute(chain, "SELECT * FROM users")
```

---

## SQL-Optimizer API

느린 쿼리를 분석하고 최적화합니다.

### 데이터 타입

#### SlowQuery
```freeling
struct SlowQuery {
    sql: str               // SQL 쿼리문
    execution_ms: i32      // 실행 시간 (ms)
    rows_scanned: i32      // 스캔한 행 수
    lock_type: str         // 잠금 타입
    table: str             // 주 테이블명
}
```

#### QueryAnalysis
```freeling
struct QueryAnalysis {
    query: SlowQuery       // 원본 쿼리
    issues: [str]          // 감지된 문제점
    severity: str          // "critical" | "high" | "medium" | "low"
    indexes_needed: [str]  // 필요한 인덱스
    suggested_sql: str     // 권장 SQL
    confidence: f64        // 신뢰도 (0.0 ~ 1.0)
}
```

#### OptimizationResult
```freeling
struct OptimizationResult {
    original_sql: str      // 원본 SQL
    optimized_sql: str     // 최적화된 SQL
    indexes_ddl: [str]     // 생성해야 할 인덱스 (DDL)
    cache_key: str         // 캐시 키
    estimated_speedup: f64 // 예상 속도 향상 배수
    confidence: f64        // 신뢰도
}
```

#### BenchmarkResult
```freeling
struct BenchmarkResult {
    query_id: str          // 쿼리 식별자
    original_ms: f64       // 원본 실행 시간
    optimized_ms: f64      // 최적화 후 실행 시간
    speedup: f64           // 실제 속도 향상 배수
    concurrent_users: i32  // 동시 사용자 수
    req_per_sec: f64       // 초당 요청 수
    memory_mb: f64         // 메모리 사용량
    p50_ms: f64            // 중앙값 지연시간
    p95_ms: f64            // 95 백분위수
    p99_ms: f64            // 99 백분위수
}
```

### 함수

#### analyze_query
```freeling
fn analyze_query(q: SlowQuery) -> QueryAnalysis
```
쿼리를 분석하고 문제점 파악

**감지 규칙**:
1. execution_ms > 1000ms → "high" severity
2. rows_scanned > 100,000 → "missing index" 의심
3. lock_type = "deadlock" → "critical" severity
4. No WHERE clause → "full table scan"
5. Multiple JOINs → "join optimization" 필요

**신뢰도**: 0.7 + (indexes_needed 개수 × 0.1), max 1.0

#### optimize_query
```freeling
fn optimize_query(sql: str, issues: [str]) -> OptimizationResult
```
쿼리 최적화 전략 생성

**최적화 전략**:
- Full scan 감지: 5배 향상
- WHERE 절: 2배 향상
- ORDER BY: 1.5배 향상
- GROUP BY: 1.3배 향상

**예제**:
```freeling
var analysis = analyze_query(slow_query)
var result = optimize_query(analysis.query.sql, analysis.issues)
// estimated_speedup = 2.5 * 2.0 * 1.5 = 7.5x (WHERE + ORDER)
```

#### benchmark_run
```freeling
fn benchmark_run(query_id: str, original_time: f64, users: i32) -> BenchmarkResult
```
성능 벤치마크 수행

**동작**:
- optimized_time = original_time / 2.5 (2.5배 향상 가정)
- speedup = original_time / optimized_time
- req_per_sec = users × 1000 / optimized_time

---

## 공통 데이터 타입

### Status 값
```
"pending"    - 대기 중
"success"    - 성공
"failed"     - 실패
"timeout"    - 타임아웃
"empty"      - 비어있음
```

### Model 값
```
"claude-opus-4-6"    - 가장 강력한 모델 (비용 높음)
"claude-sonnet-4-6"  - 균형 모델 (추천)
"claude-haiku-4-5"   - 빠른 모델 (비용 저)
```

### Severity 값
```
"critical"   - 즉시 조치 필요
"high"       - 1주일 내 조치
"medium"     - 2주일 내 조치
"low"        - 모니터링
```

---

## 사용 예제

### 예제 1: 단일 쿼리 최적화

```freeling
// 1. 느린 쿼리 정의
var slow_q = slow_query_new("SELECT * FROM users WHERE status = 'active'", 3000)
slow_q = slow_query_set_rows(slow_q, 250000)
slow_q = slow_query_set_table(slow_q, "users")

// 2. 분석
var analysis = analyze_query(slow_q)
println("Severity: " + analysis.severity)  // "high"
println("Issues: " + str(length(analysis.issues)))  // 2

// 3. 최적화
var optimization = optimize_query(slow_q.sql, analysis.issues)
println("Estimated speedup: " + str(optimization.estimated_speedup) + "x")

// 4. 벤치마크
var benchmark = benchmark_run("Q1", f64(slow_q.execution_ms), 1000)
println("Actual speedup: " + str(benchmark.speedup) + "x")
println("Req/sec: " + str(benchmark.req_per_sec))
```

### 예제 2: 배치 실행 (3개 쿼리, 2개 에이전트)

```freeling
// 에이전트 설정
var sql_opt = agent_config_new("SQL-Optimizer", "Database", "claude-opus-4-6")
var sec_scan = agent_config_new("Security-Scanner", "Security", "claude-opus-4-6")

// 입력 데이터
var inputs = [
  "SELECT * FROM users",
  "SELECT * FROM orders WHERE id = 123",
  "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id"
]

// 배치 실행: 2×3 = 6개 작업
var configs = [sql_opt, sec_scan]
var result = harness_run_batch(configs, inputs)

// 결과
println("Total: " + str(result.total_runs))      // 6
println("Success: " + str(result.succeeded))     // 6
println("Cost: $" + str(result.total_cost))      // $0.30
```

### 예제 3: 프롬프트 체인 (SQL 최적화 파이프라인)

```freeling
// SQL 최적화 파이프라인
var chain = chain_sql_optimization()
// 단계 1: analyze_query (분석)
// 단계 2: suggest_indexes (인덱스 제안)
// 단계 3: generate_sql (최적화 SQL 생성)

var input = "SELECT * FROM orders WHERE status = 'pending'"
var execution = chain_execute(chain, input)

println("Status: " + execution.status)           // "success"
println("Steps: " + str(length(execution.step_results)))  // 3
println("Final output: " + substring(execution.final_output, 0, 100))
```

---

## 성능 특성

### 처리량
- 단일 쿼리 분석: 100ms
- 배치 분석 (10개): 1초
- 벤치마크: 5000ms (시뮬레이션)

### 메모리
- AgentConfig: ~1KB
- QueryAnalysis: ~2KB
- 배치 결과 (100개): ~200KB

### 비용 (추정)
- Opus 모델: $0.05/실행
- Sonnet 모델: $0.02/실행
- Haiku 모델: $0.01/실행

---

## 에러 처리

모든 함수는 다음을 보장합니다:

1. **Division by Zero 방지**: 0 입력 시 기본값 사용
2. **Empty Array 처리**: 빈 배열 시 조기 반환
3. **Confidence 범위**: 항상 0.0 ~ 1.0
4. **Timeout 처리**: max_iterations 초과 시 상태 업데이트

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|---------|
| 1.0 | 2026-04-04 | 초기 릴리스 |

---

**문의**: Phase 2 Project Lead
**저장소**: https://gogs.dclub.kr/kim/agents-harness.git
