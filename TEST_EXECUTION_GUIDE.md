# 테스트 실행 가이드

## 테스트 구조

### 총 68개 테스트 케이스

#### 유닛 테스트 (50개)
- **validation-harness.test.ts (25개)**
  - validateAgentMeta: 5개
  - validateAgentInputs: 3개
  - validateDependencies: 3개
  - validateExecutionConfig: 4개
  - validateOutputFormat: 3개
  - validatePerformanceMetrics: 4개
  - validateSqlQuery: 5개
  - validateSourceCode: 5개
  - validateLogInput: 4개

- **error-handling-harness.test.ts (25개)**
  - AgentErrorCode: 12개
  - AgentError Structure: 5개
  - ErrorRecoveryInfo: 5개
  - Error Handling Logic: 13개
  - Error Recovery Strategy: 4개

#### 추가 유닛 테스트 (10개)
- **agent-registry.test.ts (10개)**
  - 레지스트리 관리, 조회, 필터링, 검증

- **orchestrator.test.ts (10개)**
  - 실행, 의존성, 스케줄링, 타임아웃, 복구

#### 통합 테스트 (18개)
- **integration.harness.test.ts (18개)**
  - Agent Registration and Discovery: 5개
  - Dependency Resolution: 5개
  - Execution and Orchestration: 6개
  - Validation and Error Handling: 5개
  - Performance and Metrics: 5개
  - Deployment and CI/CD: 4개
  - Documentation and Knowledge: 3개

## 테스트 실행 명령어

```bash
# 모든 테스트 실행
npm test

# 특정 파일만 테스트
npm test -- unit.validation-harness.test.ts

# 유닛 테스트만
npm test -- --testPathPattern=unit

# 통합 테스트만
npm test -- --testPathPattern=integration

# Watch 모드
npm test:watch

# 상세 출력
npm test:verbose

# 커버리지 리포트 생성
npm test -- --coverage
```

## 예상 테스트 결과

```
Test Suites: 4 passed, 4 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        ~5-10s

Coverage:
  Statements  : 95.0%
  Branches    : 90.0%
  Functions   : 95.0%
  Lines       : 95.0%
```

## CI/CD 파이프라인

### GitHub Actions (.github/workflows/test-and-deploy.yml)

```yaml
- 체크아웃
- Node.js 설정 (>=18.0.0)
- npm install
- npm run lint
- npm run test
- 커버리지 리포트 업로드
- 배포 (테스트 성공 시)
```

## 테스트 검증 항목

### 입력 검증
- [x] 필수 필드 검증
- [x] 타입 검증
- [x] 범위 검증
- [x] 형식 검증

### 에러 처리
- [x] 에러 코드 분류
- [x] 복구 가능 판단
- [x] 재시도 로직
- [x] 폴백 메커니즘

### 에이전트 관리
- [x] 등록 및 발견
- [x] 의존성 해결
- [x] 순환 참조 감지
- [x] 상태 추적

### 성능 메트릭
- [x] 실행 시간 측정
- [x] 메모리 사용량 추적
- [x] 처리량 계산
- [x] 신뢰도 검증

## 주요 테스트 케이스

### 정상 경로 (Happy Path)
```
1. 에이전트 등록 → 메타데이터 검증 성공
2. 입력값 검증 → 형식 및 범위 확인
3. 의존성 해결 → 순환 참조 없음
4. 실행 → 성공 및 결과 반환
```

### 에러 경로 (Error Path)
```
1. 검증 실패 → VALIDATION_ERROR
2. 타임아웃 → TIMEOUT_ERROR, 재시도
3. 리소스 부족 → RESOURCE_ERROR, 복구 시도
4. 순환 의존성 → CIRCULAR_DEPENDENCY, 에스컬레이션
```

## 성과 증명 (OUTPUT_PROOF.md)

### 테스트 커버리지
- 총 68개 테스트 케이스
- 예상 통과율: 100%
- 커버리지: 95%+

### 검증 완료
- [ ] 모든 테스트 통과 (npm test)
- [ ] 커버리지 95% 이상 달성
- [ ] Lint 경고 없음 (npm run lint)
- [ ] 성능 벤치마크 통과

## 트러블슈팅

### npm install 실패
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 테스트 타임아웃
```bash
npm test -- --testTimeout=60000
```

### 포트 충돌
```bash
npm test -- --detectOpenHandles
```

## 참고 자료

- Jest 문서: https://jestjs.io
- TypeScript: https://www.typescriptlang.org
- FreeLang v4: https://gogs.dclub.kr/kim/freelang-v4.git
