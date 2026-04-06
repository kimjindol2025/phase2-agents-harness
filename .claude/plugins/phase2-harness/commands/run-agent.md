---
allowed-tools: Bash
description: TypeScript 브리지를 통한 에이전트 실행
---

## /run-agent

에이전트를 TypeScript 브리지를 통해 실행합니다.

### 사용법

```bash
/run-agent {agent-id} [--input 'input_data']
```

### 브리지란?

FreeLang .fl 파일은 현재 환경에서 직접 실행할 수 없습니다.
브리지는 TypeScript를 통해 .fl 파일을 시뮬레이션합니다.

**실행 모드**:
- `mock` (현재): 정적 분석 기반 모의 실행
- `subprocess`: FreeLang CLI 설치 시 실제 실행
- `wasm` (미래): WASM 컴파일 실행

### 예시

#### 예 1: 기본 실행
```bash
/run-agent code-analyzer
# 출력: { status: 'success', agent_id: 'code-analyzer', ... }
```

#### 예 2: 입력 데이터 포함
```bash
/run-agent code-analyzer --input '{"code":"function test() {}"}'
# 출력: 분석 결과 JSON
```

#### 예 3: 특정 Phase만 실행
```bash
/run-agent code-analyzer --phase parser
# 출력: parser.fl 시뮬레이션 결과
```

### 실행 결과 해석

성공 응답:
```json
{
  "status": "success",
  "agent_id": "code-analyzer",
  "execution_time_ms": 234,
  "results": {
    "accuracy": 0.95,
    "detection_rate": 0.88,
    "false_positive": 0.03,
    "execution_time": 234
  }
}
```

실패 응답:
```json
{
  "status": "failure",
  "agent_id": "code-analyzer",
  "error": "file_not_found",
  "message": "agents-impl/code-analyzer/parser.fl not found"
}
```

### 검증 기준

실행 결과에서:
- ✅ `execution_time_ms < 5000` → 실행시간 통과
- ✅ `accuracy >= 0.90` → 정확도 통과
- ✅ `detection_rate >= 0.85` → 발견율 통과
- ✅ `false_positive <= 0.05` → 거짓양성 통과

모두 통과하면 배포 준비됨.

### 다음 단계

성공적으로 실행되면:

```bash
/harness-proof {agent-id}
```

로 증명 파일을 생성하세요.

### 문제 해결

| 오류 | 원인 | 해결책 |
|------|------|--------|
| file_not_found | .fl 파일 누락 | `/harness-new-agent` 로 생성 |
| invalid_structure | 3파일 구조 오류 | `/harness-validate` 로 검증 |
| runtime_error | FreeLang 문법 오류 | .fl 파일 문법 검토 |

### 상세 문서

더 자세한 내용은 `docs/BRIDGE.md` 를 참고하세요.
