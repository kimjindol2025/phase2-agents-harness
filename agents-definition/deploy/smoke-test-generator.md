# Smoke-Test-Generator 에이전트

## 기본 정보
- **ID**: smoke-test-generator-deploy-003
- **분류**: Deploy
- **상태**: 정의 완료 (2026-04-04)

## 역할
핵심 기능 스모크 테스트를 자동으로 생성합니다.

## 입력
- api_spec: str (API 명세)
- critical_paths: [str]

## 성공 기준
1. 테스트 커버리지 >= 85%
2. 생성 성공률 >= 90%
3. 테스트 실행 시간 < 60초
4. 거짓 양성 < 10%
