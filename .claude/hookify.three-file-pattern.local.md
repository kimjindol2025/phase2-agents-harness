---
name: three-file-pattern
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: agents-impl/[a-z][a-z0-9-]+/[^/]+\.fl$
action: warn
---

## 🔍 3파일 패턴 검증 필수

에이전트 .fl 파일이 추가되었습니다.

### ✅ 올바른 구조

`agents-impl/{agent-id}/` 에는 **정확히 3개**의 .fl 파일이 있어야 합니다:

**레이어 1 - 입력 처리** (다음 중 1개):
- `parser.fl` ← 입력 코드 분석 & 구조화
- `scanner.fl` ← 코드 스캔 & 특성 추출
- `generator.fl` ← 입력 생성 & 검증

**레이어 2 - 핵심 로직** (다음 중 1개):
- `analyzer.fl` ← 분석 및 처리
- `patcher.fl` ← 수정 및 최적화
- `optimizer.fl` ← 최적화

**레이어 3 - 검증 & 증명** (다음 중 1개):
- `proof.fl` ← 4가지 성공기준 검증
- `auditor.fl` ← 감사 및 검증
- `validator.fl` ← 검증
- `benchmark.fl` ← 성능 측정

### 🛠️ 현재 상태 확인

```bash
ls -la agents-impl/{agent-id}/
```

파일이 3개 미만이면 나머지 파일을 먼저 작성하세요.

### 💡 예시

```
agents-impl/code-analyzer/
├── parser.fl        ← 입력 처리
├── analyzer.fl      ← 핵심 로직
└── proof.fl         ← 성공기준 검증 (4가지)
```

### 📌 다음 단계

모든 3개 파일을 완성한 후:
1. `/harness-validate {agent-id}` 실행
2. 파일명/구조 검증 통과 확인
3. npm test 실행
