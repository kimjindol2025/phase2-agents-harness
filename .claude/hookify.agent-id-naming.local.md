---
name: agent-id-naming
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: agents-impl/[^/]+/.*\.fl$
action: warn
---

## 🔤 에이전트 ID 네이밍 규칙 확인

`agents-impl/` 경로에 파일을 작성하려고 합니다.

### ✅ 올바른 에이전트 ID 형식

**규칙**: kebab-case (소문자 + 하이픈)

**패턴**:
```
^[a-z][a-z0-9-]*$
```

### 📋 올바른 예시

```
✅ code-analyzer        (소문자, 하이픈)
✅ sql-optimizer        (소문자, 하이픈, 숫자 가능)
✅ log-analyzer-v2      (버전 포함 가능)
✅ security-scanner     (복합어)
```

### ❌ 잘못된 예시

```
❌ CodeAnalyzer         (CamelCase 불허)
❌ code_analyzer        (언더스코어 불허)
❌ codeAnalyzer         (camelCase 불허)
❌ Code-Analyzer        (대문자 불허)
❌ -code-analyzer       (하이픈으로 시작 불허)
❌ code-analyzer-       (하이픈으로 종료 불허)
```

### 🛠️ 파일명 규칙

`agents-impl/{agent-id}/` 내의 .fl 파일명도 규칙이 있습니다.

**허용되는 파일명**:
```
입력 처리:     parser.fl, scanner.fl, generator.fl
핵심 로직:     analyzer.fl, patcher.fl, optimizer.fl
검증/증명:     proof.fl, auditor.fl, validator.fl, benchmark.fl
```

### 💾 경로 규칙

```
agents-impl/{agent-id}/{filename}.fl

예:
agents-impl/code-analyzer/parser.fl          ✅
agents-impl/code-analyzer/analyzer.fl        ✅
agents-impl/code-analyzer/proof.fl           ✅

agents-impl/CodeAnalyzer/parser.fl           ❌
agents-impl/code_analyzer/parser.fl          ❌
agents-impl/code-analyzer/execute.fl         ❌ (파일명 규칙 위반)
```

### 🔧 수정 방법

현재 경로를 확인하고 올바른 이름으로 작성하세요.

**현재 경로 확인**:
```bash
pwd
ls agents-impl/
```

문제가 있다면:
1. 에이전트 ID를 kebab-case로 수정
2. 파일명을 허용 목록에서 선택
3. 다시 작성

### 📌 주의

네이밍 규칙은:
- 시스템의 자동화를 위함 (hookify 규칙, 경로 탐색)
- 팀 전체의 일관성을 위함
- 배포 파이프라인 호환성 보장

규칙을 지켜야 `/harness-validate` 검증을 통과할 수 있습니다.
