/**
 * FreeLang 브리지 테스트
 */

import FreeLangBridge from '../src/bridge/freelang-bridge';
import { ExecutionResult } from '../src/bridge/execution-context';
import * as fs from 'fs';
import * as path from 'path';

describe('FreeLangBridge', () => {
  let bridge: FreeLangBridge;
  const testAgentId = 'test-agent';
  const agentPath = path.join(process.env.FREELANG_HOME || '.', 'agents-impl', testAgentId);

  beforeAll(() => {
    // 테스트 에이전트 스켈레톤 생성
    if (!fs.existsSync(agentPath)) {
      fs.mkdirSync(agentPath, { recursive: true });
    }

    // parser.fl
    fs.writeFileSync(
      path.join(agentPath, 'parser.fl'),
      `struct ParserResult {
        success: bool
        tokens: int
      }

      fn parse(code: str) -> ParserResult {
        return ParserResult { success: true, tokens: 10 }
      }`
    );

    // analyzer.fl
    fs.writeFileSync(
      path.join(agentPath, 'analyzer.fl'),
      `struct AnalysisResult {
        issues: int
        severity: str
      }

      fn analyze(tokens: int) -> AnalysisResult {
        return AnalysisResult { issues: 1, severity: "low" }
      }`
    );

    // proof.fl
    fs.writeFileSync(
      path.join(agentPath, 'proof.fl'),
      `# Test Agent Proof

      accuracy: 0.95 (목표 90%)
      detection_rate: 0.88 (목표 85%)
      false_positive: 0.03 (목표 5%)
      execution_time: 234ms (목표 5000ms)

      fn verify_success() -> bool {
        return true
      }`
    );

    bridge = new FreeLangBridge({
      agentId: testAgentId,
      mode: 'mock',
      verbose: false
    });
  });

  afterAll(() => {
    // 테스트 파일 정리
    try {
      fs.rmSync(agentPath, { recursive: true });
    } catch {
      // ignore
    }
  });

  describe('agent execution', () => {
    test('should successfully run a valid agent', async () => {
      const result = await bridge.run(testAgentId);

      expect(result.status).toBe('success');
      expect(result.agentId).toBe(testAgentId);
      expect(result.executionTimeMs).toBeGreaterThan(0);
      expect(result.results).toBeDefined();
    });

    test('should extract accuracy from proof.fl', async () => {
      const result = await bridge.run(testAgentId);

      expect(result.results?.accuracy).toBe(0.95);
      expect(result.results?.accuracy).toBeGreaterThanOrEqual(0.90);
    });

    test('should extract detection rate from proof.fl', async () => {
      const result = await bridge.run(testAgentId);

      expect(result.results?.detectionRate).toBe(0.88);
      expect(result.results?.detectionRate).toBeGreaterThanOrEqual(0.85);
    });

    test('should extract false positive rate from proof.fl', async () => {
      const result = await bridge.run(testAgentId);

      expect(result.results?.falsePositive).toBe(0.03);
      expect(result.results?.falsePositive).toBeLessThanOrEqual(0.05);
    });

    test('should extract execution time from proof.fl', async () => {
      const result = await bridge.run(testAgentId);

      expect(result.results?.executionTime).toBe(234);
      expect(result.results?.executionTime).toBeLessThanOrEqual(5000);
    });

    test('should create _PROOF.md file after successful run', async () => {
      const proofPath = path.join(process.env.FREELANG_HOME || '.', 'proofs', `${testAgentId}_PROOF.md`);

      // Remove proof file if exists
      if (fs.existsSync(proofPath)) {
        fs.unlinkSync(proofPath);
      }

      await bridge.run(testAgentId);

      expect(fs.existsSync(proofPath)).toBe(true);

      const proofContent = fs.readFileSync(proofPath, 'utf-8');
      expect(proofContent).toContain('배포 준비 완료');
      expect(proofContent).toContain('✅');
    });

    test('should fail on missing agent directory', async () => {
      const result = await bridge.run('non-existent-agent');

      expect(result.status).toBe('failure');
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('invalid_structure');
    });
  });

  describe('validation', () => {
    test('should validate correct agent structure', () => {
      const validation = bridge.validate(testAgentId);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject agent with invalid structure', () => {
      const invalidId = 'invalid-agent-xyz';
      const validation = bridge.validate(invalidId);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('batch execution', () => {
    test('should run batch of agents', async () => {
      const results = await bridge.runBatch([testAgentId]);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('success');
    });
  });
});
