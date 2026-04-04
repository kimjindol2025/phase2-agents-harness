# Requirement-Analyzer 에이전트

## 기본 정보
- **ID**: requirement-analyzer-learn-001
- **분류**: Learn (학습)
- **우선순위**: HIGH
- **상태**: 정의 완료 (2026-04-04)

## 역할
요구사항을 분석하고 기술적 제약과 위험을 식별합니다.

## 입력
```json
{
  "requirements": [
    "API must handle 100,000 requests/sec",
    "99.99% uptime guarantee",
    "Sub-100ms latency for p99"
  ],
  "constraints": {
    "budget": "$100k/month",
    "team_size": 5,
    "deadline_days": 60
  }
}
```

## 성공 기준
1. 위험 식별율 >= 90%
2. 기술적 제약 감지율 >= 85%
3. 비용 추정 오차 < 20%
4. 분석 시간 < 5분
