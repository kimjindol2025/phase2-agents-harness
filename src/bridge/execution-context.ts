/**
 * FreeLang 브리지 실행 컨텍스트
 * .fl 파일 정적 분석 및 실행 설정
 */

export interface ExecutionConfig {
  agentId: string;
  mode: 'mock' | 'subprocess' | 'wasm';
  freelangPath?: string;
  timeout?: number;
  verbose?: boolean;
}

export interface AgentFile {
  path: string;
  name: string; // parser.fl, analyzer.fl, proof.fl
  content: string;
}

export interface AgentStructure {
  agentId: string;
  files: AgentFile[];
  parser?: AgentFile;
  analyzer?: AgentFile;
  proof?: AgentFile;
  valid: boolean;
  errors: string[];
}

export interface ExecutionResult {
  status: 'success' | 'failure';
  agentId: string;
  executionTimeMs: number;
  results?: {
    accuracy: number;
    detectionRate: number;
    falsePositive: number;
    executionTime: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface SuccessCriteria {
  accuracy: { target: number; actual?: number; passed?: boolean };
  detectionRate: { target: number; actual?: number; passed?: boolean };
  falsePositive: { target: number; actual?: number; passed?: boolean };
  executionTime: { target: number; actual?: number; passed?: boolean };
}

export class ExecutionContext {
  private config: ExecutionConfig;
  private agentRoot: string;

  constructor(config: ExecutionConfig) {
    this.config = config;
    this.agentRoot = process.env.FREELANG_HOME || '.';
  }

  getAgentPath(agentId: string): string {
    return `${this.agentRoot}/agents-impl/${agentId}`;
  }

  getProofPath(agentId: string): string {
    return `${this.agentRoot}/proofs/${agentId}_PROOF.md`;
  }

  getConfig(): ExecutionConfig {
    return this.config;
  }

  getMode(): 'mock' | 'subprocess' | 'wasm' {
    return this.config.mode;
  }
}
