---
allowed-tools: Bash
description: 에이전트 하네스 규칙 준수 검증
---

## /harness-validate

에이전트 구조와 규칙을 검증합니다.

### 검증 실행

```bash
cd ~/phase2-agents-harness

# 인자 파싱
AGENT_ID="${ARGUMENTS:-all}"

if [ "$AGENT_ID" = "--all" ]; then
  echo "📋 전체 에이전트 검증"
  AGENT_ID="all"
fi

# 검증 Step 1: 3파일 패턴
echo "✓ [검증 1] 3파일 패턴"
if [ "$AGENT_ID" = "all" ]; then
  for dir in agents-impl/*/; do
    agent=$(basename "$dir")
    count=$(ls "$dir"*.fl 2>/dev/null | wc -l)
    status=$([ "$count" -eq 3 ] && echo "✅" || echo "❌")
    printf "  $status $agent: $count파일\n"
  done
else
  count=$(ls agents-impl/$AGENT_ID/*.fl 2>/dev/null | wc -l)
  printf "  $([ "$count" -eq 3 ] && echo "✅" || echo "❌") 3파일 패턴\n"
fi

# 검증 Step 2: 파일명 규칙
echo "✓ [검증 2] 파일명 규칙"
VALID_NAMES="(parser|scanner|generator|analyzer|patcher|optimizer|proof|auditor|validator|benchmark)\.fl"

if [ "$AGENT_ID" = "all" ]; then
  find agents-impl -name "*.fl" | while read f; do
    basename "$f" | grep -E "^$VALID_NAMES$" > /dev/null && echo "  ✅ $(basename $f)" || echo "  ❌ $(basename $f) (규칙 위반)"
  done
else
  ls agents-impl/$AGENT_ID/*.fl | while read f; do
    basename "$f" | grep -E "^$VALID_NAMES$" > /dev/null && echo "  ✅ $(basename $f)" || echo "  ❌ $(basename $f)"
  done
fi

# 검증 Step 3: 성공기준 포함 여부
echo "✓ [검증 3] 성공기준 4가지"
if [ "$AGENT_ID" = "all" ]; then
  for proof in agents-impl/*/proof.fl; do
    agent=$(dirname "$proof" | xargs basename)
    has_accuracy=$(grep -c "90\|accuracy\|정확도" "$proof" 2>/dev/null || echo 0)
    has_detection=$(grep -c "85\|detection\|발견율" "$proof" 2>/dev/null || echo 0)
    has_fp=$(grep -c "5\|false_positive\|거짓양성" "$proof" 2>/dev/null || echo 0)
    has_time=$(grep -c "5000\|execution_time\|실행시간" "$proof" 2>/dev/null || echo 0)

    if [ "$has_accuracy" -gt 0 ] && [ "$has_detection" -gt 0 ] && [ "$has_fp" -gt 0 ] && [ "$has_time" -gt 0 ]; then
      echo "  ✅ $agent"
    else
      echo "  ❌ $agent (기준 일부 누락)"
    fi
  done
else
  proof="agents-impl/$AGENT_ID/proof.fl"
  [ -f "$proof" ] && grep -E "(accuracy|정확도|90)" "$proof" > /dev/null && echo "  ✅ 정확도" || echo "  ❌ 정확도"
  [ -f "$proof" ] && grep -E "(detection|발견율|85)" "$proof" > /dev/null && echo "  ✅ 발견율" || echo "  ❌ 발견율"
  [ -f "$proof" ] && grep -E "(false_positive|거짓양성|5%)" "$proof" > /dev/null && echo "  ✅ 거짓양성율" || echo "  ❌ 거짓양성율"
  [ -f "$proof" ] && grep -E "(execution_time|실행시간|5000)" "$proof" > /dev/null && echo "  ✅ 실행시간" || echo "  ❌ 실행시간"
fi

# 검증 Step 4: npm test 실행
echo "✓ [검증 4] npm test 통과"
npm test -- --passWithNoTests 2>&1 | tail -5
```

### 검증 결과 해석

- ✅ **모두 통과**: 다음 단계 진행 → `/harness-proof {agent-id}`
- ❌ **일부 실패**: 표시된 항목 수정 후 재실행

### 일반적인 오류와 해결책

| 오류 | 원인 | 해결책 |
|------|------|--------|
| ❌ 파일 3개 미만 | 파일 누락 | `/harness-new-agent` 로 스켈레톤 재생성 |
| ❌ 파일명 규칙 위반 | 잘못된 파일명 | 규칙 문서 참고 후 파일명 변경 |
| ❌ 성공기준 누락 | proof.fl 불완전 | 4가지 기준 모두 포함하도록 수정 |
| ❌ npm test 실패 | TypeScript 문제 | src/bridge/ 및 tests/ 검토 |
