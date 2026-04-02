# DECISION_LOG.md - Phase 2 하네스 엔지니어링 기록

## 2026-04-02: Phase 2 공식 시작

### 결정 사항

#### 1. 에이전트 분류 (4개 그룹, 목표 50~100개)
```
개발 에이전트 (20개)
├─ SQL-Optimizer: gogs-server-fl DB 쿼리 최적화
├─ Security-Scanner: 전체 코드베이스 보안 감사
├─ Type-Checker: FreeLang 타입 추론 검증
├─ Performance-Profiler: 병목 지점 자동 감지
├─ Test-Generator: 테스트 코드 자동 생성
└─ ... (15개 추가)

배포 에이전트 (15개)
├─ CI/CD-Monitor: 빌드 상태 모니터링
├─ Rollback-Agent: 자동 롤백 판단
├─ Canary-Analyzer: 카나리 배포 성능 분석
└─ ... (12개 추가)

운영 에이전트 (20개)
├─ Log-Analyzer: 에러 자동 분류
├─ Capacity-Planner: 용량 예측
├─ Backup-Validator: 백업 무결성 검사
└─ ... (17개 추가)

학습 에이전트 (15~25개)
├─ Document-Generator: 자동 문서화
├─ Portfolio-Builder: 성능 메트릭 수집
├─ Decision-Recorder: 결정 기록 자동화
└─ ... (12~22개 추가)
```

#### 2. 초기 배포 우선순위 (3개 에이전트)
- 📌 **SQL-Optimizer** (gogs-server-fl 쿼리 최적화)
- 🔒 **Security-Scanner** (코드 보안 감사)
- 📝 **Document-Generator** (자동 문서화)

**이유**: 즉시 가시적 성과(Req/sec 향상, 보안 리포트, 문서)를 낼 수 있음

#### 3. 하네스 엔진 (FreeLang v4로 구현)
- **Prompt Chain Engine**: 다단계 프롬프트 자동 실행
- **Workflow Engine**: 에이전트 간 작업 흐름 제어
- **Orchestrator**: 50~100개 에이전트 중앙 관리

#### 4. 기록 시스템
- `DECISION_LOG.md`: 모든 결정 및 근거 기록
- `AI_LIMITS.md`: AI 한계점과 해결 방안
- `proofs/OUTPUT_PROOF.md`: 각 에이전트 성과 증명 (벤치마크, 보안 감사 결과 등)

---

## 2026-04-02: AI 한계점 1차 분석

### 파악된 한계점 (AI_LIMITS.md에서 상세 기록)

| 한계점 | 영향 범위 | 해결 방안 |
|--------|---------|---------|
| 타입 추론 (제네릭+유니온) | FreeLang 컴파일러 | Type-Checker 에이전트 |
| DB 동시성 병목 (10K+ 푸시) | gogs-server-fl | SQL-Optimizer 에이전트 |
| 가격 산정 예측 불가 | BigWash | ML-Pipeline 에이전트 |
| 자동 롤백 판단 기준 모호 | 배포 자동화 | Rollback-Agent + 룰 엔진 |
| 보안 검증 자동화 부족 | 전체 코드베이스 | Security-Scanner 에이전트 |

---

## 다음 단계

- [ ] 2026-04-09: 50개 에이전트 역할 정의 완료 → `agents-definition/`
- [ ] 2026-04-16: SQL-Optimizer 구현 완료 → `agents-impl/sql-optimizer/`
- [ ] 2026-04-23: Security-Scanner 구현 완료
- [ ] 2026-04-30: Document-Generator 구현 완료
- [ ] 2026-05-07: 3개 에이전트 프로덕션 배포 + OUTPUT_PROOF.md 작성
