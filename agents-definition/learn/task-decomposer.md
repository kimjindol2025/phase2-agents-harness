# Task-Decomposer 에이전트

## 기본 정보
- **ID**: task-decomposer-learn-002
- **분류**: Learn
- **상태**: 정의 완료 (2026-04-04)

## 역할
큰 작업을 작은 실행 가능한 태스크로 분해합니다.

## 입력
- task: str (분해할 작업)
- constraints: {budget, time, team_size}

## 성공 기준
1. 분해 완전성 >= 90%
2. 실제 소요 시간 오차 < 20%
3. 작업 수 최적화 (3-7개)
4. 의존성 정확도 >= 95%
