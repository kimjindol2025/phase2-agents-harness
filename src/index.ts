// ============================================================================
// Index - AI 에이전트 하네스 진입점
// ============================================================================

export { default as ValidationHarness } from './standards/validation-harness';
export { default as ErrorHandlingHarness } from './standards/error-handling-harness';
export * from './types';

/**
 * 에이전트 하네스 초기화
 */
export function initializeHarness(config: Record<string, unknown>): void {
  console.log('Initializing AI Agent Harness...');
  console.log(`Configuration: ${JSON.stringify(config, null, 2)}`);
}

/**
 * 에이전트 하네스 버전
 */
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
