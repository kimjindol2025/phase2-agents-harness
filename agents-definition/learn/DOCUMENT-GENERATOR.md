# AGENT_SPEC: Document-Generator

## 에이전트 정보
- **이름**: Document-Generator
- **분류**: 학습 에이전트 (learn)
- **목표**: 코드 변경 및 git 이력에서 자동으로 문서화 (API 문서, CHANGELOG, 아키텍처 다이어그램)
- **우선순위**: 🔴 Phase 1 (2026-04-30 배포 목표)
- **상태**: 설계 중

---

## 담당 업무

### 입력 (Input)
```
1. Git 커밋 이력
   - 커밋 메시지
   - 변경 파일 목록
   - Diff (added/modified/deleted)

2. 코드베이스 구조
   - 함수/클래스 정의
   - 타입 정의 (Function Signature, Struct)
   - 주석 (상단 주석, inline 주석)

3. 문서 생성 정책
   - 자동 생성할 문서 유형 (API Doc, CHANGELOG, Architecture, ...)
   - 문서 포맷 (Markdown, HTML, Diagram 등)
   - 대상 청중 (개발자, 사용자, 의사결정자)
```

### 처리 로직
```
Step 1: Git 이력 분석 (AI)
  - 커밋 메시지 파싱 (Conventional Commits 형식)
  - 기능 추가(feat), 버그 수정(fix), 리팩토링(refactor) 분류
  - 영향받은 모듈/함수 추출

Step 2: 코드 구조 분석 (구조)
  - AST 파싱 (FreeLang, JavaScript 등)
  - 함수/클래스 시그니처 추출
  - 의존성 그래프 생성

Step 3: 문서 생성 (AI)
  - CHANGELOG.md: 버전별 변경 사항 자동 정리
  - API_REFERENCE.md: 공개 함수/클래스 문서화
  - ARCHITECTURE.md: 모듈 간 관계도 및 설명
  - CONTRIBUTING.md: 개발자 가이드 (코드 스타일, 워크플로우)

Step 4: 다이어그램 생성 (AI)
  - Mermaid 문법으로 아키텍처 다이어그램 생성
  - 함수 호출 흐름도 생성
  - 데이터 흐름도 생성

Step 5: 품질 검증 (구조)
  - 문서 링크 유효성 검사
  - 코드 예제 실행 가능성 검사
  - 문서 최신성 검증 (코드와 일치 여부)
```

### 출력 (Output)
```
1. 자동 생성 문서
   - CHANGELOG.md (버전 이력)
   - API_REFERENCE.md (공개 API)
   - ARCHITECTURE.md (시스템 구조)
   - CONTRIBUTING.md (기여 가이드)
   - TROUBLESHOOTING.md (문제 해결)

2. 다이어그램 (Mermaid)
   - 시스템 아키텍처 다이어그램
   - 함수 호출 흐름도
   - 상태 머신 다이어그램

3. 메타데이터
   - 마지막 업데이트 시점
   - 적용된 git 커밋 범위
   - 문서 버전

4. 검증 리포트
   - 링크 유효성 (깨진 링크 수)
   - 코드 예제 실행 결과
   - 문서 커버리지 (documented functions / total functions)
```

---

## 생성 대상 문서

### 1. CHANGELOG.md (버전 이력)
```markdown
# Changelog

## [v4.3.0] - 2026-04-30

### Added
- Feature A (에이전트 50개 역할 정의)
- Feature B (프롬프트 체인 엔진)

### Fixed
- Bug: SQL 쿼리 타임아웃 문제

### Changed
- Refactored database layer

### Security
- SQL Injection 취약점 패치
```

### 2. API_REFERENCE.md (API 문서)
```markdown
# API Reference

## Module: QueryOptimizer

### fn analyze_query(sql: String): QueryAnalysis
Analyzes a SQL query for performance issues.

**Parameters:**
- sql: SQL statement

**Returns:**
- QueryAnalysis: Analysis result with bottlenecks

**Example:**
\`\`\`
let analysis = analyze_query("SELECT * FROM repos");
\`\`\`
```

### 3. ARCHITECTURE.md (시스템 아키텍처)
```markdown
# Architecture

## Module Dependency Graph

\`\`\`mermaid
graph LR
  QueryAnalyzer --> SQLParser
  SQLParser --> IndexAdvisor
  IndexAdvisor --> PerformanceEstimator
\`\`\`
```

---

## 성공 기준

| 기준 | 목표 | 검증 방법 |
|------|------|---------|
| **CHANGELOG 정확도** | 100% (모든 중요 변경 포함) | 수동 검증 샘플 |
| **API 문서 커버리지** | Public API 95%+ | 코드 분석 (documented / total) |
| **링크 유효성** | 깨진 링크 0개 | 자동 링크 체크 |
| **코드 예제** | 실행 가능성 95%+ | CI/CD 테스트 실행 |
| **문서 최신성** | 커밋 후 24시간 내 업데이트 | 자동 생성 시간 측정 |
| **다이어그램 정확도** | 아키텍처 변경 반영율 100% | 수동 검증 |

---

## 에이전트 한계점 & 보완 구조

### AI 한계점
- ❌ 전체 코드베이스 컨텍스트 동시 분석 불가 (토큰 제한)
- ❌ 복잡한 다중 파일 의존성 분석 어려움
- ❌ 코드 변경의 비즈니스 의미 해석 불가

### 보완 구조 (자동화 + AI)
1. **Git 분석**: 자동 커밋 파싱 (구조)
2. **AST 파싱**: 코드 구조 추출 (구조)
3. **문서 생성**: AI가 의미있는 설명 작성 (AI)
4. **검증**: 링크 체크, 코드 실행 테스트 (구조)

---

## 구현 단계

### Week 1 (2026-04-23 ~ 2026-04-29)
- [ ] Git 커밋 파싱 엔진 개발 (FreeLang)
- [ ] Conventional Commits 파서 작성
- [ ] CHANGELOG 생성 로직 구현

### Week 2 (2026-04-30 ~ 2026-05-06)
- [ ] AST 기반 API 문서 추출
- [ ] Mermaid 다이어그램 생성
- [ ] ARCHITECTURE.md 자동 생성

### Week 3 (2026-05-07 ~ 2026-05-13)
- [ ] 링크 유효성 검사 구현
- [ ] 코드 예제 실행 테스트
- [ ] OUTPUT_PROOF.md 작성 (생성 문서 샘플)

---

## 배포 후 모니터링

```
자동화 운영:
- [ ] 매 주 자동으로 문서 재생성
- [ ] 깨진 링크 감지 시 알림
- [ ] 문서 커버리지 추적 (월별 리포트)
- [ ] 사용자 피드백 수집 (문서 유용성 평가)
```

---

## 부가 기능 (Phase 2 확장)

### Tutorial 자동 생성
```
커밋 이력에서:
"feat: add query optimizer"
→ 자동으로 "Query Optimizer 사용 방법" 튜토리얼 생성
```

### FAQ 자동 생성
```
이슈/PR 댓글 분석:
"어떻게 쿼리를 최적화하나요?"
→ "FAQ: 쿼리 최적화" 섹션 추가
```

### 포트폴리오 생성
```
모든 문서 + 메트릭을 통합:
→ "아키텍트 포트폴리오" PDF 생성
```
