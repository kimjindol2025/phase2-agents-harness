---
allowed-tools: Bash, Write
description: 3파일 패턴 기반 새 에이전트 스켈레톤 생성
---

## /harness-new-agent

새 에이전트를 3파일 패턴에 따라 생성합니다.

### 에이전트 정보 수집

기본 정보를 확인하세요 ($ARGUMENTS가 있으면 파싱):

1. **agent-id** (kebab-case, 필수)
   - 형식: ^[a-z][a-z0-9-]*$
   - 예: log-analyzer, code-optimizer

2. **category** (dev|ops|deploy|learn, 필수)
   - dev: 개발 관련
   - ops: 운영 관련
   - deploy: 배포 관련
   - learn: 학습 관련

3. **description** (한 문장, 필수)
   - 에이전트의 목적 설명

### 스켈레톤 생성

**Step 1: 에이전트 디렉토리 생성**
```bash
mkdir -p agents-impl/{agent-id}
```

**Step 2: 3파일 스켈레톤 작성**

`agents-impl/{agent-id}/parser.fl`:
```freeLang
// {agent-id} - Parser
// 입력 코드 분석 및 구조화

module {AgentId}.Parser

type CodeInput = {
  source: str,
  filename: str
}

type ParseResult = {
  structures: i32,
  functions: i32,
  complexity: i32
}

fn parse(input: CodeInput) -> ParseResult? {
  // TODO: 입력 분석 구현
  return none
}
```

`agents-impl/{agent-id}/analyzer.fl`:
```freeLang
// {agent-id} - Analyzer
// 핵심 분석 로직

module {AgentId}.Analyzer

fn analyze(parsed: ParseResult) -> AnalysisOutput {
  // TODO: 분석 로직 구현
  return {}
}
```

`agents-impl/{agent-id}/proof.fl`:
```freeLang
// {agent-id} - Proof
// 4가지 성공기준 검증

module {AgentId}.Proof

fn validateSuccess(output: AnalysisOutput) -> ValidationReport {
  // 성공기준 4가지:
  // 1. accuracy >= 0.90 (정확도)
  // 2. detection_rate >= 0.85 (발견율)
  // 3. false_positive <= 0.05 (거짓양성률)
  // 4. execution_time <= 5000 (실행시간 ms)

  return {
    accuracy: 0.0,
    detection_rate: 0.0,
    false_positive: 0.0,
    execution_time: 0
  }
}
```

**Step 3: 정의 파일 작성**

`agents-definition/{category}/{agent-id}.md`:
```markdown
# {agent-id}

## 목적
{description}

## 역할
- 입력: 소스 코드
- 출력: 분석 결과

## 의존성
[]

## 성공 기준
- 정확도 ≥ 90%
- 발견율 ≥ 85%
- 거짓양성률 ≤ 5%
- 실행시간 ≤ 5000ms
```

### 검증

```bash
# 생성 확인
ls agents-impl/{agent-id}/
# 출력: analyzer.fl  parser.fl  proof.fl
```

### 다음 단계

1. 3파일 작성 완료
2. `/harness-validate {agent-id}` 실행
3. npm test 통과
4. `/harness-proof {agent-id}` 실행
5. `/commit-validated` 커밋
