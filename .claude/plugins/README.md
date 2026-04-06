# Phase 2 에이전트 하네스 - Claude Code 플러그인

**최종 통합**: 2026-04-06
**상태**: ✅ **Phase 1 완료** (5개 공식 + 1개 커스텀)
**예상 효과**: PR 리뷰 시간 20분 → 2분, 코드 결함 발견율 70% → 90%

---

## 📦 플러그인 구성 (6개)

### 공식 플러그인 (5개)

| # | 플러그인 | 명령어 | 기능 | 크기 |
|---|---------|--------|------|------|
| 1️⃣ | code-review | `/code-review [--comment]` | 4개 병렬 에이전트 PR 리뷰 | 31KB |
| 2️⃣ | commit-commands | `/commit`, `/commit-push-pr` | Git 워크플로우 자동화 | - |
| 3️⃣ | pr-review-toolkit | `/pr-review-toolkit:review-pr` | 6개 전문 리뷰 에이전트 | 78KB |
| 4️⃣ | feature-dev | `/feature-dev` | 7단계 기능 개발 자동화 | 50KB |
| 5️⃣ | security-guidance | Hook: PreToolUse | 9가지 보안 패턴 감시 | - |

### 커스텀 플러그인 (1개)

| # | 플러그인 | 명령어 | 기능 | 상태 |
|---|---------|--------|------|------|
| 6️⃣ | phase2-commit | `/commit-validated` | npm test 검증 기반 커밋 | ✅ 신규 |

---

## 🎯 Phase 1 적용 내역

### ✅ 완료 항목

```
✅ settings.json 생성
   - 5개 공식 플러그인 등록
   - 커스텀 플러그인 등록
   - 환경변수 설정 (GOGS_TOKEN, GITHUB_TOKEN)
   - 훅 설정 (onPush, onPullRequest, onMerge)

✅ 5개 공식 플러그인 복사
   - code-review (31KB)
   - commit-commands
   - pr-review-toolkit (78KB)
   - feature-dev (50KB)
   - security-guidance

✅ phase2-commit 커스텀 플러그인 생성
   - /commit-validated 명령어
   - npm test 검증
   - Test Suites 통과 증명

✅ code-review 커스터마이즈
   - FreeLang v4 CLAUDE.md 검증
   - 에이전트 3파일 구조 검증
   - OUTPUT_PROOF.md 검증

✅ INTEGRATION_SUMMARY.md 작성
   - 통합 내역 정리
   - 사용 방법 가이드
   - Phase 2 로드맵
```

---

## 🚀 사용 가이드

### 1. PR 자동 리뷰
```bash
# 현재 PR을 4개 병렬 에이전트로 리뷰
/code-review

# 결과를 PR 댓글로 포스트
/code-review --comment
```

**검증 항목**:
- CLAUDE.md 준수 (2개 에이전트)
- 버그 탐지 (2개 에이전트)
- 신뢰도 점수 80 이상만 반영

### 2. npm test 검증 커밋
```bash
# 에이전트 변경 후 커밋 (npm test 필수)
/commit-validated

# 기본 커밋 (test 불필요)
/commit
```

**검증 단계**:
1. npm test 실행
2. Test Suites 통과 확인
3. 에이전트 3파일 구조 검증
4. OUTPUT_PROOF.md 업데이트
5. 커밋 메시지 형식 검증

### 3. 기능 개발 자동화
```bash
# 7단계 워크플로우 (code-explorer → code-architect → code-reviewer)
/feature-dev
```

### 4. 완전한 PR 검토
```bash
# 6개 전문 리뷰 에이전트
/pr-review-toolkit:review-pr all

# 특정 항목만 검토
/pr-review-toolkit:review-pr tests      # 테스트 검토
/pr-review-toolkit:review-pr errors     # 에러 처리
/pr-review-toolkit:review-pr types      # 타입 설계
```

### 5. 보안 패턴 감시
```
자동 감시 (PreToolUse 훅):
- Command Injection
- XSS (Cross-Site Scripting)
- Eval 사용
- os.system 호출
- Pickle 역직렬화
- 위험한 HTML
- SQL Injection
- Path Traversal
- 기타 9번째 패턴

파일 편집 시 자동으로 경고 발생
```

---

## 📊 기대 효과

### 시간 절감

| 작업 | 변경 전 | 변경 후 | 절감 |
|------|--------|--------|------|
| PR 리뷰 | 20분 | 2분 | **90%** |
| 커밋 검증 | 10분 | 30초 | **95%** |
| 기능 개발 | 2시간 | 30분 | **75%** |
| 보안 감시 | 수동 | 자동 | **100%** |

### 품질 향상

| 항목 | 현재 | 예상 |
|------|------|------|
| 코드 결함 발견율 | 70% | **90%** |
| 보안 이슈 감지 | 수동 | **자동 9패턴** |
| 테스트 증명 요구 | 선택 | **필수** |
| PR 대기 시간 | 2시간 | **30분** |

---

## 🔧 시스템 요구사항

```bash
✅ Node.js 18+
✅ npm (package manager)
✅ Git
✅ GitHub CLI (gh) - PR 리뷰 시 필수
✅ Gogs 토큰 (GOGS_TOKEN)
✅ GitHub 토큰 (GITHUB_TOKEN) - 선택
```

---

## 📋 명령어 빠른 참조

```bash
# PR 리뷰
/code-review                          # PR 리뷰 (터미널 출력)
/code-review --comment                # PR 리뷰 (댓글 작성)

# 커밋
/commit                               # 기본 커밋
/commit-validated                     # npm test 검증 커밋
/commit-push-pr                       # 커밋 + 푸시 + PR 생성

# 기능 개발
/feature-dev                          # 7단계 자동화

# 상세 리뷰
/pr-review-toolkit:review-pr [aspect]
  - all (모든 항목)
  - comments (주석)
  - tests (테스트)
  - errors (에러)
  - types (타입)
  - code (코드)
  - simplify (단순화)

# Git 정리
/clean_gone                           # 삭제 브랜치 정리
```

---

## 💡 베스트 프랙티스

### 1. **커밋 메시지 형식**
```
feat: [AGENT-{name}] 설명
- npm test: Test Suites: 2 passed, 2 total
- Tests: 18 passed, 18 total
- 정확도 95% 달성
```

### 2. **OUTPUT_PROOF.md 업데이트**
매 커밋마다:
```markdown
## AGENT-code-analyzer
- 날짜: 2026-04-06
- npm test: ✅ 18/18 통과
- 정확도: 95%
- 발견율: 88%
- 성공 기준: 4/4 충족
```

### 3. **PR 전에 로컬 검토**
```bash
/code-review                 # 로컬 검토
# 피드백 반영 후...
/commit-validated           # npm test 검증 커밋
/commit-push-pr             # PR 생성
```

---

## ⚠️ 주의사항

### npm test 실패 시
```
❌ 커밋 거부됨
❌ Test Suites 실패 감지

해결책:
1. npm test 재실행
2. 모든 테스트 통과
3. /commit-validated 재시도
```

### OUTPUT_PROOF.md 미업데이트
```
❌ 커밋 거부됨
❌ 성과 증명 기록 없음

해결책:
1. OUTPUT_PROOF.md 업데이트
2. npm test 결과 포함
3. /commit-validated 재시도
```

### 에이전트 구조 오류
```
❌ code-review 플래그
❌ 3파일 구조 불완전

필수 구조:
agents-impl/{agent-id}/
├── parser.fl
├── analyzer.fl
└── proof.fl
```

---

## 🔄 다음 단계 (Week 2-3)

### Phase 2 계획

```
Week 2:
├── plugin-dev 키트로 조직 표준 플러그인 개발
├── Gogs 자동 배포 플러그인
└── 50~100개 에이전트 정의 완료

Week 3:
├── Hookify로 커스텀 검증 규칙 자동화
├── CI/CD 파이프라인 통합
└── 팀 교육 및 온보딩

Month 2:
├── 플러그인 마켓플레이스 구축
├── 자동 배포 스크립트
└── 포트폴리오 자산화
```

---

## 📞 지원

### 문제 해결
1. `/code-review` 관련 → `code-review/README.md` 참고
2. `npm test` 관련 → `phase2-commit/commands/commit-validated.md` 참고
3. 보안 경고 → `security-guidance/hooks` 확인

### 커스터마이징
- 플러그인별 `README.md` 참고
- `.claude/settings.json` 설정 수정
- hooks.json 통해 동작 커스터마이즈

---

**마지막 업데이트**: 2026-04-06
**상태**: ✅ Phase 1 완료, Phase 2 준비 중
**예상 가시성**: 3주 내 PM 30% 개선
