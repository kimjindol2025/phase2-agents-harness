# Refactor-Suggester 에이전트

## 기본 정보
- **ID**: refactor-suggester-dev-002
- **분류**: Dev
- **상태**: 정의 완료 (2026-04-04)

## 역할
복잡한 코드를 식별하고 구체적인 리팩토링 방안을 제시합니다.

## 입력
- code: str (분석할 코드)
- complexity_threshold: i32 (기준 복잡도)

## 성공 기준
1. 리팩토링 기회 탐지율 >= 90%
2. 제안된 코드 개선 >= 30%
3. 거짓 양성 < 5%
4. 제안 생성 시간 < 3초

## 의존성
- Code-Analyzer (선행)
