/**
 * Gogs MCP Server
 * Claude Code에서 Gogs 저장소와 상호작용
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs").promises;
const path = require("path");

const execAsync = promisify(exec);

class GogsMCPServer {
  constructor() {
    this.name = "gogs";
    this.version = "1.0.0";
    this.baseUrl = "https://gogs.dclub.kr";
    this.token = process.env.GOGS_TOKEN;
    this.repoName = "phase2-agents-harness";
  }

  /**
   * MCP Tools 정의
   */
  getTools() {
    return [
      {
        name: "gogs_clone",
        description: "Gogs 저장소 클론",
        schema: {
          type: "object",
          properties: {
            repo: {
              type: "string",
              description: "저장소 이름 (기본: phase2-agents-harness)",
              default: "phase2-agents-harness"
            },
            branch: {
              type: "string",
              description: "클론할 브랜치",
              default: "master"
            },
            target: {
              type: "string",
              description: "클론할 위치",
              default: "./repo"
            }
          }
        }
      },
      {
        name: "gogs_push",
        description: "변경사항을 Gogs에 푸시",
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Commit 메시지 (규칙: feat: [AGENT-name] 설명)"
            },
            files: {
              type: "array",
              items: { type: "string" },
              description: "추가할 파일 목록"
            },
            branch: {
              type: "string",
              description: "푸시할 브랜치",
              default: "master"
            }
          },
          required: ["message", "files"]
        }
      },
      {
        name: "gogs_pull_request",
        description: "Pull Request 생성",
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "PR 제목"
            },
            body: {
              type: "string",
              description: "PR 설명"
            },
            head: {
              type: "string",
              description: "소스 브랜치",
              default: "feature-*"
            },
            base: {
              type: "string",
              description: "대상 브랜치",
              default: "master"
            }
          },
          required: ["title", "body"]
        }
      },
      {
        name: "gogs_status",
        description: "저장소 상태 확인",
        schema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "확인할 저장소 경로",
              default: "."
            }
          }
        }
      },
      {
        name: "gogs_commit_log",
        description: "최근 커밋 로그 조회",
        schema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "조회할 커밋 개수",
              default: 5
            },
            path: {
              type: "string",
              description: "저장소 경로",
              default: "."
            }
          }
        }
      }
    ];
  }

  /**
   * Tool 처리
   */
  async handle(toolName, input) {
    try {
      switch (toolName) {
        case "gogs_clone":
          return await this.clone(input);
        case "gogs_push":
          return await this.push(input);
        case "gogs_pull_request":
          return await this.createPullRequest(input);
        case "gogs_status":
          return await this.status(input);
        case "gogs_commit_log":
          return await this.commitLog(input);
        default:
          return { error: `Unknown tool: ${toolName}` };
      }
    } catch (error) {
      return {
        error: error.message,
        suggestion: "Check your GOGS_TOKEN environment variable"
      };
    }
  }

  /**
   * 저장소 클론
   */
  async clone(input) {
    const { repo, branch, target } = input;
    const repoUrl = `https://x-access-token:${this.token}@gogs.dclub.kr/kim/${repo}.git`;

    try {
      const cmd = `git clone -b ${branch} ${repoUrl} ${target}`;
      const { stdout, stderr } = await execAsync(cmd);
      return {
        success: true,
        message: `Cloned ${repo} (${branch}) to ${target}`,
        output: stdout || stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 변경사항 푸시
   */
  async push(input) {
    const { message, files, branch } = input;

    try {
      // Add files
      let addCmd = `git add ${files.join(" ")}`;
      await execAsync(addCmd);

      // Commit
      const commitCmd = `git commit -m "${message}"`;
      await execAsync(commitCmd);

      // Push
      const pushCmd = `git push origin ${branch}`;
      const { stdout } = await execAsync(pushCmd);

      return {
        success: true,
        message: `Pushed to ${branch}`,
        details: stdout,
        suggestion: "GitHub Actions will now validate your changes"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: "Check git status and try again"
      };
    }
  }

  /**
   * Pull Request 생성 (API)
   */
  async createPullRequest(input) {
    const { title, body, head, base } = input;

    try {
      const apiUrl = `${this.baseUrl}/api/v1/repos/kim/${this.repoName}/pulls`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `token ${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          body,
          head,
          base
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        prNumber: data.number,
        prUrl: data.html_url,
        message: `Pull Request #${data.number} created`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 저장소 상태
   */
  async status(input) {
    const { path } = input;

    try {
      const oldCwd = process.cwd();
      process.chdir(path);

      const { stdout } = await execAsync("git status --porcelain");
      const logOutput = await execAsync("git log --oneline -3");

      process.chdir(oldCwd);

      return {
        success: true,
        changes: stdout.split("\n").filter(l => l),
        recentCommits: logOutput.stdout.split("\n").filter(l => l)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 커밋 로그 조회
   */
  async commitLog(input) {
    const { limit, path } = input;

    try {
      const oldCwd = process.cwd();
      process.chdir(path);

      const { stdout } = await execAsync(`git log --oneline -${limit}`);

      process.chdir(oldCwd);

      return {
        success: true,
        commits: stdout.split("\n").filter(l => l).map(line => ({
          hash: line.split(" ")[0],
          message: line.substring(7)
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// MCP Server Handler
async function main() {
  const server = new GogsMCPServer();

  if (!server.token) {
    console.error("❌ Error: GOGS_TOKEN environment variable not set");
    process.exit(1);
  }

  // 수신 대기 (JSON-RPC 형식)
  let inputData = "";
  process.stdin.on("data", chunk => {
    inputData += chunk.toString();

    try {
      const request = JSON.parse(inputData);
      inputData = "";

      if (request.method === "tools/list") {
        process.stdout.write(JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            tools: server.getTools()
          }
        }) + "\n");
      } else if (request.method === "tools/call") {
        server.handle(request.params.name, request.params.arguments)
          .then(result => {
            process.stdout.write(JSON.stringify({
              jsonrpc: "2.0",
              id: request.id,
              result
            }) + "\n");
          })
          .catch(error => {
            process.stdout.write(JSON.stringify({
              jsonrpc: "2.0",
              id: request.id,
              error: { message: error.message }
            }) + "\n");
          });
      }
    } catch (e) {
      // JSON 파싱 오류 (완전하지 않은 입력)
    }
  });

  console.error("✅ Gogs MCP Server started (waiting for requests)");
}

main().catch(console.error);

module.exports = { GogsMCPServer };
