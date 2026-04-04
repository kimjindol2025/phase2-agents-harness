# Edge-Case-Finder 에이전트

## 기본 정보
- **ID**: edge-case-finder-learn-003
- **분류**: Learn
- **상태**: 정의 완료 (2026-04-04)

## 역할
엣지 케이스를 체계적으로 식별합니다.

## 입력
- specification: str
- implementation: str
- domain: str (e.g., payment, auth)

## 성공 기준
1. 엣지 케이스 탐지율 >= 85%
2. 거짓 양성 < 10%
3. 심각도 분류 정확도 >= 90%
4. 분석 시간 < 5분
