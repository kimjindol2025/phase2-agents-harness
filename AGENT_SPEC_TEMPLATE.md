# 에이전트 스펙 템플릿

## 기본 정보

```yaml
agent_id: code-analyzer
name: "Code Analyzer"
category: dev
priority: high
version: 1.0
status: defined  # defined | implemented | tested | deployed
```

---

## 📝 역할 설명

### 목적
이 에이전트는 **[목적을 한 문장으로 설명]**합니다.

예: "코드를 분석하여 구조, 품질, 복잡도를 평가하고 개선 제안을 제시합니다."

### 해결하는 문제
- AI는 코드 전체 문맥을 한번에 이해하기 어려움
- 복잡도 계산이 일관되지 않음
- 이슈의 심각도 판단이 주관적

### 구조적 보완
- 정량적 메트릭(순환 복잡도, 인지 복잡도) 계산
- 구조화된 출력(JSON/구조체)
- 신뢰도 기반 필터링

---

## 🔌 입출력 인터페이스

### 입력 (Input)

```freeling
struct CodeAnalysisInput {
    code: str                  // 분석할 코드
    language: str              // "python" | "javascript" | "go" | "java" | "cpp"
    depth: str                 // "shallow" | "medium" | "deep"
    focus: str                 // "quality" | "performance" | "security" | "all"
    context: str               // 추가 맥락 (선택)
}
```

### 출력 (Output)

```freeling
struct CodeAnalysisOutput {
    analysis_id: str
    language: str
    timestamp: str

    // 코드 구조
    metrics: {
        lines_of_code: i32
        classes: i32
        functions: i32
        duplicate_lines: i32
    }

    // 복잡도
    complexity: {
        cyclomatic: i32              // 순환 복잡도 (목표: < 10)
        cognitive: i32               // 인지 복잡도 (목표: < 15)
        nesting_depth: i32           // 최대 중첩 (목표: < 4)
    }

    // 품질
    quality: {
        coverage: f64                // 테스트 커버리지 (목표: > 80%)
        maintainability_index: i32   // 유지보수 지수 (0-100, 목표: > 65)
        issues: {
            critical: i32
            high: i32
            medium: i32
            low: i32
        }
    }

    // 추천
    recommendations: [str]           // 개선 제안 (우선순위 순)

    // 증명
    proof: str                       // OUTPUT_PROOF 마크다운
}
```

---

## ✅ 성공 기준 (Success Criteria)

에이전트는 다음 4가지 기준을 **모두** 만족해야 배포 가능합니다.

### 기준 1: 정확도 >= 90%
- **측정**: 알려진 복잡도를 가진 코드 10개로 검증
- **기준**: 계산된 복잡도와 실제 복잡도 차이 < 10%
- **체크**: `proof_output()` 함수에서 검증

### 기준 2: 이슈 탐지율 >= 85%
- **측정**: 알려진 이슈를 포함한 코드 10개로 검증
- **기준**: 탐지한 이슈 수 >= (전체 이슈 × 0.85)
- **체크**: `proof_output()` 함수에서 검증

### 기준 3: 거짓 양성 < 10%
- **측정**: 깨끗한 코드 5개로 검증
- **기준**: 보고된 이슈 중 실제 이슈가 아닌 것 < 10%
- **체크**: `confidence >= 0.7` 필터링

### 기준 4: 성능 < 5초
- **측정**: 평균 500줄 코드 분석 시간
- **기준**: 분석 시간 < 5초
- **체크**: `analysis_time_ms < 5000`

---

## 📊 성과 증명 (OUTPUT_PROOF)

### 자동 생성 형식

```markdown
# OUTPUT_PROOF — Code-Analyzer

## 성공 기준 달성

### 1. 정확도 >= 90%
- **목표**: 90% 이상
- **실측**: 92%
- **달성**: ✅

### 2. 이슈 탐지율 >= 85%
- **목표**: 85% 이상
- **실측**: 88%
- **달성**: ✅

### 3. 거짓 양성 < 10%
- **목표**: 10% 미만
- **실측**: 7%
- **달성**: ✅

### 4. 성능 < 5초
- **목표**: 5초 미만
- **실측**: 3.2초
- **달성**: ✅

## 종합 평가
✅ **Status**: PRODUCTION READY
- 배포 준비도: 95%
```

---

## 🔗 의존성 (Dependencies)

### 선행 에이전트
- Language-Detector: 코드 언어 확인
- Complexity-Calculator: 복잡도 계산 엔진

### 후행 에이전트 (이 에이전트의 출력을 사용)
- Refactor-Suggester: 리팩토링 제안
- Architecture-Analyzer: 아키텍처 분석
- Performance-Improver: 성능 개선

---

## 🧪 테스트 계획

### Unit Test
```freeling
fn test_simple_function() {
    var code = "fn add(a, b) { return a + b }"
    var result = analyze_code(code, "javascript", "shallow")
    assert(result.complexity.cyclomatic == 1)
}

fn test_complex_function() {
    var code = "fn ... if ... else if ... for ... while ..."
    var result = analyze_code(code, "python", "deep")
    assert(result.complexity.cyclomatic > 5)
}
```

### Integration Test
```freeling
fn test_with_language_detector() {
    var input: CodeAnalysisInput = { code: "...", language: "auto" }
    var detected_lang = language_detector.detect(input.code)
    var result = analyze_code(input)
    assert(result.language == detected_lang)
}
```

### Performance Test
```freeling
fn test_performance() {
    var large_code = "..." + "..." * 1000  // 1000줄
    var start = time_now()
    var result = analyze_code(large_code, "python", "deep")
    var elapsed = time_now() - start
    assert(elapsed < 5000)  // 5초 이하
}
```

---

## 📈 성능 벤치마크

| 코드 크기 | 분석 시간 | 메모리 | 정확도 |
|----------|---------|--------|--------|
| 100줄 | 0.5초 | 5MB | 95% |
| 500줄 | 2.0초 | 15MB | 93% |
| 1000줄 | 3.5초 | 25MB | 92% |
| 5000줄 | 4.8초 | 50MB | 90% |

---

## 🚀 배포 체크리스트

- [ ] 코드 작성 (3파일: analyzer, optimizer, benchmark)
- [ ] 단위 테스트 (각 함수별)
- [ ] 통합 테스트 (의존성 에이전트와)
- [ ] 성능 테스트 (< 5초)
- [ ] 성공 기준 4개 모두 달성
- [ ] OUTPUT_PROOF.md 생성
- [ ] 문서 작성 (이 파일)
- [ ] 코드 리뷰
- [ ] Git 커밋
- [ ] Gogs 푸시

---

## 💬 예상 질문

### Q: "왜 이 에이전트가 필요한가?"
A: AI는 코드 전체를 동시에 분석하기 어렵고, 복잡도 계산이 일관되지 않습니다. 이를 정량적 메트릭으로 구조화하여 보완합니다.

### Q: "성공 기준이 너무 높은가?"
A: 아닙니다. 실제 정적 분석 도구(SonarQube, Pylint)는 95% 이상의 정확도를 달성합니다. 우리 기준은 현실적입니다.

### Q: "다른 에이전트와 어떻게 조율하나?"
A: Orchestrator v2에서 에이전트 간 데이터 공유 및 합의 메커니즘을 제공합니다.

---

## 📚 참고 자료

- [구환 복잡도 (Cyclomatic Complexity)](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [인지 복잡도 (Cognitive Complexity)](https://www.sonarsource.com/docs/cognitive-complexity/)
- [유지보수 지수 (Maintainability Index)](https://en.wikipedia.org/wiki/Maintainability_index)
