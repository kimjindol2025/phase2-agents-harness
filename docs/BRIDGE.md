# FreeLang-TypeScript 브리지 문서

## 개요

**브리지**는 FreeLang (.fl) 에이전트 파일을 TypeScript 환경에서 실행하고 검증하는 시스템입니다.

### 핵심 목표

1. **AI 제어 구조화**: LLM 없이도 에이전트가 일관되게 작동하는가?
2. **증명 중심**: 모든 실행 결과는 증명 파일(`_PROOF.md`)로 기록됨
3. **독립적 검증**: 4가지 성공 기준으로 객관적 평가

---

## 아키텍처

### 3계층 모델

```
┌─────────────────────────────────┐
│  프롬프트 (LLM 입력)             │
└──────────┬──────────────────────┘
           │
┌──────────▼─────────────────────┐
│  Orchestrator (하네스)          │
│  - AgentRegistry               │
│  - AgentRun (구조)             │
│  - proof_output() 함수          │
└──────────┬──────────────────────┘
           │
┌──────────▼─────────────────────┐
│  TypeScript 브리지 (현재)       │
│  - FlParser (정적 분석)        │
│  - ResultValidator (검증)      │
│  - FreeLangBridge (실행)       │
└──────────┬──────────────────────┘
           │
┌──────────▼─────────────────────┐
│  에이전트 구현 (.fl 파일)       │
│  - parser.fl                   │
│  - analyzer.fl                 │
│  - proof.fl                    │
└─────────────────────────────────┘
```

### 실행 모드

| 모드 | 설명 | 상태 |
|------|------|------|
| `mock` | 정적 분석 기반 모의 실행 | ✅ 현재 |
| `subprocess` | FreeLang CLI로 실제 실행 | 🟡 준비 중 |
| `wasm` | WASM 컴파일로 실행 | 🟡 미래 |

---

## 사용 방법

### 1. 에이전트 실행

```bash
# TypeScript 경로로 실행
npm run bridge -- {agent-id}

# 또는 직접 실행
ts-node src/bridge/freelang-bridge.ts {agent-id} [mode]
```

**출력**:
```json
{
  "status": "success",
  "agentId": "code-analyzer",
  "executionTimeMs": 234,
  "results": {
    "accuracy": 0.95,
    "detectionRate": 0.88,
    "falsePositive": 0.03,
    "executionTime": 234
  }
}
```

### 2. 에이전트 검증

```bash
# harness-validate 명령어
/harness-validate {agent-id}

# 또는 직접 호출
npm test -- --testPathPattern="{agent-id}"
```

**출력**:
```
✓ [검증 1] 3파일 패턴: ✅ 3파일
✓ [검증 2] 파일명 규칙: ✅ parser.fl, analyzer.fl, proof.fl
✓ [검증 3] 성공기준: ✅ 4가지 모두 포함
✓ [검증 4] npm test: ✅ 통과
```

### 3. 증명 파일 생성

```bash
# harness-proof 명령어
/harness-proof {agent-id}
```

**생성 파일**: `proofs/{agent-id}_PROOF.md`

```markdown
# code-analyzer 증명 파일

**작성 날짜**: 2026-04-06T15:30:00.000Z
**에이전트 ID**: code-analyzer

## 성공기준 4가지

| 기준 | 목표 | 실측 | 상태 |
|------|------|------|------|
| 정확도 | ≥ 90% | 95.00% | ✅ |
| 발견율 | ≥ 85% | 88.00% | ✅ |
| 거짓양성률 | ≤ 5% | 03.00% | ✅ |
| 실행시간 | ≤ 5000ms | 234ms | ✅ |

**최종 상태**: ✅ 배포 준비 완료
```

---

## 4가지 성공 기준

### 1. 정확도 (Accuracy) ≥ 90%

에이전트가 올바르게 판단하는 비율

```freelang
// proof.fl에서
accuracy: 0.95  // 95% 정확도
```

### 2. 발견율 (Detection Rate) ≥ 85%

에이전트가 문제/결함을 감지하는 비율

```freelang
detection_rate: 0.88  // 88% 발견율
```

### 3. 거짓양성률 (False Positive) ≤ 5%

에이전트가 잘못된 알람을 발생시키는 비율 (낮을수록 좋음)

```freelang
false_positive: 0.03  // 3% 거짓양성
```

### 4. 실행시간 (Execution Time) ≤ 5000ms

에이전트가 작업을 완료하는 시간 (빠를수록 좋음)

```freelang
execution_time: 234  // 234ms (milliseconds)
```

---

## 에이전트 구조 (3파일 패턴)

### parser.fl: 입력 파싱

```freelang
struct ParserInput {
  code: str
  language: str
}

struct ParserOutput {
  tokens: int
  ast: str
}

fn parse(input: ParserInput) -> ParserOutput {
  // 파싱 로직
  return ParserOutput {
    tokens: count_tokens(input.code),
    ast: build_ast(input.code)
  }
}
```

### analyzer.fl: 분석 수행

```freelang
struct AnalysisInput {
  ast: str
  rules: [str]
}

struct AnalysisResult {
  issues: [str]
  severity: str
}

fn analyze(input: AnalysisInput) -> AnalysisResult {
  // 분석 로직
  var issues = find_violations(input.ast, input.rules)
  return AnalysisResult {
    issues: issues,
    severity: calculate_severity(issues)
  }
}
```

### proof.fl: 성공 기준 선언

```freelang
# Code Analyzer 증명

## 성공 기준

정확도: 95% (목표 90% 이상)
발견율: 88% (목표 85% 이상)
거짓양성: 3% (목표 5% 이하)
실행시간: 234ms (목표 5000ms 이하)

fn verify_success() -> bool {
  return accuracy >= 0.90 && detection_rate >= 0.85
}
```

---

## 워크플로우

### 전체 흐름

```
1. /harness-new-agent {id}
   └─> agents-impl/{id}/ 생성
       - parser.fl (스켈레톤)
       - analyzer.fl (스켈레톤)
       - proof.fl (스켈레톤)

2. 개발자가 .fl 파일 구현

3. /harness-validate {id}
   ├─> 3파일 패턴 확인 ✅
   ├─> 파일명 규칙 확인 ✅
   ├─> 성공기준 포함 확인 ✅
   └─> npm test 실행 ✅

4. npm test 통과 (프로토콜: 4가지 기준 모두 ✅)

5. /harness-proof {id}
   ├─> 정적 분석 실행 (mock 모드)
   ├─> 성공 기준 검증
   ├─> proofs/{id}_PROOF.md 생성
   └─> OUTPUT_PROOF.md 업데이트

6. /commit-validated
   └─> git commit -m "feat: [AGENT-{id}] ..." (자동 증명 포함)

7. git push
   └─> Gogs + GitHub 동기화
```

---

## 정적 분석 (Mock 모드)

### 원리

1. **파일 로드**: 3개 .fl 파일 읽기
2. **정규식 분석**: 성공 기준 추출
3. **값 검증**: 4가지 기준 충족 확인
4. **결과 생성**: 증명 파일 작성

### 예시

```
proof.fl 내용:
└─> "accuracy: 0.95"
    └─> 정규식: /accuracy.*?([0-9.]+)/
        └─> 추출: 0.95
            └─> 검증: 0.95 >= 0.90? ✅

증명 파일:
└─> "정확도 | ≥ 90% | 95.00% | ✅"
```

---

## 테스트

### 테스트 스위트

```bash
# 전체 테스트
npm test

# 브리지 테스트만
npm test -- --testPathPattern=bridge

# 상세 로그
npm test -- --verbose
```

### 테스트 케이스 (12개)

#### agent execution (5개)
- ✅ should successfully run a valid agent
- ✅ should extract accuracy from proof.fl
- ✅ should extract detection rate from proof.fl
- ✅ should extract false positive rate from proof.fl
- ✅ should extract execution time from proof.fl

#### validation (2개)
- ✅ should validate correct agent structure
- ✅ should reject agent with invalid structure

#### result validation (5개)
- ✅ should pass when all criteria are met
- ✅ should fail when accuracy is below target
- ✅ should fail when detection rate is below target
- ✅ should fail when false positive rate exceeds target
- ✅ should fail when execution time exceeds target

---

## 문제 해결

### 에러 메시지

| 에러 | 원인 | 해결책 |
|------|------|--------|
| `file_not_found` | 3파일 중 누락 | `/harness-new-agent {id}` 재실행 |
| `invalid_structure` | 파일명 규칙 위반 | kebab-case 확인, 파일명 수정 |
| `runtime_error` | FreeLang 문법 오류 | .fl 파일 문법 검토 |
| `criteria_not_met` | 성공 기준 미충족 | proof.fl 값 수정 후 재실행 |

### 디버깅 팁

```bash
# Verbose 모드
ts-node src/bridge/freelang-bridge.ts {agent-id} --verbose

# 에이전트 구조 확인
ls -la agents-impl/{agent-id}/

# 증명 파일 확인
cat proofs/{agent-id}_PROOF.md
```

---

## 다음 단계

### Phase 2 (현재)
- ✅ Mock 모드 구현
- ✅ 정적 분석 기반 검증
- ✅ 증명 파일 자동 생성
- ⏳ Subprocess 모드 준비

### Phase 3 (2026-05)
- ⏳ FreeLang CLI 연동 (subprocess 모드)
- ⏳ 실제 에이전트 실행
- ⏳ 성능 벤치마킹

### Phase 4 (2026-06)
- ⏳ WASM 컴파일
- ⏳ 브라우저 환경 지원
- ⏳ 분산 실행

---

## 참고

- **orchestrator.fl**: 하네스 엔진의 중심
- **DECISION_LOG.md**: 설계 결정 기록
- **AI_LIMITS.md**: AI 한계점 분석
