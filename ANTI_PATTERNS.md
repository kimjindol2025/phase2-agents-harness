# 반복 문제 패턴 가이드 (Anti-Patterns)

**작성일**: 2026-04-04
**기반**: 13개 프로젝트 검수 (8,000줄)
**목표**: 조직의 반복 문제를 자동으로 감지 및 해결

---

## 📊 반복 문제 분석 (6가지)

### 🔴 1순위: 보안 문제 (10개 이슈, 빈도 62%)

**문제 1: 입력 검증 부재**

```
출현: gogs-server-fl2, gogs-cli, estimate-engine, freelang-korean, bigwash
근본 원인: validation 표준 라이브러리 없음
영향: 보안 취약점, DoS 공격 가능
```

**해결책**:
```freeling
// validation.fl 모듈
fn validate_string(s: str, max_len: i32, pattern: str) -> bool
fn validate_number(n: i32, min: i32, max: i32) -> bool
fn validate_email(email: str) -> bool
fn validate_url(url: str) -> bool
fn validate_file_path(path: str) -> bool
```

**체크리스트**:
- [ ] 모든 public 함수 입력 검증
- [ ] 길이 체크 (max_len)
- [ ] 타입 체크
- [ ] 범위 체크 (min/max)
- [ ] 형식 체크 (정규식)

---

**문제 2: 인증/암호화 미흡**

```
출현: gogs-server-fl2, gogs-cli, bigwash, freelang-v2
근본 원인: crypto 표준 미정의
영향: 암호 탈취, 토큰 위조
```

**해결책**:
```
1. JWT: 검증 필수 (signature, expiry)
2. 패스워드: bcrypt 또는 PBKDF2 (salt 필수)
3. 토큰: HMAC-SHA256 (최소 256비트)
4. 파일 권한: 0600 (소유자만 읽기)
```

**체크리스트**:
- [ ] JWT signature 검증
- [ ] JWT expiry 검증
- [ ] 패스워드 해싱 (bcrypt)
- [ ] 토큰 파일 권한 확인 (chmod 0600)
- [ ] 보안 감사 리포트

---

### 🟡 2순위: 아키텍처 문제 (8개 이슈, 빈도 38%)

**문제 1: 순환 의존성**

```
출현: freelang-v2 (30개), v9-database, gogs-server-fl2, freelang-korean, ai-harness
근본 원인: 초기 설계 단계에서 계층 분리 미흡
영향: 리팩토링 어려움, 테스트 불가능
```

**감지 방법**:
```
1. 의존성 그래프 생성
2. 사이클 검출 (DFS)
3. 깊이 계산 (허용: 3계층 이하)
4. 금지 패턴:
   - 파서 → 렉서 (역방향)
   - 라우팅 → 인증 → 라우팅
   - 데이터 → 캐시 → 데이터
```

**해결책**:
```
좋은 구조:
  Controller → Service → Repository
  Parser ← Lexer
  Orchestrator → Agent

나쁜 구조:
  Parser → Lexer → Parser (순환)
  Service → Controller → Service (순환)
```

**체크리스트**:
- [ ] 의존성 다이어그램 확인
- [ ] 사이클 검출 (0개)
- [ ] 계층 깊이 (≤3)
- [ ] 단방향 의존성

---

**문제 2: 기술 부채 누적**

```
출현: 모든 프로젝트 (100%)
근본 원인: MVP 우선, 리팩토링 미실시
영향: 개발 속도 저하, 버그 증가
```

**기술 부채 측정**:
```
1. 테스트 커버리지 < 80%
2. 중복 코드 > 10%
3. 복잡도 (순환) > 10
4. 문서 미완성 > 30%
5. TODO/FIXME 주석 > 10개
```

**해결책**:
```
정기 정리 스프린트 (2주마다)
- 테스트 작성 (커버리지 +10%)
- 중복 제거 (DRY 원칙)
- 복잡도 감소 (함수 분리)
- 문서화 (README, API)
- TODO 해결
```

---

### ⚡ 3순위: 성능 문제 (5개 이슈, 빈도 31%)

**문제: N+1 쿼리 / 병렬화 부재**

```
출현: v9-database, freelang-bootstrap, gogs-cli, estimate-engine
근본 원인: 성능 테스트 자동화 부재
영향: 응답 시간 10-100배 증가
```

**감지 방법**:
```
1. 루프 내 쿼리/API 호출 감지
2. 전역 상태 변경 감지 (병렬화 불가)
3. 배치 엔진 미사용 감지
4. 응답 시간 벤치마크 (목표: <100ms)
```

**해결책**:
```
1. Batch API (GetSummary, GetMany)
2. 캐싱 (Redis, in-memory)
3. 병렬 처리 (goroutines, async)
4. 인덱싱 (database, hash)
```

**체크리스트**:
- [ ] 루프 내 쿼리 0개
- [ ] 배치 엔진 사용
- [ ] 응답 시간 < 100ms
- [ ] 병렬화 가능 (전역 상태 최소화)

---

### 📝 4순위: 테스트 부족 (10개 이슈, 빈도 46%)

**문제 1: 자동화 테스트 부재**

```
출현: gogs-cli, gogs-server-fl2, freelang-v2, api-handlers
근본 원인: 테스트 작성 가이드/템플릿 부재
영향: 배포 준비도 <60%
```

**해결책**:
```freeling
// 테스트 템플릿
fn test_valid_input() { /* 기본 케이스 */ }
fn test_invalid_input() { /* 경계값 */ }
fn test_edge_cases() { /* 엣지 케이스 */ }
fn test_performance() { /* 성능 */ }
fn test_integration() { /* 통합 */ }
```

**최소 요구사항**:
```
- 단위 테스트: 10개
- 통합 테스트: 3개
- 커버리지: ≥80%
- 엣지 케이스: ≥5개
```

---

**문제 2: 엣지 케이스 미처리**

```
출현: test-suite, freelang-korean, estimate-engine, v9-database
근본 원인: 엣지 케이스 가이드 부재
영향: 프로덕션 버그 증가
```

**필수 테스트 케이스**:
```
문자열: ["", " ", "\n", max_length, special_chars]
숫자: [0, -1, 매우큰수, 소수, NaN, Infinity]
배열: [[], [1개], null, undefined]
객체: [{}, {partial}, circular_ref]
날짜: [과거, 미래, leap_year, timezone]
파일: [비어있음, 매우큼, 특수문자, 권한없음]
```

**체크리스트**:
- [ ] 빈 입력 테스트
- [ ] 경계값 테스트
- [ ] NULL/undefined 테스트
- [ ] 타입 오류 테스트
- [ ] 성능 테스트 (대용량)

---

### 📚 5순위: 문서화 부족 (10개 이슈, 빈도 23-38%)

**문제 1: 마이그레이션 가이드 부재**

```
출현: freelang-v2 (80시간), bigwash, freelang-v9
근본 원인: 버전 관리 정책 미정의
```

**필수 문서**:
```
MIGRATION.md:
1. v1 → v2 마이그레이션
2. 호환성 매트릭스
3. 자동 변환 도구
4. 주의사항 및 버그 픽스
5. 지원 기간 명시
```

---

**문제 2: API 문서 불완전**

```
출현: gogs-server-fl2 (25개 설계, 10개 작동), v9-database, gogs-cli
근본 원인: API 우선 설계(API-First) 미실시
```

**해결책**:
```
1. OpenAPI/AsyncAPI 정의
2. 자동 문서 생성 (Swagger)
3. 예제 코드 (각 언어)
4. 에러 응답 정의
5. 성능 가이드
```

---

### 🎯 6순위: 타입/에러 처리 (8개 이슈, 빈도 31-38%)

**문제 1: 타입 안정성 부족**

```
출현: freelang-v9, api-handlers, estimate-engine, test-suite
근본 원인: 언어 설계 시 타입 시스템 미고려
```

**해결책**:
```
1. 정적 타입 지원 (TypeScript, Rust)
2. 타입 캐스팅 순서 검사
3. 부동소수점 비교 (epsilon 기반)
4. Linter (타입 검사)
```

---

**문제 2: 에러 처리 패턴 불일치**

```
출현: freelang-v9, gogs-server-fl2, bigwash, api-handlers
근본 원인: 에러 처리 표준 없음
```

**표준 에러 처리**:
```freeling
enum Error {
    ValidationError(msg: str),
    AuthError(msg: str),
    NotFoundError(id: str),
    ServerError(msg: str),
    // ...
}

fn handle_error(err: Error) -> HTTPResponse {
    match err {
        ValidationError(msg) → 400 Bad Request
        AuthError(msg) → 401 Unauthorized
        NotFoundError(id) → 404 Not Found
        ServerError(msg) → 500 Internal Server Error
    }
}
```

---

## 🔍 자동 감지 규칙 (Harness Integration)

### security-scanner에서:
```
✓ 입력 검증 없는 함수 (length, type, range, format)
✓ 패스워드 평문 저장
✓ 토큰 파일 권한 (chmod < 0600)
✓ SQL injection, XSS 위험 패턴
✓ 암호화 라이브러리 부재
```

### code-analyzer에서:
```
✓ 순환 의존성 (DFS 사이클 검출)
✓ 계층 깊이 > 3
✓ 복잡도 (순환복잡도 > 10)
✓ 중복 코드 (> 10%)
✓ 타입 캐스팅 오류
```

### test-generator에서:
```
✓ 자동화 테스트 부재
✓ 엣지 케이스 미포함
✓ 커버리지 < 80%
✓ 엣지 케이스 가이드 자동 생성
```

### document-generator에서:
```
✓ API 문서 불완전
✓ MIGRATION.md 부재
✓ 에러 응답 정의 부재
✓ 자동 문서 생성
```

### architecture-analyzer에서:
```
✓ 순환 의존성 시각화
✓ 계층 분리 분석
✓ 모듈 결합도 측정
✓ 개선 제안
```

---

## 📋 Code Review 체크리스트

```
보안:
[ ] 입력 검증 (길이, 타입, 범위, 형식)
[ ] 인증 (JWT 검증, 토큰 파일 권한)
[ ] 암호화 (bcrypt, HMAC-SHA256)

아키텍처:
[ ] 순환 의존성 0개
[ ] 계층 깊이 ≤ 3
[ ] 복잡도 < 10
[ ] 중복 코드 < 10%

성능:
[ ] 루프 내 쿼리 0개
[ ] 배치 API 사용
[ ] 응답 시간 < 100ms

테스트:
[ ] 자동화 테스트 (10개)
[ ] 엣지 케이스 (≥5개)
[ ] 커버리지 ≥ 80%

문서:
[ ] API 문서 완성
[ ] 마이그레이션 가이드
[ ] 에러 응답 정의
[ ] 성능 가이드

에러 처리:
[ ] 에러 정의 (enum)
[ ] 에러 처리 (match/switch)
[ ] HTTP 상태 코드 정확
[ ] 에러 메시지 명확
```

---

## 🎯 해결책 로드맵

### 1주: 긴급 (3시간)
1. validation.fl 모듈 → 모든 프로젝트 배포
2. SECURITY.md 정책 수립
3. Testing.md 가이드

### 2주: 단기 (8시간)
1. Architecture Guide 작성
2. Error Handling Template 배포
3. API-First 도구 (OpenAPI)

### 1개월: 중기 (40시간)
1. GitHub Actions CI/CD
2. 성능 벤치마크 (자동 N+1 감지)
3. 타입 검사 (TypeScript)
4. Code Review 체크리스트

---

## 💡 핵심 인사이트

> **반복 문제는 개인의 실수가 아니라 조직의 표준 부재입니다.**

```
문제 없음 = 좋은 개발자 ✗
표준 있음 = 좋은 조직 ✓
```

조직이 표준을 제공하면:
- 개발자의 부담 감소 (매번 새로 작성 X)
- 일관성 향상 (버그 감소)
- 중복 제거 (생산성 향상)
- 품질 향상 (자동 검사)

---

**최종 목표**: phase2-agents-harness 하네스를 통해 13개 프로젝트의 모든 반복 문제를 **자동으로 감지 및 해결**하는 메타-시스템 구축

