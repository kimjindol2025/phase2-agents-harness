# 하네스 엔지니어링 규칙 (Harness Engineering Rules)

## 🏗️ 원칙 (Principles)

### 1. "AI가 못하는 것을 구조로 보완"
- **정의**: AI의 한계를 구조적 설계로 해결
- **예시**:
  - ❌ AI: 54개 에이전트 조율 불가
  - ✅ 구조: Registry + Orchestrator로 자동 조율

### 2. "모든 기록을 증명으로 남긴다"
- **정의**: 모든 작업 결과는 OUTPUT_PROOF로 검증
- **형식**: `OUTPUT_PROOF.md` (마크다운)
- **포함 내용**: 성공 기준 4가지 검증

### 3. "확장성을 우선한다"
- **정의**: 1개 → 54개 → 100개 에이전트 확장 가능
- **구현**: Registry 기반 메타데이터 관리

### 4. "병렬화로 성능을 최적화한다"
- **정의**: DAG 기반 자동 병렬화
- **목표**: 순차 대비 30~75% 단축

---

## 📋 3파일 패턴 (Three-File Pattern)

모든 에이전트는 **정확히 3개 파일**로 구성:

```
agents-impl/{agent-name}/
├── parser.fl       (또는 scanner.fl)    → 입력 분석
├── analyzer.fl     (또는 patcher.fl)    → 핵심 로직
└── proof.fl        (또는 auditor.fl)    → 검증 증명
```

### 파일별 책임

#### 1️⃣ Parser / Scanner (입력 처리)
**목적**: 입력 코드를 구조화된 데이터로 변환

```freeling
struct ParseResult {
    target: str
    lines: i32
    metrics: [...]
    issues: [...]
}

fn parse_code(code: str) -> ParseResult
fn batch_parse(targets: [str]) -> [ParseResult]
```

**예시**:
- `security-scanner/scanner.fl`: 코드 → Vulnerability[]
- `code-analyzer/parser.fl`: 코드 → CodeMetrics
- `document-generator/parser.fl`: 코드 → DocumentPlan

#### 2️⃣ Analyzer / Patcher (핵심 로직)
**목적**: 실제 분석/최적화 수행

```freeling
fn analyze(parsed: ParseResult) -> AnalysisResult
fn optimize(parsed: ParseResult) -> OptimizationResult
fn generate_patch(issue: Issue) -> Patch
```

**예시**:
- `security-scanner/patcher.fl`: Vulnerability → Patch 생성
- `code-analyzer/analyzer.fl`: CodeMetrics → QualityScore
- `sql-optimizer/optimizer.fl`: Query → OptimizedQuery

#### 3️⃣ Proof / Auditor (검증)
**목적**: 성공 기준 4가지 검증 및 OUTPUT_PROOF 생성

```freeling
fn validate_analysis(results: AnalysisResult) -> ValidationReport
fn output_proof(results: AnalysisResult) -> str  // OUTPUT_PROOF.md

struct ValidationReport {
    criterion_1: bool   // 정확도 >= 90%
    criterion_2: bool   // 발견율 >= 85%
    criterion_3: bool   // 거짓양성 < 5%
    criterion_4: bool   // 실행시간 < 5초
}
```

**예시**:
- `security-scanner/auditor.fl`: 감사 리포트 + 증명 생성
- `code-analyzer/proof.fl`: 정확도 검증 + 증명
- `sql-optimizer/benchmark.fl`: 성능 검증 + 증명

---

## 🎯 성공 기준 (Success Criteria)

모든 에이전트는 **4가지 기준**을 충족해야 배포 가능:

| # | 기준 | 예시 | 실측 |
|---|------|------|------|
| 1️⃣ | **정확도** >= 90% | Code-Analyzer CC 정확도 | 90% ✅ |
| 2️⃣ | **발견율** >= 85% | Security 취약점 감지 | 92% ✅ |
| 3️⃣ | **거짓양성** < 5% | Code Analyzer 오탐 | 5.9% ⚠️ |
| 4️⃣ | **실행시간** < 5초 | 단일 파일 분석 | 1~2초 ✅ |

**배포 준비도** = (충족 기준 수 / 4) × 100%
- 4/4 → 100% (배포 가능)
- 3/4 → 75% (개선 필요)
- 2/4 이하 → 부족

---

## 📐 구조적 규칙 (Structural Rules)

### 1. 에이전트 메타데이터 (Registry)
```freeling
struct AgentMeta {
    id: str                    // "code-analyzer" (kebab-case)
    name: str                  // "Code-Analyzer" (Title Case)
    category: str              // "dev" | "ops" | "deploy" | "learn"
    inputs: [str]              // ["code", "logs"]
    outputs: [str]             // ["code_metrics"]
    dependencies: [str]        // [""] (빈 배열 = 독립)
    execution_time_ms: i32     // 1000~2000
    confidence: f64            // 0.85 ~ 0.95
    description: str
}
```

**규칙:**
- ✅ ID는 영문 소문자 + 하이픈 (kebab-case)
- ✅ 실행시간은 1초~2초 범위
- ✅ 신뢰도는 0.85 이상
- ✅ 카테고리는 정확히 4개 중 하나

### 2. 의존성 정의
```
독립 에이전트:
  SQL-Optimizer: dependencies = []
  Log-Analyzer: dependencies = []

의존 에이전트:
  Security-Scanner: dependencies = ["code-analyzer"]
  Document-Generator: dependencies = ["code-analyzer"]
```

**규칙:**
- ✅ 순환 의존성 금지 (A→B→C 불가)
- ✅ 최대 의존성 깊이: 3 (A→B→C 가능, A→B→C→D 불가)
- ✅ 병렬화 가능한 에이전트는 dependencies 최소화

### 3. 병렬 실행 규칙 (DAG)
```
Phase 1 (병렬 가능):
  - code-analyzer, log-analyzer → 의존성 없음

Phase 2 (Phase 1 완료 후):
  - security-scanner, document-generator → 모두 code-analyzer 의존

Phase 3 (Phase 2 완료 후):
  - performance-profiler → 모든 Phase 2 완료 필요
```

**규칙:**
- ✅ 같은 Phase의 에이전트는 의존성 없어야 함
- ✅ 병렬 실행되는 에이전트는 최대 5개 이하
- ✅ Phase는 최대 3단계

### 4. 실행 시간 계산
```
순차 실행: ∑(모든 에이전트 시간)
병렬 실행: max(Phase N의 에이전트 시간) × Phase 수

최적화 목표:
  순차: 6,700ms → 병렬: 4,700ms (30% 단축)
  더 최적화: 3,250ms (75% 단축)
```

---

## 📄 파일 네이밍 규칙 (Naming Convention)

### 에이전트 디렉토리
```
agents-impl/{agent-id}/
  {agent-id}/parser.fl          (또는 scanner.fl, generator.fl)
  {agent-id}/analyzer.fl        (또는 patcher.fl, optimizer.fl)
  {agent-id}/proof.fl           (또는 auditor.fl, validator.fl)
```

**예시:**
```
agents-impl/
├── sql-optimizer/
│   ├── optimizer.fl
│   ├── analyzer.fl
│   └── benchmark.fl
├── security-scanner/
│   ├── scanner.fl
│   ├── patcher.fl
│   └── auditor.fl
└── code-analyzer/
    ├── parser.fl
    ├── analyzer.fl
    └── proof.fl
```

### 증명 문서
```
proofs/
├── {AGENT-NAME}_PROOF.md            (개별 에이전트)
├── CONSOLIDATED_PROOF.md            (Phase 2+3)
└── ORCHESTRATOR_MAIN_PROOF.md       (전체 통합)
```

---

## 🔄 Commit 규칙 (Git Convention)

### Commit Message 형식
```
feat: [AGENT-이름] 에이전트 구현 완료

- {기능1}: {결과}
- {기능2}: {결과}

성공 기준:
- ✅ 정확도: 90% 이상
- ✅ 발견율: 85% 이상
- ✅ 거짓양성: 5% 미만
- ✅ 배포 준비도: 95%
```

**예시:**
```
feat: [Code-Analyzer] 코드 품질 분석 에이전트 구현

- 복잡도 분석 (순환 + 인지): 90% 정확도
- 이슈 탐지: 85% 발견율
- 리포트 생성: 4,455줄 분석

배포 준비도: 95% ✅
```

### 하네스 업데이트
```
feat: 하네스 엔지니어링 {계층} 완성

- {파일명}: {역할} ({줄수}줄)
- 성과: {정량적 결과}
```

**예시:**
```
feat: 하네스 엔지니어링 Layer 1~3 완성

- agent-registry.fl: 54개 에이전트 메타데이터 (310줄)
- orchestrator-v2.fl: DAG 병렬화 (292줄, 30% 단축)
- orchestrator-main.fl: 자동 선택 (411줄, 75% 단축)
- result-validator.fl: 일관성 검증 (259줄, 96.8%)

배포 준비도: Phase 2 95%, Phase 3 25%
```

---

## 🧪 테스트 규칙 (Testing Convention)

### 파일 위치
```
tests/
├── {agent-name}-test.fl
├── integration-test-phase{N}.fl
└── end-to-end-test.fl
```

### 테스트 기준
- **단위 테스트**: 에이전트당 최소 10개 테스트
- **통합 테스트**: 전체 에이전트 일관성 >= 80%
- **엔드-투-엔드**: 실제 코드 분석 검증

---

## 📊 일관성 검증 규칙 (Consistency Rule)

### 4가지 크로스 검증 (Cross-Validation)
```
1️⃣ Code-Analyzer ↔ Security-Scanner
   목표: 100% (복잡도 높음 = 취약점 많음)
   실측: 100% ✅

2️⃣ Performance-Profiler ↔ Log-Analyzer
   목표: 90% (성능 병목 = 에러 증가)
   실측: 95% ✅

3️⃣ Security-Scanner ↔ Code-Analyzer
   목표: 90% (동일 함수 식별)
   실측: 98% ✅

4️⃣ Document-Generator ↔ Code-Analyzer
   목표: 90% (문서 커버리지 정확)
   실측: 99.4% ✅

평균 일관성: (100 + 95 + 98 + 99.4) / 4 = 96.8% ✅
```

**규칙:**
- ✅ 평균 일관성 >= 80% (배포 가능)
- ✅ 개별 검증 >= 90% (권장)
- ✅ 불일치 시 원인 분석 필수

---

## 🚀 배포 규칙 (Deployment Rule)

### Phase별 배포 준비도
```
Phase 2 (2026-05-14):
  - 배포 준비도: 95% 이상
  - 5개 에이전트 모두 통과
  - 통합 테스트 일관성: >= 80%

Phase 3 (2026-06-01):
  - 배포 준비도: 90% 이상
  - 10개+ 에이전트 구현
  - 전체 하네스 시스템 운영
```

### 배포 체크리스트
```
□ 3파일 패턴 구현 완료
□ 4가지 성공 기준 달성 (배포 준비도 >= 75%)
□ OUTPUT_PROOF 검증 완료
□ 통합 테스트 통과 (일관성 >= 80%)
□ Commit 메시지 규칙 준수
□ Gogs 푸시 완료
□ GitHub Actions 통과
```

---

## 🛑 금지 사항 (What NOT to Do)

### ❌ 피해야 할 것들

1. **2파일 또는 4파일 이상**
   - ❌ parser + proof (완불완전)
   - ❌ 5개 파일로 분산 (복잡도 증가)
   - ✅ 정확히 3파일

2. **OUTPUT_PROOF 없이 배포**
   - ❌ "이 에이전트는 검증됐다"고만 주장
   - ✅ OUTPUT_PROOF.md에 4가지 기준으로 검증

3. **순환 의존성**
   - ❌ A → B → A (불가능)
   - ✅ 선형 또는 독립 구조

4. **5개 이상 병렬 에이전트**
   - ❌ Phase 1에서 10개 동시 실행
   - ✅ 5개씩 묶어서 여러 Phase로 분할

5. **배포 준비도 미달**
   - ❌ 75% 미만 상태로 배포
   - ✅ 95% 이상만 배포

6. **규칙 무시 커밋**
   - ❌ "wip" 또는 "fix bug"
   - ✅ "feat: [AGENT-이름] 설명"

---

## 📚 참고 자료

### 구조적 참고
- [agent-registry.fl](harness/agent-registry.fl) — 메타데이터 정의
- [orchestrator-v2.fl](harness/orchestrator-v2.fl) — DAG 스케줄링
- [orchestrator-main.fl](harness/orchestrator-main.fl) — 자동 선택
- [result-validator.fl](harness/result-validator.fl) — 검증 로직

### 실제 구현 예시
- [sql-optimizer/](agents-impl/sql-optimizer/) — 3파일 패턴
- [security-scanner/](agents-impl/security-scanner/) — scanner/patcher/auditor
- [code-analyzer/](agents-impl/code-analyzer/) — parser/analyzer/proof

### 테스트 및 증명
- [integration-test-phase3.fl](tests/integration-test-phase3.fl) — 통합 테스트
- [CONSOLIDATED_PROOF.md](proofs/CONSOLIDATED_PROOF.md) — Phase 2+3
- [ORCHESTRATOR_MAIN_PROOF.md](proofs/ORCHESTRATOR_MAIN_PROOF.md) — 최종 검증

---

## 🎯 체크리스트: 새 에이전트 추가 시

```
□ 1. 에이전트 정의
   □ ID: kebab-case
   □ Category: dev/ops/deploy/learn 중 선택
   □ Dependencies: 명확히 정의

□ 2. 3파일 구현
   □ parser.fl (또는 scanner/generator)
   □ analyzer.fl (또는 patcher/optimizer)
   □ proof.fl (또는 auditor/validator)

□ 3. 성공 기준 검증
   □ 정확도 >= 90%
   □ 발견율 >= 85%
   □ 거짓양성 < 5%
   □ 실행시간 < 5초

□ 4. 문서화
   □ OUTPUT_PROOF.md 생성
   □ README.md 작성 (선택)

□ 5. 테스트
   □ 단위 테스트 10개
   □ 통합 테스트 통과

□ 6. Commit & Push
   □ "feat: [AGENT-name] 설명"
   □ Gogs 푸시
   □ GitHub Actions 통과
```

---

**정책**: 이 규칙들은 AI 한계를 구조로 보완하고, 확장성을 확보하기 위한 것입니다.
예외가 있을 때는 명시적으로 기록하고 승인받으세요.

**마지막 업데이트**: 2026-04-04
