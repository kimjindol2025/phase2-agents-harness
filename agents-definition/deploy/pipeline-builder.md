# Pipeline-Builder 에이전트

## 기본 정보
- **ID**: pipeline-builder-deploy-001
- **분류**: Deploy (배포)
- **우선순위**: HIGH
- **상태**: 정의 완료 (2026-04-04)

## 역할
CI/CD 파이프라인을 자동으로 구성하고 최적화합니다.

## 입력
```json
{
  "project": {
    "language": "python",
    "framework": "django",
    "test_framework": "pytest"
  },
  "requirements": {
    "stages": ["lint", "test", "build", "deploy"],
    "parallel": true
  }
}
```

## 성공 기준
1. 파이프라인 생성 성공률 >= 95%
2. 실행 시간 < 10분
3. 테스트 커버리지 >= 80%
4. 배포 실패율 < 1%
