# AI_LIMITS.md - AI 한계점 분석 & 보완 전략

## 개요
이 문서는 현재 AI 에이전트(Claude)가 스스로 해결하지 못하는 지점을 명시적으로 기록하고, **사람이 매번 수정하는 대신** 구조(프롬프트 체인, 워크플로우, 룰 엔진)로 자동 보완하는 전략을 정의합니다.

---

## 1️⃣ 타입 추론 시스템 한계 (FreeLang v4)

### 증상
```
// 다음의 제네릭 + 유니온 조합에서 타입 추론 실패
fn map<T, U>(list: List<T>, f: (T) -> U): List<U> { ... }

// 사용 시:
let result = map([1, 2, 3], |x| if x > 1 { "big" } else { "small" });
// → 예상: List<string>, 실제: 타입 추론 불가
```

### 근본 원인
- AI: 제네릭 + 유니온 타입 조합의 제약 조건을 동시에 만족하는 해법 수렴 어려움
- 특히 고차 함수(Higher-Order Functions)에서 타입 변수 전파 추적 실패

### 현재 해결방식
- ❌ 사람이 매번 타입 명시: `let result: List<string> = map(...)`

### Phase 2 보완 전략
- ✅ **Type-Checker 에이전트** 배포
  - 입력: 타입 추론 실패 코드
  - 처리: 다단계 검증 (AST 분석 → 제약조건 수집 → Z3 Solver 호출)
  - 출력: 가능한 타입 조합 + 가장 일반적인 해법
  - 증명: 테스트 케이스 자동 생성 및 검증

### 구현 기술
```freelang
// agents-impl/type-checker/inference-engine.free
struct TypeInferenceRequest {
  code: String,
  constraints: List<String>,
}

fn infer_type(req: TypeInferenceRequest): Result<String, String> {
  // 1. AST 파싱
  let ast = parse(req.code);

  // 2. 제약조건 수집
  let constraints = collect_constraints(ast, req.constraints);

  // 3. 외부 Z3 Solver 호출 (구조적 보완)
  let solution = call_z3_solver(constraints);

  // 4. 가독성 높은 타입 표현으로 변환
  let readable_type = to_readable_type(solution);

  Ok(readable_type)
}
```

---

## 2️⃣ 데이터베이스 동시성 병목 (gogs-server-fl)

### 증상
```
10K+ 동시 저장소 푸시 요청 시:
- 쿼리 응답시간: 100ms → 5000ms+
- Req/sec: 100 → 10 (95% 저하)
- 원인: 단일 DB 락 경합 (update_repo_stats 등)
```

### 근본 원인
- AI: 복잡한 동시성 문제의 메모리 누수/데드락 분석 불가
- SQLite (단일 쓰기 락)의 특성상 동시 쓰기 기본 불가능

### 현재 해결방식
- ❌ 사람이 매번 수동으로 쿼리 최적화 및 인덱스 추가

### Phase 2 보완 전략
- ✅ **SQL-Optimizer 에이전트** 배포
  - 입력: 느린 쿼리 로그 (EXPLAIN QUERY PLAN + 응답시간)
  - 처리:
    1. 쿼리 분석 (JOIN 최적화, 인덱스 추천)
    2. 트랜잭션 설계 (배치 처리, PRAGMA 튜닝)
    3. 아키텍처 제안 (읽기 캐시, 비동기 큐 등)
  - 출력: 최적화된 쿼리 + 성능 예상치
  - 증명: 벤치마크 테스트 (10K 동시 요청 before/after)

### 구현 기술
```freelang
// agents-impl/sql-optimizer/query-analyzer.free
struct QueryProfile {
  sql: String,
  exec_time_ms: Int,
  row_count: Int,
  lock_type: String,
}

fn optimize_query(profile: QueryProfile): OptimizationPlan {
  let analysis = analyze_query_plan(profile.sql);

  let strategies = [
    suggest_indexes(analysis),
    suggest_batching(analysis),
    suggest_caching(profile),
  ];

  rank_and_propose(strategies, profile.exec_time_ms)
}
```

---

## 3️⃣ 가격 산정 & 수요 예측 (BigWash)

### 증상
```
세차 요금 자동 산정:
- 계절성(겨울↑, 여름↓) 미반영
- 날씨 변동 영향도 미반영
- 예약 수요 곡선 학습 불가
```

### 근본 원인
- AI: 과거 데이터 패턴 학습 불가 (LLM이 통계/ML 예측 미지원)
- 확률 모델 구축 불가 (거대 모델은 규칙 기반만 가능)

### 현재 해결방식
- ❌ 고정 가격 또는 수동 계절 할인율 조정

### Phase 2 보완 전략
- ✅ **ML-Pipeline 에이전트** 배포 (2주차)
  - 입력: 과거 3개월 예약 데이터 + 날씨 + 계절
  - 처리:
    1. 데이터 전처리 (이상치 제거)
    2. 시계열 분석 (ARIMA 또는 Prophet)
    3. 수요 곡선 모델링
  - 출력: 일별 추천 가격 + 신뢰도
  - 증명: 검증 기간(2주) 실제 수익 vs 예측 비교

---

## 4️⃣ 자동 롤백 판단 기준 모호 (배포 자동화)

### 증상
```
카나리 배포 중:
"새 버전의 에러율이 2%→3.5%로 증가했는데,
언제 롤백해야 하나? (신뢰도 95%? 99%? 또는 5분 wait?)"
```

### 근본 원인
- AI: 비즈니스 위험도/SLA 기준이 모호하면 판단 불가
- 실시간 메트릭 변화와 자동화 판단 연계 어려움

### 현재 해결방식
- ❌ 사람이 메트릭 모니터링 중 수동 결정

### Phase 2 보완 전략
- ✅ **Rollback-Agent 에이전트** + **Decision-Rule Engine**
  - 입력: 실시간 메트릭 (에러율, 응답시간, 스토리지 사용량)
  - 처리:
    1. SLA 임계값 정의 (설정 파일)
    2. 카나리 기간 메트릭 수집
    3. 베이지안 의사결정 모델로 롤백 필요성 판단
  - 출력: "롤백 권장도 85%, 원인: 에러율 4.2% > SLA 3.0%"
  - 증명: 과거 배포 로그로 정확도 검증

---

## 5️⃣ 보안 취약점 자동 감지 부족

### 증상
```
코드 리뷰에서 발견되지 않는 취약점:
- SQL Injection 변형 (동적 쿼리)
- 경쟁 조건 (Race Condition)
- 권한 검증 누락 (Authorization Bypass)
```

### 근본 원인
- AI: 컨텍스트 제약으로 전체 코드베이스 흐름 분석 불가
- 보안은 "부정적 증명"이 필요한데, LLM은 긍정적 생성만 가능

### 현재 해결방식
- ❌ 사람의 수동 리뷰 또는 제한적 린터

### Phase 2 보완 전략
- ✅ **Security-Scanner 에이전트** 배포
  - 입력: 전체 코드베이스
  - 처리:
    1. 정적 분석 도구 연계 (SAST: Bandit, Semgrep 등)
    2. 의존성 검사 (CVE DB 조회)
    3. OWASP Top 10 패턴 매칭
    4. AI가 컨텍스트 기반 재분석
  - 출력: 취약점 등급화 (Critical/High/Medium/Low) + 패치 제안
  - 증명: 감사 리포트 + 패치율 추적

---

## 6️⃣ 성능 프로파일링 자동화 부족

### 증상
```
"FreeLang 컴파일러가 느려졌다는데, 정확히 어디가?"
- Lexer? Parser? Codegen? VM?
- 함수별 시간 분산 미파악
```

### 근본 원인
- AI: 프로파일링 데이터 해석 후 적절한 최적화 제안 어려움

### 현재 해결방식
- ❌ 사람이 `perf` / `flamegraph` 등으로 수동 분석

### Phase 2 보완 전략
- ✅ **Performance-Profiler 에이전트** 배포 (2주차)
  - 입력: 벤치마크 실행 + 프로파일링 데이터
  - 처리:
    1. 핫스팟 자동 감지 (상위 5개 함수)
    2. 병목 원인 가설 생성
    3. 최적화 코드 생성 및 A/B 테스트
  - 출력: 최적화 코드 + 성능 개선율

---

## 📋 종합 보완 로드맵

| 한계점 | 에이전트 | 구현시기 | 성과 증명 |
|--------|---------|---------|---------|
| 타입 추론 | Type-Checker | 2026-04-23 | 테스트 통과율 95%+ |
| DB 동시성 | SQL-Optimizer | 2026-04-16 | Req/sec 10배+ 향상 |
| 가격 예측 | ML-Pipeline | 2026-04-30 | 실제 수익 비교 검증 |
| 롤백 판단 | Rollback-Agent | 2026-05-07 | 오판 제로 기록 |
| 보안 감지 | Security-Scanner | 2026-04-23 | 감사 리포트 + CVE 제로 |
| 성능 최적화 | Performance-Profiler | 2026-05-14 | 성능 개선율 기록 |

---

## 🔄 피드백 루프

각 에이전트 배포 후:
1. **OUTPUT_PROOF.md**에 성과 기록
2. **AI_LIMITS.md** 업데이트 (새로운 한계점 발견 시)
3. **DECISION_LOG.md**에 개선사항 반영
4. **다음 에이전트** 설계에 피드백 적용
