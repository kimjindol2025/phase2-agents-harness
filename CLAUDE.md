# Phase 2: AI 에이전트 하네스 엔지니어링

## 프로젝트 개요
- **목표**: AI 한계점을 구조로 보완하는 5개 에이전트 설계 및 구현
- **기간**: 2026-04-02 ~ 2026-05-31
- **핵심 원칙**: "AI가 못 하는 것을 구조로 보완하고, 그 과정의 모든 기록을 증명으로 남긴다"

## 프로젝트 구조

```
phase2-agents-harness/
├── agents-definition/          # 에이전트 역할 정의 (50~100개)
│   ├── dev/                    # 개발 에이전트 (20개)
│   ├── ops/                    # 운영 에이전트 (20개)
│   ├── deploy/                 # 배포 에이전트 (15개)
│   └── learn/                  # 학습 에이전트 (15~25개)
├── agents-impl/                # 에이전트 구현
│   ├── sql-optimizer/          # Phase 1: DB 쿼리 최적화
│   ├── security-scanner/       # Phase 1: 보안 감사
│   └── document-generator/     # Phase 1: 자동 문서화
├── harness/                    # 하네스 엔진 (FreeLang v4)
│   ├── prompt-chain.free       # 프롬프트 체인 엔진
│   ├── workflow.free           # 워크플로우 엔진
│   └── orchestrator.free       # 에이전트 오케스트레이터
├── tests/                      # 에이전트 테스트
├── proofs/                     # 성과 증명 (OUTPUT_PROOF.md)
├── DECISION_LOG.md             # 결정 기록
└── AI_LIMITS.md                # AI 한계점 분석
```

## Phase 진행도

### Phase 1: 인프라 확립 (2026-03-30 완료)
- ✅ FreeLang v4 완성
- ✅ gogs-server-fl 완성
- ✅ Gogs 자산화 시작

### Phase 2: 하네스 엔지니어링 (2026-04-02 시작)
- ⏳ AI 한계점 분석
- ⏳ 에이전트 50~100개 역할 정의
- ⏳ 첫 3개 에이전트 구현 & 배포

### Phase 3: 지능형 자산 관리 (2026-05-01 예정)
- ⏳ Claude Code 통합
- ⏳ CI/CD 배포 자동화
- ⏳ 포트폴리오 자산화

## 저장소 정보
- **로컬**: `/data/data/com.termux/files/home/phase2-agents-harness`
- **Gogs** (예정): https://gogs.dclub.kr/kim/phase2-agents-harness.git
- **인증**: GOGS_TOKEN 환경변수 사용

## 주의사항
- 모든 에이전트 스펙은 `AGENT_SPEC.md` 포맷으로 작성
- 각 에이전트의 성과는 `OUTPUT_PROOF.md`에 기록
- AI 한계점은 즉시 `AI_LIMITS.md`에 추가
- Commit message: "feat: [AGENT-이름] 설명" 형식 사용
