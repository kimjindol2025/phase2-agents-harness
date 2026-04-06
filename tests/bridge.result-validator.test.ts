/**
 * ResultValidator 테스트
 */

import { ResultValidator } from '../src/bridge/result-validator';
import { ExecutionContext, SuccessCriteria } from '../src/bridge/execution-context';

describe('ResultValidator', () => {
  let validator: ResultValidator;

  beforeAll(() => {
    const context = new ExecutionContext({
      agentId: 'test-validator',
      mode: 'mock'
    });
    validator = new ResultValidator(context);
  });

  describe('criteria validation', () => {
    test('should pass when all criteria are met', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.95, passed: true },
        detectionRate: { target: 0.85, actual: 0.88, passed: true },
        falsePositive: { target: 0.05, actual: 0.03, passed: true },
        executionTime: { target: 5000, actual: 234, passed: true }
      };

      const result = validator.validateCriteria(criteria);

      expect(result.passed).toBe(true);
      expect(result.details.accuracy).toBe(true);
      expect(result.details.detectionRate).toBe(true);
      expect(result.details.falsePositive).toBe(true);
      expect(result.details.executionTime).toBe(true);
      expect(result.failedChecks).toHaveLength(0);
    });

    test('should fail when accuracy is below target', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.85, passed: false },
        detectionRate: { target: 0.85, actual: 0.88, passed: true },
        falsePositive: { target: 0.05, actual: 0.03, passed: true },
        executionTime: { target: 5000, actual: 234, passed: true }
      };

      const result = validator.validateCriteria(criteria);

      expect(result.passed).toBe(false);
      expect(result.details.accuracy).toBe(false);
      expect(result.failedChecks[0]).toContain('accuracy');
    });

    test('should fail when detection rate is below target', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.95, passed: true },
        detectionRate: { target: 0.85, actual: 0.80, passed: false },
        falsePositive: { target: 0.05, actual: 0.03, passed: true },
        executionTime: { target: 5000, actual: 234, passed: true }
      };

      const result = validator.validateCriteria(criteria);

      expect(result.passed).toBe(false);
      expect(result.details.detectionRate).toBe(false);
    });

    test('should fail when false positive rate exceeds target', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.95, passed: true },
        detectionRate: { target: 0.85, actual: 0.88, passed: true },
        falsePositive: { target: 0.05, actual: 0.10, passed: false },
        executionTime: { target: 5000, actual: 234, passed: true }
      };

      const result = validator.validateCriteria(criteria);

      expect(result.passed).toBe(false);
      expect(result.details.falsePositive).toBe(false);
    });

    test('should fail when execution time exceeds target', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.95, passed: true },
        detectionRate: { target: 0.85, actual: 0.88, passed: true },
        falsePositive: { target: 0.05, actual: 0.03, passed: true },
        executionTime: { target: 5000, actual: 6000, passed: false }
      };

      const result = validator.validateCriteria(criteria);

      expect(result.passed).toBe(false);
      expect(result.details.executionTime).toBe(false);
    });

    test('should report all failed checks', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.80, passed: false },
        detectionRate: { target: 0.85, actual: 0.75, passed: false },
        falsePositive: { target: 0.05, actual: 0.10, passed: false },
        executionTime: { target: 5000, actual: 6000, passed: false }
      };

      const result = validator.validateCriteria(criteria);

      expect(result.failedChecks).toHaveLength(4);
      expect(result.passed).toBe(false);
    });
  });

  describe('proof file generation', () => {
    test('should generate proof file with success status', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.95, passed: true },
        detectionRate: { target: 0.85, actual: 0.88, passed: true },
        falsePositive: { target: 0.05, actual: 0.03, passed: true },
        executionTime: { target: 5000, actual: 234, passed: true }
      };

      const validationResult = { passed: true, details: {
        accuracy: true,
        detectionRate: true,
        falsePositive: true,
        executionTime: true
      }};

      const proof = validator.generateProofFile('test-agent', criteria, validationResult);

      expect(proof).toContain('test-agent 증명 파일');
      expect(proof).toContain('배포 준비 완료');
      expect(proof).toContain('✅');
      expect(proof).toContain('95.00%'); // accuracy
      expect(proof).toContain('88.00%'); // detection rate
      expect(proof).toContain('3.00%'); // false positive
      expect(proof).toContain('234ms');  // execution time
    });

    test('should generate proof file with failure status', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.85, passed: false },
        detectionRate: { target: 0.85, actual: 0.88, passed: true },
        falsePositive: { target: 0.05, actual: 0.03, passed: true },
        executionTime: { target: 5000, actual: 234, passed: true }
      };

      const validationResult = { passed: false, details: {
        accuracy: false,
        detectionRate: true,
        falsePositive: true,
        executionTime: true
      }};

      const proof = validator.generateProofFile('test-agent', criteria, validationResult);

      expect(proof).toContain('검증 필요');
      expect(proof).toContain('개선 필요');
      expect(proof).toContain('❌');
    });

    test('should include criteria table in proof file', () => {
      const criteria: SuccessCriteria = {
        accuracy: { target: 0.90, actual: 0.95, passed: true },
        detectionRate: { target: 0.85, actual: 0.88, passed: true },
        falsePositive: { target: 0.05, actual: 0.03, passed: true },
        executionTime: { target: 5000, actual: 234, passed: true }
      };

      const validationResult = { passed: true, details: {
        accuracy: true,
        detectionRate: true,
        falsePositive: true,
        executionTime: true
      }};

      const proof = validator.generateProofFile('test-agent', criteria, validationResult);

      expect(proof).toContain('| 기준 | 목표 | 실측 | 상태 |');
      expect(proof).toContain('| 정확도 |');
      expect(proof).toContain('| 발견율 |');
      expect(proof).toContain('| 거짓양성률 |');
      expect(proof).toContain('| 실행시간 |');
    });
  });
});
