---
name: commit-message-format
enabled: true
event: bash
pattern: git\s+commit
action: warn
---

## 📝 커밋 메시지 형식 확인

`git commit` 실행을 감지했습니다.

### ✅ Phase 2 하네스 커밋 메시지 규칙

**필수 형식**:
```
feat: [AGENT-{agent-id}] 설명

상세 설명 (선택)
- npm test: Test Suites: X passed, X total
- Tests: Y passed, Y total
- 성과: (정확도/발견율/오탐율 달성도)
```

### 📋 예시

```
feat: [AGENT-code-analyzer] 복잡도 분석 엔진 추가
- npm test: Test Suites: 2 passed, 2 total
- Tests: 18 passed, 18 total
- 정확도 95% (목표 90%), 발견율 88% (목표 85%)
```

### 🚀 권장 워크플로우

수동 커밋 대신 `/commit-validated` 사용:
```bash
/commit-validated
```

이 명령어는 다음을 자동으로 검증합니다:
1. npm test 실행
2. Test Suites 통과 확인
3. OUTPUT_PROOF.md 업데이트
4. 에이전트 3파일 구조 검증
5. 커밋 메시지 형식 검증

### ⚠️ 주의

에이전트 관련 커밋이라면 반드시:
1. "feat: [AGENT-" 로 시작
2. npm test 통과 증명 포함
3. OUTPUT_PROOF.md 업데이트

증명 없는 커밋은 배포 시 차단됩니다.
