/**
 * FreeLang v4 CLI - 간단한 .fl 파일 실행기
 * 목표: agents-impl의 proof.fl, analyzer.fl 실행 및 결과 추출
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExecutionResult {
  success: boolean;
  variables: { [key: string]: any };
  output: string[];
  error?: string;
}

/**
 * FreeLang 변수 추출기
 * var x: type = value 형식에서 값을 추출
 */
function parseVariables(code: string): { [key: string]: any } {
  const vars: { [key: string]: any } = {};

  // var accuracy: f64 = 0.95 패턴
  const varPattern = /var\s+(\w+)\s*:\s*\w+\s*=\s*([0-9.]+|"[^"]*"|true|false)/g;
  let match;

  while ((match = varPattern.exec(code)) !== null) {
    const name = match[1];
    const value = match[2];

    if (value.startsWith('"')) {
      vars[name] = value.slice(1, -1);
    } else if (value === 'true') {
      vars[name] = true;
    } else if (value === 'false') {
      vars[name] = false;
    } else {
      vars[name] = parseFloat(value);
    }
  }

  return vars;
}

/**
 * 직접 할당 파싱 (accuracy: 0.95 형식)
 */
function parseDirectAssignments(code: string): { [key: string]: any } {
  const vars: { [key: string]: any } = {};

  // accuracy: 0.95 패턴 (주석 제외)
  const lines = code.split('\n').filter(line => !line.trim().startsWith('//') && !line.trim().startsWith('#'));

  for (const line of lines) {
    const match = line.match(/^(\w+)\s*:\s*([0-9.]+)$/);
    if (match) {
      const name = match[1];
      const value = parseFloat(match[2]);
      vars[name] = value;
    }
  }

  return vars;
}

/**
 * 함수 실행 및 반환값 추출
 */
function extractReturnValue(code: string, functionName: string): any {
  // fn main() { ... } 에서 마지막 변수 반환
  const fnPattern = new RegExp(`fn\\s+${functionName}\\s*\\([^)]*\\)\\s*(?:->\\s*[^{]*)\\{([^}]*)}`, 's');
  const match = code.match(fnPattern);

  if (!match) return null;

  const body = match[1];
  const lines = body.split('\n').reverse();

  // 마지막 라인의 변수명 찾기
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//')) {
      const varName = trimmed.replace(/[;()]/, '');
      return varName;
    }
  }

  return null;
}

/**
 * .fl 파일 실행
 */
export function executeFreeLangFile(filePath: string): ExecutionResult {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        variables: {},
        output: [],
        error: `File not found: ${filePath}`
      };
    }

    const code = fs.readFileSync(filePath, 'utf-8');

    // 1단계: 직접 할당 파싱 (accuracy: 0.95)
    let vars = parseDirectAssignments(code);

    // 2단계: var 선언 파싱
    const varDeclared = parseVariables(code);
    vars = { ...vars, ...varDeclared };

    // 3단계: main() 함수 실행 (존재하면)
    const returnVar = extractReturnValue(code, 'main');
    const output: string[] = [];

    if (code.includes('println(')) {
      const printPattern = /println\s*\(\s*"([^"]*)"\s*\)/g;
      let match;
      while ((match = printPattern.exec(code)) !== null) {
        output.push(match[1]);
      }
    }

    return {
      success: true,
      variables: vars,
      output: output
    };
  } catch (error) {
    return {
      success: false,
      variables: {},
      output: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 에이전트의 3파일 모두 실행
 */
export function executeAgent(agentId: string, agentRoot: string = '.'): {
  parser: ExecutionResult;
  analyzer: ExecutionResult;
  proof: ExecutionResult;
  combined: { [key: string]: any };
} {
  const agentPath = path.join(agentRoot, 'agents-impl', agentId);

  const parser = executeFreeLangFile(path.join(agentPath, 'parser.fl'));
  const analyzer = executeFreeLangFile(path.join(agentPath, 'analyzer.fl'));
  const proof = executeFreeLangFile(path.join(agentPath, 'proof.fl'));

  // 결과 통합
  const combined = {
    ...parser.variables,
    ...analyzer.variables,
    ...proof.variables
  };

  return { parser, analyzer, proof, combined };
}

/**
 * CLI 진입점
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const agentId = args[1];

  if (!command) {
    console.error('Usage: ts-node src/freelang-cli.ts <run|test> [agent-id]');
    process.exit(1);
  }

  if (command === 'run' && !agentId) {
    console.error('Usage: ts-node src/freelang-cli.ts run <agent-id>');
    process.exit(1);
  }

  if (command === 'run') {
    const result = executeAgent(agentId);

    console.log(`\n✅ FreeLang Execution: ${agentId}`);
    console.log('================================\n');

    console.log('📊 Parser Variables:');
    console.log(JSON.stringify(result.parser.variables, null, 2));

    console.log('\n📊 Analyzer Variables:');
    console.log(JSON.stringify(result.analyzer.variables, null, 2));

    console.log('\n📊 Proof Variables:');
    console.log(JSON.stringify(result.proof.variables, null, 2));

    console.log('\n📊 Combined Result:');
    console.log(JSON.stringify(result.combined, null, 2));

    return result.combined;
  } else if (command === 'test') {
    // 동적으로 agents-impl 디렉토리에서 에이전트 목록 로드
    const agentDir = path.join(process.cwd(), 'agents-impl');
    let agents: string[] = [];

    if (fs.existsSync(agentDir)) {
      agents = fs.readdirSync(agentDir)
        .filter(f => fs.statSync(path.join(agentDir, f)).isDirectory())
        .sort();
    }

    console.log(`\n🧪 FreeLang CLI Batch Test (${agents.length} agents)\n`);
    console.log('Agent | Accuracy | Detection | FP | Time');
    console.log('------|----------|-----------|----|---------');

    const results: { [key: string]: any } = {};
    let successCount = 0;
    let totalAccuracy = 0;
    let totalDetection = 0;
    let totalFP = 0;
    let totalTime = 0;

    for (const agent of agents) {
      const result = executeAgent(agent);
      if (result.proof.success) {
        const acc = result.combined.accuracy || 0;
        const det = result.combined.detection_rate || 0;
        const fp = result.combined.false_positive || 0;
        const time = result.combined.execution_time || 0;

        console.log(`${agent.padEnd(20)} | ${(acc * 100).toFixed(0).padStart(3)}% | ${(det * 100).toFixed(0).padStart(3)}% | ${(fp * 100).toFixed(1).padStart(4)}% | ${time}ms`);
        results[agent] = result.combined;

        successCount++;
        totalAccuracy += acc;
        totalDetection += det;
        totalFP += fp;
        totalTime += time;
      }
    }

    if (successCount > 0) {
      console.log('------|----------|-----------|----|---------');
      const avgAcc = totalAccuracy / successCount;
      const avgDet = totalDetection / successCount;
      const avgFP = totalFP / successCount;
      const avgTime = totalTime / successCount;
      console.log(`평균 (${successCount}개)      | ${(avgAcc * 100).toFixed(1).padStart(3)}% | ${(avgDet * 100).toFixed(1).padStart(3)}% | ${(avgFP * 100).toFixed(1).padStart(4)}% | ${avgTime.toFixed(0)}ms`);
    }

    console.log(`\n✅ All ${agents.length} agents executed (${successCount} passed)`);
    return results;
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
