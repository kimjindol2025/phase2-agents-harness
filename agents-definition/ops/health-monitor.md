# Health-Monitor 에이전트

## 기본 정보
- **ID**: health-monitor-ops-001
- **분류**: Ops (운영)
- **우선순위**: CRITICAL
- **상태**: 정의 완료 (2026-04-04)

## 역할
시스템 상태를 실시간으로 모니터링하고 문제를 조기 감지합니다.

## 입력
```json
{
  "services": ["api", "database", "cache"],
  "metrics": {
    "cpu": 45,
    "memory": 72,
    "requests_per_sec": 1200
  },
  "thresholds": {
    "cpu_warning": 80,
    "memory_warning": 85,
    "latency_ms": 500
  }
}
```

## 성공 기준
1. 문제 감지율 >= 95%
2. 거짓 경보 < 5%
3. 감지 지연 < 10초
4. 가용성 >= 99.9%
