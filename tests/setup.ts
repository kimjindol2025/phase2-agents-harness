// ============================================================================
// Test Setup - Jest 테스트 환경 초기화
// ============================================================================

// 환경 변수 설정
process.env.NODE_ENV = 'test';

// 타임아웃 설정
jest.setTimeout(30000);

// 글로벌 모의 함수 설정
beforeEach(() => {
  // 각 테스트 전에 실행될 설정
  jest.clearAllMocks();
});

afterEach(() => {
  // 각 테스트 후에 실행될 정리
  jest.clearAllTimers();
});

// 테스트 리포터 설정
if (process.env.VERBOSE) {
  jest.spyOn(console, 'log').mockImplementation(() => {});
}
