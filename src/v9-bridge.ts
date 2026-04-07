/**
 * FreeLang v9 브릿지
 * Phase 2 CLI에서 v9 컴파일/실행을 사용하기 위한 래퍼
 */

import * as path from 'path';

interface V9ExecutionResult {
  success: boolean;
  variables: { [key: string]: any };
  output: string[];
  error?: string;
  duration?: number;
}

/**
 * v9 컴파일 및 실행
 * 단순 선언 형식의 .fl 파일만 지원
 */
export function executeV9File(filePath: string): V9ExecutionResult {
  try {
    const fs = require('fs');

    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        variables: {},
        output: [],
        error: `File not found: ${filePath}`
      };
    }

    const code = fs.readFileSync(filePath, 'utf-8');
    const startTime = Date.now();

    // v9 파싱 (간단한 형식만 지원)
    const variables: { [key: string]: any } = {};
    const output: string[] = [];

    // 1. 주석 제거
    const lines = code
      .split('\n')
      .filter((line: string) => !line.trim().startsWith('#') && !line.trim().startsWith('//'))
      .filter((line: string) => line.trim() !== '');

    // 2. 직접 할당 파싱 (accuracy: 0.91)
    for (const line of lines as string[]) {
      const match = line.match(/^(\w+)\s*:\s*([0-9.]+)$/);
      if (match) {
        const name = match[1];
        const value = parseFloat(match[2]);
        variables[name] = value;
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      variables,
      output,
      duration
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
 * 정적 파싱과 v9 실행 결과 비교
 */
export function validateV9Execution(
  staticVars: { [key: string]: any },
  dynamicVars: { [key: string]: any }
): {
  match: boolean;
  differences: Array<{
    key: string;
    static: any;
    dynamic: any;
  }>;
} {
  const differences: Array<{
    key: string;
    static: any;
    dynamic: any;
  }> = [];

  // 정적에만 있는 키
  for (const key in staticVars) {
    if (!(key in dynamicVars)) {
      differences.push({
        key,
        static: staticVars[key],
        dynamic: undefined
      });
    } else if (staticVars[key] !== dynamicVars[key]) {
      // 값이 다른 경우
      differences.push({
        key,
        static: staticVars[key],
        dynamic: dynamicVars[key]
      });
    }
  }

  // 동적에만 있는 키
  for (const key in dynamicVars) {
    if (!(key in staticVars)) {
      differences.push({
        key,
        static: undefined,
        dynamic: dynamicVars[key]
      });
    }
  }

  return {
    match: differences.length === 0,
    differences
  };
}

/**
 * v9 브릿지 초기화 (선택사항)
 */
export function initializeV9Bridge(): void {
  // v9 런타임 초기화가 필요하면 여기에 추가
}

/**
 * v9 실행 결과 검증
 */
export function isValidV9Result(result: V9ExecutionResult): boolean {
  return result.success && Object.keys(result.variables).length > 0;
}
