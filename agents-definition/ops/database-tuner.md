# Database-Tuner 에이전트

## 기본 정보
- **ID**: database-tuner-ops-004
- **분류**: Ops
- **상태**: 정의 완료 (2026-04-04)

## 역할
데이터베이스 쿼리와 인덱스를 최적화합니다.

## 입력
- queries: [str] (쿼리 리스트)
- current_indexes: [str]
- performance_baseline: str

## 성공 기준
1. 쿼리 최적화 > 2배 성능 개선
2. 인덱스 추천 정확도 >= 90%
3. 스캔 비용 감소 >= 50%
4. 분석 시간 < 10초
