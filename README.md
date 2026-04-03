# Phase 2: AI 에이전트 하네스 엔지니어링

> "AI가 못 하는 것을 구조로 보완하고, 그 과정의 모든 기록을 증명으로 남긴다."

## 프로젝트 개요

**목표**: AI 한계점을 프롬프트 체인, 워크플로우, 룰 엔진으로 자동 보완하는 **5개 고품질 에이전트** 설계 및 구현

**기간**: 2026-04-02 ~ 2026-05-31

**핵심 성과**:
- 5개 에이전트 상세 역할 정의 (AGENT_SPEC.md)
- 모든 에이전트 프로덕션 배포 (2026-05-14 완료)
- 성능 벤치마크 + 보안 감사 + 자동 문서화 + 에러 분석 + 성능 최적화로 즉시 가시적 성과 입증

---

## 프로젝트 구조

```
phase2-agents-harness/
├── README.md                   # 이 파일
├── CLAUDE.md                   # 프로젝트 지침
├── DECISION_LOG.md             # 결정 기록 & 진행 상황
├── AI_LIMITS.md                # AI 한계점 분석 & 보완 전략
│
├── agents-definition/          # 에이전트 역할 정의 (50~100개)
│   ├── dev/                    # 개발 에이전트 (SQL-Optimizer, Security-Scanner, ...)
│   ├── ops/                    # 운영 에이전트 (Log-Analyzer, Backup-Validator, ...)
│   ├── deploy/                 # 배포 에이전트 (CI/CD-Monitor, Rollback-Agent, ...)
│   └── learn/                  # 학습 에이전트 (Document-Generator, Portfolio-Builder, ...)
│
├── agents-impl/                # 에이전트 구현 (Phase 1: 3개 우선)
│   ├── sql-optimizer/          # DB 쿼리 최적화 (2026-04-16)
│   ├── security-scanner/       # 보안 감사 (2026-04-23)
│   └── document-generator/     # 자동 문서화 (2026-04-30)
│
├── harness/                    # 하네스 엔진 (FreeLang v4 구현)
│   ├── prompt-chain.free       # 다단계 프롬프트 체인
│   ├── workflow.free           # 에이전트 간 작업 흐름
│   └── orchestrator.free       # 중앙 오케스트레이터
│
├── tests/                      # 에이전트 테스트 & 검증
├── proofs/                     # 성과 증명 (벤치마크, 감사 리포트)
└── .gitignore
```

---

## 시작하기

### 1단계: 프로젝트 초기화
```bash
cd phase2-agents-harness
git config user.email "you@example.com"
git config user.name "Your Name"
git add .
git commit -m "init: Phase 2 프로젝트 초기화"
```

### 2단계: 에이전트 역할 정의 (1주일)
```bash
# agents-definition/ 하위 AGENT_SPEC.md 작성
# 목표: 50개 에이전트 정의 완료
```

### 3단계: 초기 3개 에이전트 구현 (4주)
- **Week 1-2**: SQL-Optimizer (2026-04-16)
- **Week 2-3**: Security-Scanner (2026-04-23)
- **Week 3-4**: Document-Generator (2026-04-30)

---

## 핵심 문서

### 📋 DECISION_LOG.md
모든 결정 사항과 근거를 기록합니다.
- 에이전트 우선순위 결정
- 기술 선택 (도구, 알고리즘)
- 성과 측정 지표

### 🔍 AI_LIMITS.md
AI가 현재 해결 못하는 지점을 명시적으로 기록합니다.
- 문제점 설명
- 근본 원인 분석
- 구조적 보완 방안
- 구현 기술 (프롬프트 체인, 외부 도구 연계)

### 📦 agents-definition/
각 에이전트의 역할 정의서입니다.
```
agents-definition/dev/SQL-OPTIMIZER.md
├── 입력 (Input)
├── 처리 로직
├── 출력 (Output)
├── 성공 기준
├── 한계점 & 보완 구조
└── 구현 단계
```

### 🚀 agents-impl/
실제 구현 코드입니다.
```
agents-impl/sql-optimizer/
├── query-analyzer.free         # 쿼리 분석 엔진
├── index-advisor.free          # 인덱스 추천 엔진
├── cache-layer.free            # 캐시 레이어
└── benchmark.free              # 성능 벤치마크
```

### 📊 proofs/OUTPUT_PROOF.md
각 에이전트의 성과 증명 (벤치마크, 감사 결과)을 기록합니다.

---

## 진행 상황

### Phase 1: 인프라 확립 ✅ (2026-03-30 완료)
- ✅ FreeLang v4 완성
- ✅ gogs-server-fl 완성
- ✅ Gogs 자산화

### Phase 2: 하네스 엔지니어링 ⏳ (2026-04-02 시작)
- [ ] 2026-04-09: 50개 에이전트 역할 정의
- [ ] 2026-04-16: SQL-Optimizer 구현 & 배포
- [ ] 2026-04-23: Security-Scanner 구현 & 배포
- [ ] 2026-04-30: Document-Generator 구현 & 배포
- [ ] 2026-05-07: 3개 에이전트 프로덕션 운영 + OUTPUT_PROOF.md

### Phase 3: 지능형 자산 관리 (2026-05-01 예정)
- [ ] Claude Code 통합
- [ ] 전체 에이전트 80% 배포
- [ ] CI/CD 배포 자동화

---

## 기여 가이드

### Commit 메시지 형식
```
feat: [AGENT-이름] 에이전트 역할 정의 추가
fix: [AGENT-SQL-Optimizer] 쿼리 분석 로직 수정
docs: AI 한계점 분석 추가
perf: 프롬프트 체인 성능 최적화
test: SQL-Optimizer 벤치마크 추가
```

### PR 템플릿
```markdown
## 변경사항
- [x] AGENT_SPEC 작성
- [x] 구현 코드 완성
- [x] 성능 벤치마크 실행

## 성과 증명
- OUTPUT_PROOF.md 작성
- 벤치마크 결과 포함
- 보안 감사 결과 포함
```

---

## 성과 지표

### 개발 메트릭
- 에이전트 개수: 목표 50~100개
- 배포 완료율: 목표 80% (2026-06-01)
- 성능 개선: 목표 10배 (Req/sec)

### 품질 메트릭
- 보안 취약점: 0개 (Critical), <5개 (High)
- 문서 커버리지: 95%+
- 테스트 커버리지: 90%+

---

## 참고 문서

- [Phase 2 AI 하네스 전략](../ai_harness_strategy.md)
- [프로젝트 CLAUDE.md](CLAUDE.md)
- [결정 로그](DECISION_LOG.md)
- [AI 한계점 분석](AI_LIMITS.md)

---

**시작일**: 2026-04-02
**목표 완료일**: 2026-06-01
**상태**: 🚀 진행 중
