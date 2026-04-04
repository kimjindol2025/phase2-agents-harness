# Code-Analyzer 에이전트

## 기본 정보
- **ID**: code-analyzer-dev-001
- **분류**: Dev (개발)
- **우선순위**: HIGH
- **상태**: 정의 완료 (2026-04-04)

## 역할
코드를 분석하여 구조, 품질, 복잡도를 평가하고 개선 제안을 제시합니다.

## 입력
```json
{
  "code": "...",
  "language": "python|javascript|go",
  "depth": "shallow|medium|deep",
  "focus": "quality|performance|security|all"
}
```

## 출력
```json
{
  "analysis_id": "code-001",
  "language": "python",
  "lines_of_code": 450,
  "complexity": {
    "cyclomatic": 8,
    "cognitive": 12,
    "nesting_depth": 4
  },
  "issues": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 12
  },
  "recommendations": [...]
}
```

## 성공 기준
1. 복잡도 정확도 >= 90%
2. 이슈 탐지율 >= 85%
3. 거짓 양성 < 10%
4. 분석 시간 < 5초

## 의존성
- Language-Detector (선행)
- Refactor-Suggester (후행)
