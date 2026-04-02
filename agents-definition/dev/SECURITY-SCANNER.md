# AGENT_SPEC: Security-Scanner

## 에이전트 정보
- **이름**: Security-Scanner
- **분류**: 개발 에이전트 (dev)
- **목표**: 전체 코드베이스 보안 취약점 자동 감지 및 패치 제안
- **우선순위**: 🔴 Phase 1 (2026-04-23 배포 목표)
- **상태**: 설계 중

---

## 담당 업무

### 입력 (Input)
```
1. 코드베이스
   - FreeLang v4 (lang/)
   - gogs-server-fl (server/)
   - gogs-cli-fl (cli/)
   - BigWash (app/)
   - 외 모든 프로젝트

2. 의존성 정보
   - package.json (npm)
   - go.mod (Go)
   - requirements.txt (Python) 등

3. 보안 기준
   - OWASP Top 10
   - CWE-25 (Common Weakness Enumeration)
   - 회사 보안 정책
```

### 처리 로직
```
Step 1: 정적 분석 (SAST) 실행 (구조)
  - 도구: Semgrep, Bandit, golangci-lint 등
  - 검사 대상: SQL Injection, XSS, Command Injection, ...
  - 결과: 취약점 목록 (파일, 라인, 심각도)

Step 2: 의존성 검사 (SCA) 실행 (구조)
  - 도구: npm audit, pip audit, snyk 등
  - 검사 대상: CVE, 라이선스 위반
  - 결과: 취약한 의존성 목록

Step 3: AI 컨텍스트 분석 (AI)
  - 발견된 취약점의 실제 위험도 재평가
  - False Positive 필터링
  - 비즈니스 영향도 분석 (가시성 있는가? 데이터 접근 가능한가?)

Step 4: 패치 제안 생성 (AI)
  - 취약점 유형별 패치 코드 생성
  - 테스트 케이스 작성
  - 리팩토링 제안 (장기적 해결)

Step 5: 검증 (구조)
  - 정적 분석으로 패치 검증 (재실행)
  - 테스트 통과 확인
  - 회귀 테스트 (기존 기능 유지 여부)
```

### 출력 (Output)
```
1. 보안 감사 리포트 (Markdown)
   - 발견된 취약점 요약 (Critical/High/Medium/Low)
   - 취약점 상세 설명 (CWE ID, 영향도)
   - 우선순위 순서

2. 패치 코드
   - 취약점별 패치 (security-scanner/patches/)
   - 자동 적용 스크립트 (security-scanner/apply-patches.sh)

3. 후속 조치 가이드
   - 즉시 패치 필요 항목 (Critical)
   - 계획된 패치 항목 (High/Medium)
   - 모니터링 필요 항목 (Low)

4. 메트릭
   - 발견된 취약점 수 (카테고리별)
   - 패치 적용율
   - 해결 소요 시간
```

---

## 보안 검증 항목

### OWASP Top 10 (2023)
- [ ] A01: Broken Access Control
- [ ] A02: Cryptographic Failures
- [ ] A03: Injection (SQL, Command, LDAP, OS)
- [ ] A04: Insecure Design
- [ ] A05: Security Misconfiguration
- [ ] A06: Vulnerable Components
- [ ] A07: Authentication Failures
- [ ] A08: Software & Data Integrity Failures
- [ ] A09: Logging & Monitoring Failures
- [ ] A10: SSRF

### FreeLang v4 특화 검증
- [ ] 문자열 보간 에서의 인젝션 위험
- [ ] 동적 코드 실행 보안
- [ ] 메모리 안전성 (C 바인딩)

---

## 성공 기준

| 기준 | 목표 | 검증 방법 |
|------|------|---------|
| **검출율** | OWASP 패턴 90%+ 감지 | 알려진 취약점으로 테스트 |
| **False Positive** | < 10% | 수동 검증 샘플 |
| **심각도 판단** | Critical 오판 제로 | 보안 팀 재검증 |
| **패치 적용율** | High 이상 100% 패치 | 프로덕션 배포 시점 확인 |
| **회귀** | 기존 테스트 통과율 100% | 자동 테스트 실행 |

---

## 에이전트 한계점 & 보완 구조

### AI 한계점
- ❌ 정적 분석 도구 출력 해석만 가능 (직접 분석 불가)
- ❌ False Positive 판단에 도메인 지식 필요
- ❌ 0-day 취약점 감지 불가 (알려진 패턴만 가능)

### 보완 구조 (도구 + AI 재검토)
1. **자동 스캔**: Semgrep, Bandit 실행 (구조)
2. **의존성 검사**: npm audit, pip audit 실행 (구조)
3. **결과 통합**: 취약점 정규화 (구조)
4. **AI 재검토**: 위험도/영향도 재평가 (AI)
5. **패치 생성**: 수정 코드 작성 (AI)

---

## 구현 단계

### Week 1 (2026-04-16 ~ 2026-04-22)
- [ ] Semgrep/Bandit 설치 및 규칙 구성
- [ ] 기존 코드베이스 전체 스캔
- [ ] 취약점 정규화 및 우선순위 지정
- [ ] 초기 리포트 작성

### Week 2 (2026-04-23 ~ 2026-04-29)
- [ ] 패치 코드 생성 (Critical/High)
- [ ] 테스트 케이스 작성
- [ ] 회귀 테스트 실행

### Week 3 (2026-04-30 ~ 2026-05-06)
- [ ] 패치 적용 및 검증
- [ ] OUTPUT_PROOF.md 작성 (감사 리포트)
- [ ] 지속적 모니터링 설정

---

## 배포 후 모니터링

```
운영 중:
- [ ] CI/CD 파이프라인에 보안 스캔 통합
- [ ] 주 1회 자동 전체 스캔
- [ ] 새 의존성 추가 시 즉시 검사
- [ ] 월 1회 리포트 생성 (의사결정자에게 공유)
```
