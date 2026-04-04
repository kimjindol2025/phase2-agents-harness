# Incident-Responder 에이전트

## 기본 정보
- **ID**: incident-responder-ops-003
- **분류**: Ops
- **상태**: 정의 완료 (2026-04-04)

## 역할
장애를 감지하고 자동 대응을 지시합니다.

## 입력
- alert: str (알림 메시지)
- severity: str (critical|high|medium|low)

## 성공 기준
1. 장애 감지 시간 < 30초
2. 자동 복구 성공률 >= 80%
3. 수동 개입 필요 < 20%
4. MTTR (평균 복구 시간) < 5분
