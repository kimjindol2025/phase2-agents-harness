---
allowed-tools: Bash
description: npm test 검증 기반 에이전트 하네스 커밋
---

## /commit-validated

Phase 2 에이전트 하네스 npm test 증명 기반 커밋

**특징**:
- npm test 실행 필수
- Test Suites 통과 증명 필수
- OUTPUT_PROOF.md 업데이트 검증
- AGENT_SPEC_TEMPLATE.md 준수 검증
- 3파일 구조 검증 (parser/analyzer/proof)

### 실행 순서

**Step 1: npm test 실행 및 증명 수집**
\`\`\`bash
cd ~/phase2-agents-harness
npm test 2>&1
\`\`\`

증명 수집 항목:
- Test Suites: X passed, X total
- Tests: Y passed, Y total
- 컴파일 오류 0개
- 테스트 실패 0개

**Step 2: 에이전트 구조 검증**
\`\`\`bash
# 검증 항목
- agents-impl/{agent-id}/ 디렉토리 존재
- parser.fl / analyzer.fl / proof.fl 3파일 존재
- 에이전트 ID가 kebab-case 준수
- AGENT_SPEC_TEMPLATE.md 패턴 준수
\`\`\`

**Step 3: 증명 파일 검증**
\`\`\`bash
# 다음 파일 존재 확인:
- OUTPUT_PROOF.md (최신 업데이트)
- DECISION_LOG.md (결정 기록)
- AI_LIMITS.md (AI 한계 분석)
\`\`\`

**Step 4: 커밋 메시지 작성**

형식: `feat: [AGENT-{name}] 설명 (npm test 통과 증명)`

예시:
```
feat: [AGENT-code-analyzer] 복잡도 분석 엔진 추가
- npm test: Test Suites: 2 passed, 2 total
- Tests: 18 passed, 18 total
- 정확도 95%, 발견율 88% 달성
```

**Step 5: 커밋 실행**

커밋 직전 체크리스트:
- [ ] npm test 실행 완료
- [ ] Test Suites 통과 (0실패)
- [ ] 에이전트 3파일 구조 확인
- [ ] OUTPUT_PROOF.md 업데이트
- [ ] 커밋 메시지 "feat: [AGENT-*]" 형식

미충족 = 커밋 거부 및 수정 지시

### 거부 시나리오

❌ **커밋 거부 됨** (다음 중 1개 이상):
- Test Suites 1개 이상 실패
- Tests 1개 이상 실패
- "npm test" 로그 없음
- OUTPUT_PROOF.md 미업데이트
- 3파일 구조 불완전
- 커밋 메시지 형식 위반

❌ **재작업 지시**:
```
미충족 항목:
1. Test Suites 실패 1개
2. OUTPUT_PROOF.md 미업데이트

해결책:
- npm test 재실행하여 모든 테스트 통과
- OUTPUT_PROOF.md 업데이트
- /commit-validated 재실행
```

### 승인 시나리오

✅ **커밋 승인** (모두 충족):
```
✓ npm test: Test Suites: 2 passed, 2 total
✓ Tests: 18 passed, 18 total
✓ 에이전트 3파일 구조 완전
✓ OUTPUT_PROOF.md 최신
✓ 커밋 메시지 "feat: [AGENT-code-analyzer]..." 형식

→ 커밋 생성
→ 에이전트 정의 파일 업데이트
→ DECISION_LOG.md 기록
→ Gogs 푸시 권유
```

### 팁

1. **npm test 효율성**: 변경된 에이전트만 테스트
   ```bash
   npm test -- --testPathPattern="code-analyzer"
   ```

2. **증명 수집**: 항상 전체 로그 캡처
   ```bash
   npm test 2>&1 | tee test-output.log
   ```

3. **배치 커밋**: 여러 에이전트 변경 시
   ```bash
   /commit-validated  # 첫 번째 에이전트
   /commit-validated  # 두 번째 에이전트
   ```

---

**중요**: "기록이 증명이다" 원칙
- 모든 npm test 로그 필수
- OUTPUT_PROOF.md 매 커밋마다 업데이트
- 실패한 커밋은 DECISION_LOG.md에 기록
