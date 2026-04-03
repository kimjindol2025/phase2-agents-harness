# Phase 2 에이전트 하네스 — 사용 가이드

**Version**: 1.0
**Updated**: 2026-04-04

---

## 📖 빠른 시작

### 1단계: 에이전트 설정 생성

```freeling
var sql_optimizer = agent_config_new("SQL-Optimizer", "Database", "claude-opus-4-6")
sql_optimizer = agent_config_add_tools(sql_optimizer, [
  "analyze_queries",
  "generate_indexes",
  "benchmark"
])
```

### 2단계: 단일 에이전트 실행

```freeling
var input = "SELECT * FROM users WHERE status = 'active' (SLOW 3000ms)"
var run = harness_run(sql_optimizer, input)

if run.status == "success" {
  println("✅ Success")
  println("Output: " + run.output)
  println("Cost: $" + str(run.cost_usd))
}
```

### 3단계: 배치 실행 (여러 쿼리)

```freeling
var queries = [
  "SELECT * FROM users",
  "SELECT * FROM orders WHERE id = 123",
  "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id"
]

var result = harness_run_batch([sql_optimizer], queries)
println("Completed: " + str(result.total_runs) + " queries")
println("Success rate: " + str(f64(result.succeeded) / f64(result.total_runs) * 100.0) + "%")
```

---

## 🔍 SQL-Optimizer 상세 가이드

### A. 쿼리 분석

**목표**: 느린 쿼리의 문제점 파악

```freeling
// 1. SlowQuery 정의
var slow_query = slow_query_new("SELECT * FROM users", 5000)
slow_query = slow_query_set_rows(slow_query, 150000)
slow_query = slow_query_set_table(slow_query, "users")

// 2. 분석 실행
var analysis = analyze_query(slow_query)

// 3. 결과 검토
if analysis.severity == "critical" {
  println("🚨 Critical issue detected!")
  println("Issues: " + str(length(analysis.issues)))
  var i: i32 = 0
  while i < length(analysis.issues) {
    println("  - " + analysis.issues[i])
    i = i + 1
  }
}
```

**감지되는 문제점**:
- ✓ Full table scan (WHERE 절 없음)
- ✓ Large table scan (100K+ 행)
- ✓ Deadlock
- ✓ Missing indexes
- ✓ Multiple JOINs

**Severity 해석**:
- 🔴 `critical`: 즉시 조치 필요 (deadlock)
- 🟠 `high`: 1주일 내 조치 (slow query)
- 🟡 `medium`: 2주일 내 조치 (optimization needed)
- 🟢 `low`: 모니터링 (informational)

### B. 최적화 생성

**목표**: 최적화된 SQL과 인덱스 DDL 생성

```freeling
// 1. 분석 결과로부터
var optimization = optimize_query(slow_query.sql, analysis.issues)

// 2. 최적화 제안 확인
println("Original: " + optimization.original_sql)
println("Optimized: " + optimization.optimized_sql)
println("Expected Speedup: " + str(optimization.estimated_speedup) + "x")

// 3. 인덱스 생성
var i: i32 = 0
while i < length(optimization.indexes_ddl) {
  println("Execute: " + optimization.indexes_ddl[i])
  i = i + 1
}
```

**최적화 전략**:
| 전략 | 배수 | 조건 |
|------|------|------|
| Full scan 제거 | 5x | WHERE 절 추가 |
| WHERE 인덱스 | 2x | WHERE 절 있을 때 |
| ORDER 인덱스 | 1.5x | ORDER BY 있을 때 |
| GROUP 인덱스 | 1.3x | GROUP BY 있을 때 |

**예상 속도**: 2.5x (WHERE) × 1.5x (ORDER) = 3.75배

### C. 성능 벤치마크

**목표**: 실제 성능 향상 측정

```freeling
// 1. 벤치마크 실행
var benchmark = benchmark_run("Q1", 5000.0, 1000)  // original=5s, 1K users

// 2. 성능 지표 확인
println("Original: " + str(benchmark.original_ms) + "ms")
println("Optimized: " + str(benchmark.optimized_ms) + "ms")
println("Speedup: " + str(benchmark.speedup) + "x")
println("Throughput: " + str(benchmark.req_per_sec) + " req/sec")

// 3. 지연시간 분포
println("P50: " + str(benchmark.p50_ms) + "ms")   // 중앙값
println("P95: " + str(benchmark.p95_ms) + "ms")   // 95%
println("P99: " + str(benchmark.p99_ms) + "ms")   // 최악 5%
```

**처리량 계산**:
```
req_per_sec = concurrent_users × 1000 / optimized_time_ms

예: 1000 users, 2000ms → 500 req/sec
   5000 users, 1200ms → 4166 req/sec
```

### D. 성과 증명 생성

**목표**: 최적화 효과를 정량적으로 증명

```freeling
var results = [benchmark]
var proof = proof_output(results)
println(proof)

// 출력:
// # OUTPUT_PROOF — SQL-Optimizer Benchmark
//
// ## 성공 기준 달성
//
// ### 1. 성능 향상
// - **목표**: 10배 이상
// - **실측**: 2.5배
// - **달성**: ⚠️ 진행 중 (25%)
```

---

## 🔗 프롬프트 체인 (파이프라인)

### 체인 구성

```freeling
// SQL 최적화 파이프라인
var chain = chain_sql_optimization()
// 자동으로 3개 단계 구성:
// 1. analyze_query (분석)
// 2. suggest_indexes (인덱스)
// 3. generate_sql (SQL 생성)

// 실행
var execution = chain_execute(chain, "SELECT * FROM users")
```

### 커스텀 체인 구성

```freeling
var custom_chain = chain_new("My-Custom-Pipeline")

// Step 1: 분석
var step1 = step_new("analyze", "Analyze the query...", "claude-opus-4-6")
step1 = step_set_output_key(step1, "analysis")
custom_chain = chain_add_step(custom_chain, step1)

// Step 2: 검증
var step2 = step_new("validate", "Validate the analysis...", "claude-opus-4-6")
step2 = step_set_output_key(step2, "validation")
custom_chain = chain_add_step(custom_chain, step2)

// 실행
var result = chain_execute(custom_chain, "SELECT ...")
```

---

## 📊 배치 처리 (대규모 운영)

### 다중 에이전트, 다중 쿼리

```freeling
// 3개 에이전트
var sql_opt = agent_config_new("SQL-Optimizer", "DB", "claude-opus-4-6")
var sec_scan = agent_config_new("Security-Scanner", "Security", "claude-opus-4-6")
var doc_gen = agent_config_new("Document-Generator", "Docs", "claude-haiku-4-5")

var configs = [sql_opt, sec_scan, doc_gen]

// 5개 쿼리
var queries = [
  "SELECT * FROM users",
  "SELECT * FROM orders WHERE id = 123",
  "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id",
  "SELECT a.*, b.* FROM users a JOIN orders b ON a.id = b.user_id",
  "SELECT DISTINCT category FROM products"
]

// 배치 실행: 3×5 = 15개 작업
var result = harness_run_batch(configs, queries)

// 결과 분석
println("Total: " + str(result.total_runs))      // 15
println("Success: " + str(result.succeeded))     // 15
println("Failed: " + str(result.failed))         // 0
println("Cost: $" + str(result.total_cost))      // ~$0.90
println("Time: " + str(result.total_elapsed) + "ms")

// 상세 분석
var i: i32 = 0
while i < length(result.runs) {
  var run = result.runs[i]
  println("[" + str(i+1) + "] " + run.agent + ": " + run.status)
  i = i + 1
}
```

---

## ⚙️ 고급 설정

### 모델 선택

```freeling
// 강력한 모델 (높은 비용, 높은 품질)
var opus = agent_config_new("name", "role", "claude-opus-4-6")
// 비용: $0.05/실행, 지연시간: 2-5초

// 균형 모델 (중간 비용, 중간 품질)
var sonnet = agent_config_new("name", "role", "claude-sonnet-4-6")
// 비용: $0.02/실행, 지연시간: 1-3초

// 빠른 모델 (낮은 비용, 낮은 품질)
var haiku = agent_config_new("name", "role", "claude-haiku-4-5")
// 비용: $0.01/실행, 지연시간: 500ms-1초
```

### 타임아웃 설정

```freeling
var config = agent_config_new("SQL-Optimizer", "DB", "claude-opus-4-6")
config = agent_config_set_timeout(config, 60000)  // 60초
config = agent_config_set_iterations(config, 5)   // 최대 5회
```

### 프롬프트 온도

```freeling
// 창의적 (온도 높음)
var creative_step = step_new("brainstorm", "Generate ideas...", "claude-opus-4-6")
creative_step = step_set_temperature(creative_step, 0.9)

// 정확한 (온도 낮음)
var precise_step = step_new("analyze", "Analyze query...", "claude-opus-4-6")
precise_step = step_set_temperature(precise_step, 0.3)
```

---

## 🐛 문제 해결

### Q: 벤치마크 결과가 비어있어요

```freeling
// ❌ 잘못된 방법
var empty_results: [BenchmarkResult] = []
var proof = proof_output(empty_results)  // "[WARNING] 벤치마크 결과 없음"

// ✅ 올바른 방법
var results = [benchmark_run("Q1", 5000.0, 1000)]
var proof = proof_output(results)
```

### Q: Confidence가 1.0을 초과해요

자동으로 1.0으로 제한됩니다.

```freeling
// indexes_needed = 5개
// raw = 0.7 + 0.1*5 = 1.2
// actual = 1.0 (capped) ✅
```

### Q: 빈 배치 실행은?

```freeling
var empty_configs: [AgentConfig] = []
var queries = ["Q1", "Q2"]
var result = harness_run_batch(empty_configs, queries)
// total_runs = 0, succeeded = 0, failed = 0 (조기 반환)
```

---

## 📈 성능 팁

1. **모델 선택**: Haiku (빠름) → Sonnet (균형) → Opus (정확)
2. **배치 크기**: 1000+ 작업 시 하위 배치로 분할
3. **캐싱**: 동일 쿼리 반복 실행 시 결과 재사용
4. **타임아웃**: 크리티컬하지 않은 작업은 짧게 설정

---

## 📞 지원

- **문서**: `docs/API.md` 참조
- **예제**: `tests/integration-test.md` 참조
- **이슈**: https://gogs.dclub.kr/kim/agents-harness/issues

---

**Happy Optimizing! 🚀**
