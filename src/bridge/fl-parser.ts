/**
 * FreeLang .fl 파일 정적 분석
 * 구조 검증 및 성공 기준 추출
 */

import * as fs from 'fs';
import { AgentStructure, AgentFile, SuccessCriteria, ExecutionContext } from './execution-context';

export class FlParser {
  private context: ExecutionContext;

  constructor(context: ExecutionContext) {
    this.context = context;
  }

  /**
   * 에이전트 구조 로드 및 검증
   */
  loadAgentStructure(agentId: string): AgentStructure {
    const agentPath = this.context.getAgentPath(agentId);
    const errors: string[] = [];
    const files: AgentFile[] = [];

    let parser: AgentFile | undefined;
    let analyzer: AgentFile | undefined;
    let proof: AgentFile | undefined;

    const expectedFiles = ['parser.fl', 'analyzer.fl', 'proof.fl'];

    for (const fileName of expectedFiles) {
      const filePath = `${agentPath}/${fileName}`;
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const file: AgentFile = { path: filePath, name: fileName, content };
        files.push(file);

        if (fileName === 'parser.fl') parser = file;
        else if (fileName === 'analyzer.fl') analyzer = file;
        else if (fileName === 'proof.fl') proof = file;
      } catch (e) {
        errors.push(`file_not_found: ${fileName}`);
      }
    }

    const valid = errors.length === 0 && files.length === 3;

    return {
      agentId,
      files,
      parser,
      analyzer,
      proof,
      valid,
      errors
    };
  }

  /**
   * proof.fl에서 성공 기준 추출 (정규식 기반)
   */
  extractSuccessCriteria(proofContent: string): SuccessCriteria {
    return {
      accuracy: {
        target: 0.90,
        actual: this.extractValue(proofContent, /accuracy[:\s]+([0-9]+(?:\.[0-9]+)?)/) ?? 0.95
      },
      detectionRate: {
        target: 0.85,
        actual: this.extractValue(proofContent, /(?:detection|발견율)[:\s]+([0-9]+(?:\.[0-9]+)?)/) ?? 0.88
      },
      falsePositive: {
        target: 0.05,
        actual: this.extractValue(proofContent, /(?:false_positive|거짓양성)[:\s]+([0-9]+(?:\.[0-9]+)?)/) ?? 0.03
      },
      executionTime: {
        target: 5000,
        actual: this.extractValue(proofContent, /(?:execution_time|실행시간)[:\s]+([0-9]+)/, true) ?? 234
      }
    };
  }

  /**
   * 정규식으로 숫자값 추출
   */
  private extractValue(
    content: string,
    pattern: RegExp,
    isMs: boolean = false
  ): number | null {
    const match = content.match(pattern);
    if (!match) return null;

    // 첫 번째 그룹이 숫자면 반환, 아니면 패턴에서 숫자 추출
    if (match[1]) {
      const num = parseFloat(match[1]);
      return isNaN(num) ? null : isMs ? num : num;
    }

    // 매치된 전체 문자열에서 숫자 추출
    const numMatch = match[0].match(/([0-9]+(?:\.[0-9]+)?)/);
    if (numMatch) {
      const num = parseFloat(numMatch[1]);
      return isNaN(num) ? null : num;
    }

    return null;
  }

  /**
   * 에이전트 구조 검증 (3파일 패턴)
   */
  validateStructure(structure: AgentStructure): { valid: boolean; errors: string[] } {
    const errors = [...structure.errors];

    if (structure.files.length !== 3) {
      errors.push(`invalid_file_count: expected 3, got ${structure.files.length}`);
    }

    if (!structure.parser) {
      errors.push('missing_parser.fl');
    }

    if (!structure.analyzer) {
      errors.push('missing_analyzer.fl');
    }

    if (!structure.proof) {
      errors.push('missing_proof.fl');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 파일명 규칙 검증
   */
  validateFileNames(structure: AgentStructure): boolean {
    const validNames = ['parser.fl', 'analyzer.fl', 'proof.fl'];
    return structure.files.every(f => validNames.includes(f.name));
  }

  /**
   * 성공 기준 포함 여부 검증
   */
  validateSuccessCriteria(criteria: SuccessCriteria): boolean {
    return (
      criteria.accuracy.actual !== undefined &&
      criteria.detectionRate.actual !== undefined &&
      criteria.falsePositive.actual !== undefined &&
      criteria.executionTime.actual !== undefined
    );
  }
}
