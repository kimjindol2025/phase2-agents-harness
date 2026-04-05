# AI 에이전트 하네스 표준 - 빠른 참고 가이드

**업데이트**: 2026-04-04
**상태**: 즉시 적용 가능

---

## 🚀 빠른 시작 (5분)

### 1단계: 파일 확인
```bash
ls -la standards/
```

### 2단계: 모듈 임포트
```freelang
import validation_harness
import error_handling_harness
```

### 3단계: 입력 검증 추가
```freelang
var result = validation_harness::validateAgentInputs(input, 10000)
if !result.valid {
    return error(result.error_code, result.message)
}
```

### 4단계: 에러 처리 추가
```freelang
try {
    return run_agent(agent_id, input)
} catch error {
    var agent_error = error_handling_harness::createAgentError(...)
    return Result::Err(agent_error)
}
```

---

## 📚 표준 모듈 (Standard Modules)

### validation-harness.fl (398줄)
**입력값 검증 자동화**

| 함수 | 용도 | 반환값 |
|-----|------|--------|
| validateAgentMeta | 에이전트 메타데이터 검증 | ValidationResult |
| validateAgentInputs | 입력 길이/범위 검증 | ValidationResult |
| validateDependencies | 순환 참조 감지 | ValidationResult |
| validateExecutionConfig | 실행 설정 검증 | ValidationResult |
| validateOutputFormat | 출력 형식 검증 | ValidationResult |
| validateSqlQuery | SQL 쿼리 검증 | ValidationResult |
| validateSourceCode | 소스 코드 검증 | ValidationResult |
| validateLogInput | 로그 입력 검증 | ValidationResult |
| validatePerformanceMetrics | 성능 지표 검증 | ValidationResult |

**사용 예시**:
```freelang
import validation_harness

fn execute(input: str) -> Result {
    // 입력 검증
    var result = validation_harness::validateAgentInputs(input, 10000)
    if !result.valid {
        return Result::Err(result.message)
    }

    // SQL 쿼리면 추가 검증
    var sql_result = validation_harness::validateSqlQuery(input, 50000)
    if !sql_result.valid {
        return Result::Err(sql_result.message)
    }

    // 처리
    return run_agent(input)
}
```

---

### error-handling-harness.fl (482줄)
**자동 에러 복구 전략**

| 에러 | 재시도 | 지연 | 폴백 |
|-----|-------|------|------|
| VALIDATION_ERROR | ❌ | - | - |
| TIMEOUT_ERROR | ✅ | 5s | - |
| DEPENDENCY_ERROR | ✅ | 3s | fallback |
| NETWORK_ERROR | ✅ | 10s | - |
| CIRCULAR_DEPENDENCY | ❌ | - | - |

**사용 예시**:
```freelang
import error_handling_harness

fn execute_with_recovery(agent_id: str, input: str) -> Result {
    try {
        return execute_agent(agent_id, input)
    } catch error {
        var agent_error = error_handling_harness::createAgentError(
            AgentErrorCode::EXECUTION_ERROR,
            error.message,
            agent_id
        )

        var recovery = error_handling_harness::getErrorRecoveryInfo(agent_error)
        if recovery.can_retry {
            sleep(recovery.retry_delay_ms)
            return execute_with_recovery(agent_id, input)
        }

        return Result::Err(agent_error)
    }
}
```

---

## 📖 가이드 문서 (Guide Documents)

### INTEGRATION_GUIDE.md (856줄)
**완전한 통합 가이드 및 사용 방법**

- ✅ 입력 검증 표준 자세한 설명
- ✅ 에러 처리 표준 자세한 설명
- ✅ 테스트 자동화 구조
- ✅ 성능 모니터링 구성
- ✅ 4주 로드맵

**누가 읽어야**: 팀 리더, 아키텍트

### TEST_PLAN.md (512줄)
**테스트 자동화 전략 및 계획**

- ✅ 50개 단위 테스트 계획
- ✅ 18개 통합 테스트 계획
- ✅ 8개 성능 테스트 계획
- ✅ CI/CD 자동화
- ✅ 커버리지 목표 (85%+)

**누가 읽어야**: QA, 개발자

### PERFORMANCE_MONITORING.md (678줄)
**성능 모니터링 및 자동 문서화**

- ✅ 메트릭 수집 전략
- ✅ 성능 임계값 정의
- ✅ OpenAPI 스펙 자동 생성
- ✅ 마크다운 문서 자동 생성
- ✅ 성능 대시보드

**누가 읽어야**: DevOps, 개발자

### IMPLEMENTATION_CHECKLIST.md (486줄)
**31일 단계별 구현 체크리스트**

- ✅ 주별 목표 및 확인사항
- ✅ 각 에이전트별 적용 방법
- ✅ 일일 검증 항목
- ✅ 신호등 상태 추적
- ✅ 리스크 관리

**누가 읽어야**: 프로젝트 관리자, 팀 리더

---

## 🎯 역할별 가이드

### 개발자 (Developer)
**시간 투자**: 30분/에이전트

1. validation-harness.fl 읽기 (10분)
2. error-handling-harness.fl 읽기 (10분)
3. 현재 에이전트에 적용 (10분)

**주요 함수**:
- validateAgentInputs
- validateDependencies
- createAgentError
- getErrorRecoveryInfo

### 팀 리더 (Team Lead)
**시간 투자**: 5주 (Phase B)

1. INTEGRATION_GUIDE.md 정독 (1시간)
2. IMPLEMENTATION_CHECKLIST.md 검토 (1시간)
3. 팀 배정 및 일정 관리 (주당 2시간)

**주요 책임**:
- 5개 에이전트 순차 적용
- 진행 상황 추적
- 문제 해결

### DevOps
**시간 투자**: 2주

1. PERFORMANCE_MONITORING.md 정독 (2시간)
2. GitHub Actions 워크플로우 생성 (4시간)
3. 성능 대시보드 배포 (4시간)
4. 문서 자동 생성 설정 (2시간)

**주요 책임**:
- CI/CD 자동화
- 성능 모니터링
- 문서 자동 생성

### QA (Quality Assurance)
**시간 투자**: 3주

1. TEST_PLAN.md 정독 (1시간)
2. 테스트 케이스 작성 (주당 5시간)
3. CI/CD 테스트 실행 (주당 2시간)

**주요 책임**:
- 50개+ 단위 테스트 작성
- 18개 통합 테스트 작성
- 커버리지 85%+ 검증

---

## 📊 성공 지표 (KPIs)

### 입력 검증
- ✅ 적용률: 100% (54개 에이전트)
- ✅ 보안 취약점 감소: 80%
- ✅ 입력 오류 조기 감지: 100%

### 에러 처리
- ✅ 복구율: 95%+
- ✅ 런타임 에러 감소: 60%
- ✅ 에러 로깅: 100% 자동화

### 테스트 자동화
- ✅ 단위 테스트: 50개+
- ✅ 통합 테스트: 18개
- ✅ 성능 테스트: 8개+
- ✅ 커버리지: 85%+
- ✅ 성공률: 99%+

### 성능 모니터링
- ✅ 실행 시간: 임계값 내
- ✅ 메모리 사용: 임계값 내
- ✅ 문서화: 100% 자동 생성

---

## ⚡ 일반적인 문제 및 해결

### Q: validation_harness를 임포트하면 컴파일 오류가 나요
**A**: `standards/validation-harness.fl` 파일이 같은 디렉토리에 있는지 확인하세요. 경로를 명시해야 할 수도 있습니다.

### Q: 에러 복구가 작동하지 않아요
**A**: `error_handling_harness::getErrorRecoveryInfo()`로 복구 정보를 조회하고 `recovery.can_retry`를 확인하세요.

### Q: 순환 의존성을 어떻게 감지하나요
**A**: `validateDependencies()` 함수가 자동으로 감지합니다. 의존성 등록 시 항상 호출하세요.

### Q: 테스트는 언제 시작하나요
**A**: Phase B부터 TDD 방식으로 테스트를 먼저 작성한 후 코드를 구현합니다.

### Q: 기존 에이전트를 수정해야 하나요
**A**: 최소한의 수정만 필요합니다. 오케스트레이터가 표준을 자동 적용합니다.

---

## 📞 지원 및 문의

### 문제 해결
1. INTEGRATION_GUIDE.md에서 솔루션 찾기
2. IMPLEMENTATION_CHECKLIST.md에서 단계 확인
3. 팀 리더나 DevOps에 문의

### 연락처
- **기술 지원**: Code Review Team
- **아키텍처**: Architecture Team
- **배포**: DevOps Team

---

## 🔗 문서 네비게이션

```
standards/
├── README.md (현재 파일)
│   └─ 빠른 참고 가이드
│
├── validation-harness.fl
│   └─ 입력 검증 모듈 (398줄)
│
├── error-handling-harness.fl
│   └─ 에러 처리 모듈 (482줄)
│
├── INTEGRATION_GUIDE.md
│   └─ 완전 통합 가이드 (856줄)
│
├── TEST_PLAN.md
│   └─ 테스트 계획 (512줄)
│
└── PERFORMANCE_MONITORING.md
    └─ 성능 모니터링 (678줄)

상위 디렉토리:
├── 22_AI_HARNESS_STANDARDS_APPLIED.md
│   └─ 상세 설명 (850줄)
│
├── DEPLOYMENT_SUMMARY.md
│   └─ 배포 정보 (550줄)
│
└── FINAL_DELIVERY_REPORT.md
    └─ 최종 납품 보고서 (600줄+)
```

---

## 💡 팁 & 트릭

### Tip 1: validateDependencies 빠르게 사용
```freelang
// 에이전트 등록 시 항상 의존성 검증
fn register_agent(meta: AgentMeta) -> Result {
    var deps_check = validation_harness::validateDependencies(
        meta.id, meta.dependencies, get_all_agent_ids()
    )
    if !deps_check.valid {
        return Result::Err(deps_check.message)
    }
    return register(meta)
}
```

### Tip 2: 복구 정보로 자동 재시도
```freelang
// 에러 복구 자동화
var recovery = error_handling_harness::getErrorRecoveryInfo(error)
if recovery.can_retry {
    sleep(recovery.retry_delay_ms)
    return retry(...)
} else if recovery.fallback_agent != "" {
    return switch_to_fallback(recovery.fallback_agent)
}
```

### Tip 3: 메트릭 수집 자동화
```freelang
// 모든 실행에 메트릭 수집
var start = get_current_time_ms()
var result = execute(...)
var duration = get_current_time_ms() - start
store_metrics(agent_id, duration, ...)
```

---

## ✅ 체크리스트

### 이 파일을 읽은 후
- [ ] 5분 빠른 시작 완료
- [ ] 자신의 역할 확인
- [ ] 다음 문서 결정

### 구현 시작 전
- [ ] 모든 표준 모듈 임포트 확인
- [ ] IMPLEMENTATION_CHECKLIST.md 검토
- [ ] 팀에서 일정 확인

### 구현 중
- [ ] INTEGRATION_GUIDE.md 참고
- [ ] TEST_PLAN.md로 테스트 작성
- [ ] 진행 상황 일일 추적

---

**최종 업데이트**: 2026-04-04
**버전**: 1.0
**상태**: ✅ 즉시 적용 가능

🟢 **준비 완료. 지금 시작하세요!**
