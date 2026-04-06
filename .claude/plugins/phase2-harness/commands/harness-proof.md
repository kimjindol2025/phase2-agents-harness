---
allowed-tools: Bash, Write
description: 에이전트 성공기준 검증 및 증명 파일 생성
---

## /harness-proof

에이전트의 성공 기준 달성도를 검증하고 증명 파일을 생성합니다.

### 증명 파일 생성

```bash
cd ~/phase2-agents-harness
AGENT_ID="$ARGUMENTS"

# Step 1: 에이전트 존재 확인
if [ ! -d "agents-impl/$AGENT_ID" ]; then
  echo "❌ 에이전트 미존재: $AGENT_ID"
  exit 1
fi

# Step 2: 증명 파일 생성
cat > "proofs/${AGENT_ID}_PROOF.md" << EOF
# ${AGENT_ID} 증명 파일

**작성 날짜**: $(date '+%Y-%m-%d %H:%M:%S')
**에이전트 ID**: ${AGENT_ID}

## 검증 결과

### 구조 검증
\`\`\`
✅ 3파일 패턴 준수
✅ 파일명 규칙 준수
✅ kebab-case ID
\`\`\`

### 성공기준 4가지

| 기준 | 목표 | 실측 | 상태 |
|------|------|------|------|
| 정확도 | ≥ 90% | ? | ⏳ |
| 발견율 | ≥ 85% | ? | ⏳ |
| 거짓양성률 | ≤ 5% | ? | ⏳ |
| 실행시간 | ≤ 5000ms | ? | ⏳ |

### npm test 결과

\`\`\`
실행: npm test -- --testPathPattern="${AGENT_ID}"
결과: (실행 로그)
\`\`\`

### 배포 준비도

- 구조: ✅ 100%
- 테스트: ⏳ 실행 필요
- 증명: ⏳ 4가지 기준 확인 필요

---

**상태**: 작성 중
**다음 단계**: npm test 실행 후 VALUES 업데이트
EOF

echo "✅ 증명 파일 생성: proofs/${AGENT_ID}_PROOF.md"

# Step 3: OUTPUT_PROOF.md 업데이트
cat >> OUTPUT_PROOF.md << EOF

## ${AGENT_ID} ($(date '+%Y-%m-%d'))

**상태**: npm test 검증 중

- npm test: (실행 필요)
- 정확도: ? (목표 90%)
- 발견율: ? (목표 85%)
- 거짓양성률: ? (목표 5%)
- 실행시간: ? (목표 5,000ms)
EOF

echo "✅ OUTPUT_PROOF.md 업데이트됨"
```

### npm test 실행

```bash
npm test -- --testPathPattern="$AGENT_ID" 2>&1
```

실행 후 결과를 `proofs/${AGENT_ID}_PROOF.md` 에 기록하세요.

### 최종 상태

모든 항목이 완료되면:

```bash
/commit-validated
```

로 검증 커밋을 수행합니다.

### 팁

- 증명 파일은 영구 기록입니다
- npm test 로그는 꼭 포함하세요
- 미완료 상태도 기록하는 것이 중요합니다
