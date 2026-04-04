# Claude Code 통합 가이드 (Claude Code Integration Guide)

## 🎯 목표

Claude Code를 사용하여:
1. **자동화된 에이전트 생성** (규칙 기반)
2. **실시간 코드 검증** (하네스 규칙 체크)
3. **자동 배포** (Gogs/GitHub Actions 연동)
4. **대화형 개발** (실시간 피드백)

---

## 🚀 3가지 적용 방법

### 방법 1: CLI 활용 (지금 바로)

```bash
# 1. 현재 디렉토리를 Claude Code 프로젝트로 열기
cd /data/data/com.termux/files/home/phase2-agents-harness
claude code start

# 2. 프로젝트 구조 분석
claude code analyze

# 3. 새 에이전트 생성 (규칙 기반)
claude code create-agent --name "test-generator" --category "dev"

# 4. 테스트 실행
claude code test

# 5. 배포
claude code deploy --target gogs
```

---

### 방법 2: IDE 확장 (VS Code / JetBrains)

#### VS Code 설정

```json
// .vscode/settings.json
{
  "claudeCode.project": {
    "name": "phase2-agents-harness",
    "rules": ".claude/claude-code-rules.json",
    "autoCommit": true,
    "autoTest": true
  },
  "claudeCode.mcp": {
    "servers": [
      {
        "name": "gogs-server",
        "command": "node",
        "args": ["mcp-servers/gogs.js"],
        "env": {
          "GOGS_TOKEN": "${env:GOGS_TOKEN}"
        }
      },
      {
        "name": "freelang-validator",
        "command": "freelang",
        "args": ["mcp-servers/freelang-validator.fl"]
      }
    ]
  },
  "claudeCode.shortcuts": {
    "generateAgent": "Ctrl+Shift+A",
    "validateRules": "Ctrl+Shift+V",
    "testIntegration": "Ctrl+Shift+T"
  }
}
```

#### JetBrains 플러그인 설정

```xml
<!-- .idea/claudeCode.xml -->
<project version="4">
  <component name="ClaudeCodeConfig">
    <option name="enabled" value="true" />
    <option name="projectPath" value="$PROJECT_DIR$" />
    <option name="rulesFile" value="$PROJECT_DIR$/.claude/claude-code-rules.json" />

    <component name="MCP">
      <server name="gogs-server" enabled="true">
        <option name="command" value="node" />
        <option name="args" value="mcp-servers/gogs.js" />
      </server>
    </component>

    <component name="CodeActions">
      <action id="generateAgent" shortcut="Ctrl+Shift+A" />
      <action id="validateRules" shortcut="Ctrl+Shift+V" />
    </component>
  </component>
</project>
```

---

### 방법 3: 웹앱 (claude.ai/code)

```
1. 방문: https://claude.ai/code
2. 로그인
3. 프로젝트 생성
4. Gogs 저장소 연결:
   - Settings → Repository
   - URL: https://gogs.dclub.kr/kim/phase2-agents-harness.git
   - Token: ${GOGS_TOKEN}
5. 규칙 파일 업로드: HARNESS_RULES.md
6. MCP 서버 설정 (아래)
```

---

## 🔌 MCP 서버 연결 (Model Context Protocol)

### MCP란?
Claude가 외부 도구/저장소에 접근할 수 있게 하는 프로토콜

### 필요한 MCP 서버 3개

#### 1️⃣ Gogs MCP Server

```javascript
// mcp-servers/gogs.js
const mcp = require("@anthropic-sdk/mcp");

module.exports = {
  name: "gogs",
  version: "1.0.0",

  tools: [
    {
      name: "gogs_clone",
      description: "Gogs 저장소 클론",
      schema: {
        type: "object",
        properties: {
          repo: { type: "string", description: "phase2-agents-harness" },
          branch: { type: "string", description: "master/feature-xxx" }
        }
      }
    },
    {
      name: "gogs_push",
      description: "변경사항 Gogs에 푸시",
      schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          files: { type: "array", items: { type: "string" } }
        }
      }
    },
    {
      name: "gogs_pull_request",
      description: "Pull Request 생성",
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          base: { type: "string", default: "master" }
        }
      }
    }
  ],

  async handle(toolName, input) {
    const { exec } = require("child_process");

    switch (toolName) {
      case "gogs_clone":
        return exec(
          `git clone https://x-access-token:${process.env.GOGS_TOKEN}@gogs.dclub.kr/kim/${input.repo}.git`
        );

      case "gogs_push":
        return exec(
          `git add ${input.files.join(" ")} && git commit -m "${input.message}" && git push origin master`
        );

      case "gogs_pull_request":
        // GitHub API 또는 Gogs API 사용
        return { status: "pending", url: "..." };
    }
  }
};
```

#### 2️⃣ FreeLang Validator MCP Server

```freeling
// mcp-servers/freelang-validator.fl

struct ValidationRequest {
    file_path: str
    agent_name: str
    check_type: str  // "syntax" | "rules" | "tests"
}

struct ValidationResult {
    valid: bool
    errors: [str]
    warnings: [str]
    suggestions: [str]
}

fn validate_syntax(code: str) -> ValidationResult {
    ;; FreeLang 구문 검증
    var result = ValidationResult {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: []
    }
    result
}

fn validate_harness_rules(agent_file: str) -> ValidationResult {
    ;; 하네스 규칙 검증
    ;; 1. 3파일 패턴 확인
    ;; 2. 성공 기준 4가지 확인
    ;; 3. 의존성 규칙 확인
    ;; 4. 일관성 검증 확인

    var result = ValidationResult {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: []
    }

    ;; 구현...
    result
}

fn validate_tests(test_file: str) -> ValidationResult {
    ;; 테스트 10개 이상 확인
    var result = ValidationResult {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: []
    }
    result
}

fn main() {
    ;; MCP 핸들러
    println("FreeLang Validator MCP Server Ready")
}
```

#### 3️⃣ GitHub Actions MCP Server

```javascript
// mcp-servers/github-actions.js
const mcp = require("@anthropic-sdk/mcp");

module.exports = {
  name: "github-actions",

  tools: [
    {
      name: "trigger_workflow",
      description: "GitHub Actions 워크플로우 실행",
      schema: {
        type: "object",
        properties: {
          workflow: { type: "string", enum: ["agent-test.yml"] },
          ref: { type: "string", default: "master" }
        }
      }
    },
    {
      name: "check_workflow_status",
      description: "워크플로우 상태 확인",
      schema: {
        type: "object",
        properties: {
          run_id: { type: "string" }
        }
      }
    }
  ]
};
```

---

## ⚙️ Claude Code 규칙 파일

```json
// .claude/claude-code-rules.json
{
  "projectName": "phase2-agents-harness",
  "language": "freeling",
  "patterns": {
    "agentStructure": {
      "required": ["parser|scanner|generator", "analyzer|patcher|optimizer", "proof|auditor|validator"],
      "location": "agents-impl/{agent-id}/{file}.fl"
    },
    "fileNaming": {
      "agentId": "^[a-z][a-z0-9-]*$",
      "fileName": "^(parser|scanner|generator|analyzer|patcher|optimizer|proof|auditor|validator)\\.fl$"
    },
    "successCriteria": {
      "accuracy": ">= 90",
      "detectionRate": ">= 85",
      "falsePositive": "< 5",
      "executionTime": "< 5000"
    },
    "consistency": {
      "crossValidations": 4,
      "minAverage": 80,
      "targets": [
        "Code ↔ Security",
        "Performance ↔ Log",
        "Security ↔ Code",
        "Document ↔ Code"
      ]
    }
  },

  "automations": {
    "onPush": [
      "validate_syntax",
      "check_harness_rules",
      "trigger_github_actions"
    ],
    "onPullRequest": [
      "validate_files",
      "run_tests",
      "generate_proof"
    ],
    "onMerge": [
      "update_consolidated_proof",
      "publish_to_gogs"
    ]
  },

  "codeActions": {
    "generateAgent": {
      "template": "agents-impl/{name}/template",
      "steps": [
        "prompt for agent details",
        "generate 3 files",
        "run tests",
        "generate OUTPUT_PROOF"
      ]
    },
    "validateRules": {
      "checks": [
        "file structure",
        "naming convention",
        "success criteria",
        "consistency validation"
      ]
    },
    "testIntegration": {
      "steps": [
        "run unit tests",
        "run integration test",
        "check consistency",
        "generate report"
      ]
    }
  }
}
```

---

## 🤖 자동화 워크플로우

### 워크플로우 1: 새 에이전트 생성 (자동)

```
사용자: "test-generator 에이전트 만들어줘"
   ↓
Claude Code:
  1. HARNESS_RULES.md 읽기
  2. 3파일 템플릿 생성:
     - test-generator/scanner.fl
     - test-generator/optimizer.fl
     - test-generator/auditor.fl
  3. 규칙 검증
  4. 성공 기준 4가지 주입
  5. 테스트 10개 생성
  6. OUTPUT_PROOF 템플릿 생성
  7. Commit 메시지 작성:
     "feat: [test-generator] 테스트 자동 생성 에이전트"
  8. Gogs 푸시
  9. GitHub Actions 트리거
   ↓
완료: test-generator 에이전트 배포 준비 상태
```

### 워크플로우 2: 규칙 검증 (자동)

```
개발자: 파일 저장 (parser.fl)
   ↓
Claude Code:
  1. 3파일 패턴 확인
  2. 함수 시그니처 검증
  3. 성공 기준 4가지 확인
  4. 의존성 규칙 확인
  5. 일관성 기준 확인
   ↓
결과: ✅ 또는 ⚠️ (즉시 피드백)
```

### 워크플로우 3: 배포 (자동)

```
merge to master
   ↓
GitHub Actions:
  1. 구문 검증
  2. 테스트 실행
  3. 일관성 검증
  4. OUTPUT_PROOF 생성
   ↓
모두 통과 → Gogs에 배포
   ↓
Claude Code: 배포 알림
```

---

## 🛠️ 설정 단계별 가이드

### Step 1: Claude Code CLI 설치

```bash
# macOS / Linux
curl -fsSL https://installer.claude.ai/install | sh

# Windows
choco install claudecode

# 또는 npm
npm install -g @anthropic-sdk/claude-code

# 버전 확인
claude code --version
```

### Step 2: 프로젝트 초기화

```bash
cd /data/data/com.termux/files/home/phase2-agents-harness

# Claude Code 프로젝트 초기화
claude code init

# 설정 파일들 자동 생성
#  - .claude/claude-code-rules.json
#  - .claude/settings.json
#  - .claude/project.yaml
```

### Step 3: MCP 서버 등록

```bash
# Gogs MCP 서버 등록
claude code add-mcp --name gogs --command "node mcp-servers/gogs.js"

# FreeLang Validator 등록
claude code add-mcp --name freelang --command "freelang mcp-servers/freelang-validator.fl"

# GitHub Actions 등록
claude code add-mcp --name github-actions --command "node mcp-servers/github-actions.js"

# 확인
claude code list-mcps
```

### Step 4: 규칙 파일 연결

```bash
# HARNESS_RULES.md를 Claude Code에 연결
claude code set-rules --file HARNESS_RULES.md

# 규칙 검증
claude code validate-rules
```

### Step 5: 환경변수 설정

```bash
# .claude/.env.local (Git 무시됨)
export GOGS_TOKEN="your_gogs_token"
export GITHUB_TOKEN="your_github_token"
export FREELANG_PATH="/path/to/freelang-v4"

# 또는 VS Code settings.json
{
  "claudeCode.env": {
    "GOGS_TOKEN": "${env:GOGS_TOKEN}",
    "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
  }
}
```

---

## 💻 사용 예시

### 예 1: 대화형 에이전트 생성

```
사용자:
  "compliance-checker 에이전트를 만들어줘.
   - 카테고리: deploy
   - 입력: dockerfile, kubernetes.yaml
   - 출력: compliance_report
   - 의존성: deployment-validator"

Claude Code:
  ✅ agents-impl/compliance-checker/ 생성
  ├── scanner.fl (설정파일 검사)
  ├── patcher.fl (규정 위반 패치)
  └── auditor.fl (감사 리포트 생성)

  ✅ tests/compliance-checker-test.fl (10개 테스트)

  ✅ OUTPUT_PROOF 템플릿

  ✅ Commit & 푸시 제안:
     "feat: [compliance-checker] 규정 준수 검증 에이전트"
```

### 예 2: 규칙 위반 감지 (자동)

```
개발자: parser.fl 파일에서
  struct ParseResult {
      target: str
  }  // ❌ 최소 4개 필드 필요

Claude Code (자동 감지):
  ⚠️ 경고: "ParseResult 구조체가 불완전합니다

  권장 구조:
  struct ParseResult {
      target: str
      lines: i32
      metrics: [...]
      issues: [...]
  }"
```

### 예 3: 배포 자동화

```
커밋: "feat: [compliance-checker] 규정 준수 검증"
   ↓
GitHub Actions 자동 실행:
  ✅ Syntax validation
  ✅ Rule check (하네스 규칙)
  ✅ Test execution (10개 테스트)
  ✅ Consistency validation (96.8% 달성)
  ✅ Generate OUTPUT_PROOF
   ↓
모두 통과 → 자동 배포
   ↓
Claude Code: "✅ compliance-checker 에이전트가 배포되었습니다!"
```

---

## 🎯 주요 명령어

```bash
# 프로젝트 분석
claude code analyze

# 새 에이전트 생성
claude code generate-agent --name "{agent-name}" --category "{dev|ops|deploy|learn}"

# 규칙 검증
claude code validate

# 테스트 실행
claude code test

# 배포 준비 상태 확인
claude code status

# Gogs 푸시
claude code push --target gogs

# 규칙 파일 보기
claude code show-rules

# MCP 서버 상태
claude code mcp-status

# 최근 배포 내역
claude code log --limit 10
```

---

## 📊 대시보드 (선택)

Claude Code 웹앱에서 실시간 모니터링:

```
Dashboard:
├── 에이전트 통계
│   ├── 구현됨: 6개 (Phase 2 + Code-Analyzer)
│   ├── 진행 중: 0개
│   └── 대기 중: 48개
│
├── 배포 준비도
│   ├── Phase 2: 95% ✅
│   └── Phase 3: 25% (하네스 완성)
│
├── CI/CD 상태
│   ├── 최근 빌드: 통과 ✅
│   ├── 커버리지: 100%
│   └── 테스트: 36/36 통과
│
└── 규칙 준수
    ├── 파일 구조: 100% ✅
    ├── 성공 기준: 95% ✅
    └── 일관성: 96.8% ✅
```

---

## 🔒 보안

### 토큰 관리

```bash
# .env 파일 (Git 무시)
GOGS_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# .gitignore
.env
.env.local
.claude/.env.local
mcp-servers/**/*.token
```

### MCP 서버 권한

```json
{
  "mcp": {
    "gogs": {
      "permissions": ["read", "write", "push"],
      "allowedBranches": ["master", "feature-*"],
      "requireApproval": false
    },
    "freelang": {
      "permissions": ["read"],
      "sandbox": true
    },
    "github-actions": {
      "permissions": ["read", "trigger"],
      "allowedWorkflows": ["agent-test.yml"],
      "requireApproval": true
    }
  }
}
```

---

## 📚 참고 자료

### Claude Code 문서
- 공식 가이드: https://claude.com/claude-code
- MCP 스펙: https://www.anthropic.com/research/mcp

### 이 프로젝트 관련
- [HARNESS_RULES.md](HARNESS_RULES.md) — 규칙 정의
- [.github/workflows/agent-test.yml](.github/workflows/agent-test.yml) — GitHub Actions
- [mcp-servers/](mcp-servers/) — MCP 서버 구현

---

## ✅ 체크리스트: Claude Code 적용

```
□ Claude Code CLI 설치
□ 프로젝트 초기화 (claude code init)
□ MCP 서버 3개 등록 (gogs, freelang, github-actions)
□ 규칙 파일 연결 (HARNESS_RULES.md)
□ 환경변수 설정 (.env)
□ IDE 확장 설치 (VS Code / JetBrains)
□ 대시보드 접속 (claude.ai/code)
□ 테스트: 새 에이전트 생성
□ 테스트: 규칙 검증 (자동 감지)
□ 테스트: 배포 자동화
```

---

**다음 단계**:
1. Claude Code CLI 설치
2. MCP 서버 구현 (3개 - 이미 템플릿 제공)
3. 새 에이전트 생성으로 검증
4. 팀 전체에 공유

---

**마지막 업데이트**: 2026-04-04
