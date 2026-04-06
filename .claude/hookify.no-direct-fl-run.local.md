---
name: no-direct-fl-run
enabled: true
event: bash
pattern: (freelang|fl-run|ts-node.*\.fl|node.*\.fl)
action: warn
---

## ⚠️ FreeLang 직접 실행 주의

FreeLang .fl 파일을 직접 실행하려고 했습니다.

### 🚨 문제점

현재 환경에서 `.fl` 파일은:
- TypeScript 환경에서 직접 실행 불가
- mock 기반 테스트 환경에서만 실행 가능
- FreeLang 런타임이 설치되지 않음

직접 실행하면:
1. 테스트와 다른 결과 도출
2. 성공기준 검증 불가
3. OUTPUT_PROOF.md 생성 불가
4. 배포 파이프라인 우회

### ✅ 올바른 실행 방법

#### 방법 1: npm test (권장)
```bash
# 전체 테스트
npm test

# 특정 에이전트만
npm test -- --testPathPattern=code-analyzer

# 브리지를 통한 .fl 실행
npm test -- --testPathPattern=bridge
```

#### 방법 2: TypeScript 브리지 (고급)
```bash
npm run bridge -- --agent code-analyzer --input '{"code":"..."}'
```

브리지는 다음을 보장합니다:
- 정적 분석을 통한 안전한 실행
- 4가지 성공기준 자동 검증
- OUTPUT_PROOF.md 자동 생성

### 📖 더 알아보기

- 브리지 사용 가이드: `docs/BRIDGE.md`
- 테스트 작성: `tests/` 디렉토리 참고
- 성공기준: 각 `proof.fl` 파일 참고

### 💡 팁

에이전트 개발 중:
1. .fl 파일 작성 (parser → analyzer → proof)
2. npm test 로 TypeScript mock 테스트
3. /run-agent 로 브리지 시뮬레이션
4. /commit-validated 로 전체 검증 후 커밋
