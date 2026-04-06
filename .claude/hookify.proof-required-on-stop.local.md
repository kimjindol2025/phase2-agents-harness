---
name: proof-required-on-stop
enabled: true
event: stop
action: warn
---

## 🛑 세션 종료 전 증명 확인

이 세션을 종료하려고 합니다.

### 🚨 OUTPUT_PROOF.md 업데이트 확인

**"기록이 증명이다"** 원칙에 따라, 이 세션에서 에이전트를 수정했다면 증명 파일이 필요합니다.

### ✅ 체크리스트

다음을 확인하세요:

- [ ] **OUTPUT_PROOF.md** 업데이트됨
  - 최신 에이전트 테스트 결과 기록
  - npm test: Test Suites/Tests 수록

- [ ] **proofs/{AGENT-NAME}_PROOF.md** 생성됨
  - 4가지 성공기준 달성도 기록
  - 실측값 vs 목표값 비교

- [ ] **DECISION_LOG.md** 업데이트됨
  - 주요 결정사항 기록
  - 변경 근거 명시

### 📝 OUTPUT_PROOF.md 형식

```markdown
## 2026-04-06 (이번 세션)

### AGENT-code-analyzer (신규/업데이트)
- npm test: Test Suites: 2 passed, 2 total
- Tests: 18 passed, 18 total
- 정확도: 95% (목표 90%) ✅
- 발견율: 88% (목표 85%) ✅
- 거짓양성률: 3% (목표 5%) ✅
- 실행시간: 2,340ms (목표 5,000ms) ✅
- 상태: 배포 준비도 100%
```

### 🎯 증명 없이 종료 시 위험

증명 파일 없이 종료하면:
1. 개발 이력 손실
2. 성과 추적 불가
3. 품질 검증 불가
4. 배포 승인 불가

### 💾 해결 방법

#### 빠른 업데이트
```bash
/harness-proof {agent-id}  # 자동 증명 생성
/commit-validated          # 검증 커밋
```

그 후 종료하면 안전합니다.

#### 확인만 필요한 경우
```bash
cat OUTPUT_PROOF.md        # 최신 증명 확인
```

### 🔄 작업이 완료되지 않은 경우

증명 파일 없이 세션을 종료하려면:
1. DECISION_LOG.md 에 "미완료" 기록
2. 다음 세션에서 이어 진행할 계획 명시
3. 그 후 종료

예시:
```markdown
## 2026-04-06 미완료 작업
- AGENT-log-analyzer: 구현 중 (50% 완성)
- 다음: proof.fl 작성 후 테스트
```

### 📌 중요

증명 시스템은 신뢰의 기초입니다.
완료되지 않은 작업이라도 그 상태를 명시하는 것이 중요합니다.
