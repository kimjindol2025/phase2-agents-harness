# DECISION_LOG.md - Phase 2 하네스 엔지니어링 기록

## 2026-04-02: Phase 2 공식 시작 → 2026-04-02: 5개 에이전트로 스코프 축소

### 결정 변경 사항

#### 초안: 50~100개 에이전트 (2026-04-02 초)
- 목표가 과도하게 높음
- 실제 구현 불가능한 수준
- 품질 저하 가능성

#### 최종: 5개 에이전트 (2026-04-02 변경)
더 실현 가능하고 높은 품질의 에이전트 5개 집중:

**개발 에이전트 (3개)**
- 📌 **SQL-Optimizer**: gogs-server-fl DB 쿼리 최적화 (2026-04-16)
- 🔒 **Security-Scanner**: 전체 코드베이스 보안 감사 (2026-04-23)
- ⚡ **Performance-Profiler**: 성능 병목 자동 감지 (2026-05-14)

**운영 에이전트 (1개)**
- 📊 **Log-Analyzer**: 에러 로그 자동 분류 및 경향 분석 (2026-05-07)

**학습 에이전트 (1개)**
- 📝 **Document-Generator**: git 이력 → 자동 문서화 (2026-04-30)

**이유**: 높은 품질, 명확한 성과, 실제 운영 적용 가능

#### 3. 하네스 엔진 (FreeLang v4로 구현)
- **Prompt Chain Engine**: 다단계 프롬프트 자동 실행
- **Workflow Engine**: 에이전트 간 작업 흐름 제어
- **Orchestrator**: 5개 에이전트 중앙 관리

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

- [x] 2026-04-02: 5개 에이전트 역할 정의 완료
  - [x] SQL-Optimizer.md
  - [x] Security-Scanner.md
  - [x] Document-Generator.md
  - [x] Log-Analyzer.md
  - [x] Performance-Profiler.md
- [ ] 2026-04-16: SQL-Optimizer 구현 완료
- [ ] 2026-04-23: Security-Scanner 구현 완료
- [ ] 2026-04-30: Document-Generator 구현 완료
- [ ] 2026-05-07: Log-Analyzer 구현 + OUTPUT_PROOF.md 작성 (1,2,3,4)
- [ ] 2026-05-14: Performance-Profiler 구현 + 5개 에이전트 프로덕션 운영 시작
