# AI 에이전트 하네스 성능 모니터링 및 문서화

**최종 업데이트**: 2026-04-04
**상태**: Phase 2 모니터링 체계화

---

## 개요

이 문서는 54개 AI 에이전트 하네스의 성능 모니터링 및 자동 문서화 전략을 정의합니다.

### 모니터링 범위
- **실행 시간**: 각 에이전트 및 오케스트레이터
- **메모리 사용량**: 최대, 평균, 피크
- **에러율**: 검증 오류, 실행 오류, 복구 성공률
- **처리량**: 초당 요청 수, 병렬 처리 효율성

### 문서화 대상
- **API 스펙**: OpenAPI 3.0 형식
- **설계 문서**: 아키텍처, 의존성, 워크플로우
- **운영 가이드**: 배포, 모니터링, 문제 해결
- **성능 리포트**: 벤치마크, 최적화 제안

---

## 1. 성능 모니터링

### 1.1 메트릭 수집

#### 메트릭 타입 정의

```freelang
// standards/metrics-collector.fl

module metrics_collector

struct ExecutionMetrics {
    agent_id: str
    start_time: i64              // Unix timestamp in milliseconds
    end_time: i64
    duration_ms: i32
    status: str                  // "success" | "failure" | "timeout"
    error_code: str             // 에러 코드 또는 ""
    memory_used_mb: f64
    memory_peak_mb: f64
    input_size_bytes: i32
    output_size_bytes: i32
    retry_count: i32
    confidence_score: f64
}

struct PerformanceReport {
    timestamp: str
    metrics: [ExecutionMetrics]
    summary: MetricsSummary
    anomalies: [str]
}

struct MetricsSummary {
    total_executions: i32
    successful_executions: i32
    failed_executions: i32
    average_duration_ms: i32
    p50_duration_ms: i32
    p95_duration_ms: i32
    p99_duration_ms: i32
    max_duration_ms: i32
    error_rate: f64             // 0.0 ~ 1.0
    success_rate: f64
    average_memory_mb: f64
    peak_memory_mb: f64
}

// 메트릭 수집 함수
fn collect_execution_metrics(
    agent_id: str,
    start_time: i64,
    end_time: i64,
    status: str,
    memory_used: f64,
    input_size: i32,
    output_size: i32
) -> ExecutionMetrics {
    return ExecutionMetrics {
        agent_id: agent_id,
        start_time: start_time,
        end_time: end_time,
        duration_ms: (end_time - start_time) as i32,
        status: status,
        error_code: "",
        memory_used_mb: memory_used,
        memory_peak_mb: memory_used,
        input_size_bytes: input_size,
        output_size_bytes: output_size,
        retry_count: 0,
        confidence_score: 0.0
    }
}

// 메트릭 저장 함수
fn store_metrics(metrics: ExecutionMetrics) -> bool {
    // 데이터베이스 또는 파일에 저장
    // TODO: 구현
    return true
}

// 메트릭 집계 함수
fn aggregate_metrics(metrics: [ExecutionMetrics]) -> MetricsSummary {
    var summary = MetricsSummary {
        total_executions: length(metrics),
        successful_executions: 0,
        failed_executions: 0,
        average_duration_ms: 0,
        p50_duration_ms: 0,
        p95_duration_ms: 0,
        p99_duration_ms: 0,
        max_duration_ms: 0,
        error_rate: 0.0,
        success_rate: 0.0,
        average_memory_mb: 0.0,
        peak_memory_mb: 0.0
    }

    // TODO: 실제 집계 로직 구현

    return summary
}

// 이상 탐지 함수
fn detect_anomalies(metrics: [ExecutionMetrics]) -> [str] {
    var anomalies = []

    // 성능 저하 감지
    var average_duration = calculate_average_duration(metrics)
    var i = 0
    while i < length(metrics) {
        var metric = metrics[i]
        if (metric.duration_ms as f64) > (average_duration * 1.5) {
            anomalies.push("Performance degradation: " + metric.agent_id)
        }
        i = i + 1
    }

    // 메모리 누수 감지
    var average_memory = calculate_average_memory(metrics)
    i = 0
    while i < length(metrics) {
        var metric = metrics[i]
        if metric.memory_peak_mb > (average_memory * 2.0) {
            anomalies.push("Memory spike: " + metric.agent_id)
        }
        i = i + 1
    }

    return anomalies
}
```

#### 메트릭 수집 포인트

오케스트레이터에 다음 포인트에서 메트릭을 수집합니다:

```freelang
// orchestrator.fl 수정

fn execute_agent_with_monitoring(agent_id: str, input: str, config: Config) -> Result {
    // Step 1: 실행 전 메트릭
    var start_time = get_current_time_ms()
    var start_memory = get_memory_usage()

    try {
        // Step 2: 에이전트 실행
        var result = run_agent(agent_id, input)

        // Step 3: 실행 후 메트릭
        var end_time = get_current_time_ms()
        var end_memory = get_memory_usage()

        // Step 4: 메트릭 수집
        var metrics = metrics_collector::collect_execution_metrics(
            agent_id,
            start_time,
            end_time,
            "success",
            end_memory - start_memory,
            length(input),
            length(result)
        )

        // Step 5: 메트릭 저장
        metrics_collector::store_metrics(metrics)

        return Result::Ok(result)
    } catch error {
        // 실패 시 메트릭
        var end_time = get_current_time_ms()
        var metrics = metrics_collector::collect_execution_metrics(
            agent_id,
            start_time,
            end_time,
            "failure",
            get_memory_usage() - start_memory,
            length(input),
            0
        )

        metrics_collector::store_metrics(metrics)
        return Result::Err(error)
    }
}
```

### 1.2 성능 대시보드

**파일**: `scripts/performance-dashboard.js`

```javascript
// Node.js Express 기반 대시보드

const express = require('express');
const app = express();

// 메트릭 조회 API
app.get('/api/metrics/:agent_id', (req, res) => {
    // agent_id의 최근 메트릭 조회
    const metrics = queryMetrics(req.params.agent_id);
    res.json({
        agent_id: req.params.agent_id,
        metrics: metrics,
        summary: calculateSummary(metrics),
        anomalies: detectAnomalies(metrics)
    });
});

// 대시보드 UI
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Agent Harness - Performance Dashboard</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body { font-family: Arial; margin: 20px; }
                .metric-card { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
                .chart { width: 100%; height: 300px; }
            </style>
        </head>
        <body>
            <h1>AI Agent Harness - Performance Dashboard</h1>

            <div class="metric-card">
                <h2>Execution Time Distribution</h2>
                <canvas id="executionTimeChart" class="chart"></canvas>
            </div>

            <div class="metric-card">
                <h2>Memory Usage</h2>
                <canvas id="memoryChart" class="chart"></canvas>
            </div>

            <div class="metric-card">
                <h2>Error Rate</h2>
                <canvas id="errorRateChart" class="chart"></canvas>
            </div>

            <div class="metric-card">
                <h2>Agent Performance Comparison</h2>
                <canvas id="comparisonChart" class="chart"></canvas>
            </div>

            <script>
                // 메트릭 데이터 로드 및 차트 렌더링
                fetch('/api/metrics/all')
                    .then(res => res.json())
                    .then(data => {
                        // 차트 생성 코드
                        const ctx = document.getElementById('executionTimeChart').getContext('2d');
                        new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: data.agents.map(a => a.id),
                                datasets: [{
                                    label: 'Average Duration (ms)',
                                    data: data.agents.map(a => a.avg_duration_ms),
                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: { beginAtZero: true }
                                }
                            }
                        });
                    });
            </script>
        </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('Performance Dashboard running at http://localhost:3000');
});
```

### 1.3 성능 임계값 및 알림

```freelang
// standards/performance-thresholds.fl

module performance_thresholds

struct PerformanceThreshold {
    agent_id: str
    max_duration_ms: i32
    max_memory_mb: f64
    min_success_rate: f64
    max_error_rate: f64
}

fn create_default_thresholds() -> [PerformanceThreshold] {
    var thresholds = [
        PerformanceThreshold {
            agent_id: "sql-optimizer",
            max_duration_ms: 1000,
            max_memory_mb: 100.0,
            min_success_rate: 0.99,
            max_error_rate: 0.01
        },
        PerformanceThreshold {
            agent_id: "security-scanner",
            max_duration_ms: 1500,
            max_memory_mb: 150.0,
            min_success_rate: 0.99,
            max_error_rate: 0.01
        },
        PerformanceThreshold {
            agent_id: "document-generator",
            max_duration_ms: 2000,
            max_memory_mb: 150.0,
            min_success_rate: 0.98,
            max_error_rate: 0.02
        },
        PerformanceThreshold {
            agent_id: "log-analyzer",
            max_duration_ms: 3000,
            max_memory_mb: 100.0,
            min_success_rate: 0.98,
            max_error_rate: 0.02
        },
        PerformanceThreshold {
            agent_id: "performance-profiler",
            max_duration_ms: 2000,
            max_memory_mb: 150.0,
            min_success_rate: 0.98,
            max_error_rate: 0.02
        }
    ]

    return thresholds
}

fn validate_performance(metrics: ExecutionMetrics, threshold: PerformanceThreshold) -> [str] {
    var violations = []

    if metrics.duration_ms > threshold.max_duration_ms {
        violations.push("Duration exceeded: " + str(metrics.duration_ms) + "ms > " + str(threshold.max_duration_ms) + "ms")
    }

    if metrics.memory_used_mb > threshold.max_memory_mb {
        violations.push("Memory exceeded: " + str(metrics.memory_used_mb) + "MB > " + str(threshold.max_memory_mb) + "MB")
    }

    return violations
}

fn send_alert(agent_id: str, violation: str) {
    // TODO: Slack, Email, PagerDuty 등으로 알림 발송
    print("[ALERT] " + agent_id + ": " + violation)
}
```

---

## 2. 자동 문서화

### 2.1 OpenAPI 스펙 생성

**파일**: `scripts/generate-openapi.js`

```javascript
// OpenAPI 스펙 자동 생성

const agents = [
    {
        id: "sql-optimizer",
        name: "SQL Query Optimizer",
        category: "dev",
        description: "Optimizes database queries for better performance",
        inputs: {
            type: "object",
            properties: {
                sql_code: { type: "string", description: "SQL query to optimize" },
                max_size: { type: "integer", description: "Maximum query size in bytes" }
            },
            required: ["sql_code"]
        },
        outputs: {
            type: "object",
            properties: {
                status: { type: "string" },
                optimization_result: { type: "object" },
                recommendations: { type: "array" }
            }
        },
        performance: {
            avg_execution_ms: 800,
            p95_execution_ms: 1200,
            max_memory_mb: 100,
            success_rate: 0.99
        }
    },
    // ... 더 많은 에이전트
];

function generateOpenAPI() {
    const openapi = {
        openapi: "3.0.0",
        info: {
            title: "AI Agent Harness API",
            version: "1.0.0",
            description: "54 specialized AI agents for code analysis and optimization"
        },
        servers: [
            {
                url: "https://api.agents.local",
                description: "Production API"
            }
        ],
        paths: {}
    };

    // 각 에이전트별 엔드포인트 생성
    agents.forEach(agent => {
        const path = `/agents/${agent.id}`;
        openapi.paths[path] = {
            post: {
                summary: agent.name,
                description: agent.description,
                operationId: `execute${agent.id}`,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: agent.inputs
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Successful execution",
                        content: {
                            "application/json": {
                                schema: agent.outputs
                            }
                        }
                    },
                    400: { description: "Invalid input" },
                    408: { description: "Request timeout" },
                    500: { description: "Internal error" }
                }
            }
        };
    });

    return openapi;
}

const openapi = generateOpenAPI();
console.log(JSON.stringify(openapi, null, 2));
```

생성된 OpenAPI 스펙 예제:

```yaml
openapi: 3.0.0
info:
  title: AI Agent Harness API
  version: 1.0.0
  description: 54 specialized AI agents for code analysis and optimization

paths:
  /agents/sql-optimizer:
    post:
      summary: SQL Query Optimizer
      description: Optimizes database queries for better performance
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                sql_code:
                  type: string
                  description: SQL query to optimize
                max_size:
                  type: integer
                  description: Maximum query size in bytes
              required:
                - sql_code
      responses:
        '200':
          description: Successful execution
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [success, partial, failed]
                  optimization_result:
                    type: object
                    properties:
                      query: { type: string }
                      improvement: { type: number }
                      recommendations: { type: array }
        '400':
          description: Invalid SQL query
        '408':
          description: Request timeout
        '500':
          description: Internal error

  /agents/security-scanner:
    post:
      summary: Security Vulnerability Scanner
      description: Detects security vulnerabilities in source code
      # ... 유사한 구조
```

### 2.2 마크다운 문서 생성

**파일**: `scripts/generate-docs.js`

```javascript
// 마크다운 문서 자동 생성

function generateAgentDoc(agent) {
    return `
# ${agent.name} Agent

## Overview
- **ID**: \`${agent.id}\`
- **Category**: \`${agent.category}\`
- **Confidence**: ${agent.confidence || "0.90"}
- **Execution Time**: ${agent.performance?.avg_execution_ms || "TBD"}ms (avg), ${agent.performance?.p95_execution_ms || "TBD"}ms (P95)

## Description
${agent.description}

## Inputs

### Request Schema
\`\`\`json
${JSON.stringify(agent.inputs, null, 2)}
\`\`\`

### Parameters
${Object.entries(agent.inputs.properties || {}).map(([key, prop]) =>
    `- **${key}** (${prop.type}${agent.inputs.required?.includes(key) ? ', required' : ''}): ${prop.description}`
).join('\n')}

## Outputs

### Response Schema
\`\`\`json
${JSON.stringify(agent.outputs, null, 2)}
\`\`\`

## Examples

### Example Request
\`\`\`bash
curl -X POST https://api.agents.local/agents/${agent.id} \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "SELECT * FROM users WHERE id = 1"
  }'
\`\`\`

### Example Response
\`\`\`json
{
  "status": "success",
  "result": {...},
  "execution_time_ms": 850
}
\`\`\`

## Dependencies
${agent.dependencies?.length ? agent.dependencies.map(d => `- ${d}`).join('\n') : "None"}

## Performance Metrics
- **Average Execution**: ${agent.performance?.avg_execution_ms || "TBD"}ms
- **P95 Latency**: ${agent.performance?.p95_execution_ms || "TBD"}ms
- **Max Memory**: ${agent.performance?.max_memory_mb || "TBD"}MB
- **Success Rate**: ${(agent.performance?.success_rate * 100) || "TBD"}%

## Error Handling
| Error | Recovery |
|-------|----------|
| Validation Error | Reject input, return 400 |
| Timeout | Retry with increased timeout |
| Resource Error | Retry after delay |

## Testing
See \`tests/${agent.id}/\` for unit and integration tests.
`;
}

function generateAgentsDocs(agents) {
    agents.forEach(agent => {
        const doc = generateAgentDoc(agent);
        const filename = \`docs/agents/\${agent.id}.md\`;
        // 파일 저장
        writeFile(filename, doc);
    });
}
```

### 2.3 아키텍처 다이어그램 생성

**파일**: `scripts/generate-architecture.js`

```javascript
// PlantUML 기반 아키텍처 다이어그램 생성

function generateDependencyGraph() {
    const graph = `
@startuml agent-dependency-graph

package "Development Agents" {
    [code-analyzer]
    [refactor-suggester]
    [test-generator]
    [security-hardener]
}

package "Operations Agents" {
    [health-monitor]
    [log-analyzer]
    [performance-profiler]
    [incident-responder]
}

package "Deployment Agents" {
    [pipeline-builder]
    [ci-optimizer]
    [deployment-validator]
}

package "Learning Agents" {
    [document-generator]
    [training-material-generator]
    [requirement-analyzer]
}

[code-analyzer] --> [refactor-suggester]
[code-analyzer] --> [test-generator]
[code-analyzer] --> [security-hardener]
[log-analyzer] --> [incident-responder]
[performance-profiler] --> [incident-responder]

@enduml
    `;

    return graph;
}

function generateExecutionFlow() {
    const flow = `
@startuml execution-flow

start
:Input Code;
:Validate Input;
if (Valid?) then (no)
    :Return Error;
    end
else (yes)
    :Load Agent Registry;
    :Resolve Dependencies;
    if (Circular?) then (yes)
        :Return Error;
        end
    else (no)
        :Execute Agents (Sequential/Parallel);
        :Monitor Performance;
        :Collect Results;
        :Format Output;
        :Return Success;
        end
    endif
endif

@enduml
    `;

    return flow;
}
```

---

## 3. 배포 및 모니터링

### 3.1 GitHub Actions 성능 모니터링

**파일**: `.github/workflows/performance.yml`

```yaml
name: Performance Monitoring

on:
  schedule:
    - cron: '0 * * * *'  # 매 시간 실행
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install FreeLang
        run: |
          curl -sSL https://releases.freelang.io/freelang-linux-x64 -o freelang
          chmod +x freelang
          sudo mv freelang /usr/local/bin/

      - name: Run Performance Tests
        run: |
          make test-performance > performance-results.json

      - name: Generate Performance Report
        run: |
          node scripts/generate-performance-report.js performance-results.json

      - name: Upload Metrics
        uses: actions/upload-artifact@v2
        with:
          name: performance-report
          path: performance-report.html

      - name: Check Threshold Violations
        run: |
          node scripts/check-thresholds.js performance-results.json

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('performance-results.json', 'utf8'));
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Performance Report\n' + generateSummary(report)
            });

      - name: Publish to Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./performance-reports
```

### 3.2 성능 리포트 생성

**파일**: `scripts/generate-performance-report.js`

```javascript
const fs = require('fs');

function generatePerformanceReport(metricsFile) {
    const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>AI Agent Harness - Performance Report</title>
    <style>
        body { font-family: 'Segoe UI'; margin: 20px; }
        .card { border: 1px solid #e0e0e0; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px 20px; }
        .warning { color: #ff9800; font-weight: bold; }
        .error { color: #f44336; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>AI Agent Harness - Performance Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>

    <div class="card">
        <h2>Summary</h2>
        <div class="metric">
            <strong>Total Agents:</strong> ${metrics.agents.length}
        </div>
        <div class="metric">
            <strong>Average Execution:</strong> ${Math.round(metrics.average_execution_ms)}ms
        </div>
        <div class="metric">
            <strong>Success Rate:</strong> ${(metrics.success_rate * 100).toFixed(2)}%
        </div>
    </div>

    <div class="card">
        <h2>Agent Performance</h2>
        <table>
            <tr>
                <th>Agent</th>
                <th>Avg (ms)</th>
                <th>P95 (ms)</th>
                <th>Memory (MB)</th>
                <th>Success Rate</th>
            </tr>
            ${metrics.agents.map(agent => `
            <tr>
                <td>${agent.id}</td>
                <td>${agent.avg_execution_ms}</td>
                <td>${agent.p95_execution_ms}</td>
                <td>${agent.memory_mb.toFixed(1)}</td>
                <td>${(agent.success_rate * 100).toFixed(2)}%</td>
            </tr>
            `).join('')}
        </table>
    </div>

    <div class="card">
        <h2>Alerts</h2>
        ${metrics.violations.length > 0 ? `
            ${metrics.violations.map(v => `<p class="warning">⚠️ ${v}</p>`).join('')}
        ` : '<p>No threshold violations detected.</p>'}
    </div>
</body>
</html>
    `;

    fs.writeFileSync('performance-report.html', html);
    console.log('Report generated: performance-report.html');
}

generatePerformanceReport(process.argv[2]);
```

---

## 4. 체크리스트

### 메트릭 수집
- [ ] 메트릭 수집 함수 구현
- [ ] 데이터 저장소 설정
- [ ] 이상 탐지 로직 구현

### 성능 모니터링
- [ ] 성능 임계값 정의
- [ ] 알림 시스템 구현
- [ ] 대시보드 배포

### 자동 문서화
- [ ] OpenAPI 스펙 생성
- [ ] 마크다운 문서 생성
- [ ] 다이어그램 생성

### CI/CD 통합
- [ ] GitHub Actions 워크플로우 설정
- [ ] 성능 리포트 생성
- [ ] PR 코멘트 자동화

---

## 5. 참고 자료

- 성능 테스트: `tests/performance/`
- 검증 표준: `standards/validation-harness.fl`
- 에러 처리: `standards/error-handling-harness.fl`
- 통합 가이드: `standards/INTEGRATION_GUIDE.md`

---

**마지막 업데이트**: 2026-04-04
**작성자**: Code Review Team
**버전**: 1.0
