---
name: no-proof-bypass
enabled: true
event: bash
pattern: git\s+(push|tag).*(--force|-f)
action: block
---

## 🛑 강제 푸시 차단됨

`git push --force` 또는 `git tag -f` 실행이 차단되었습니다.

### 🚨 이유

Phase 2 하네스의 핵심 원칙: **"기록이 증명이다"**

강제 푸시는 다음을 파괴합니다:
1. **OUTPUT_PROOF.md** 이력 손실
2. **proofs/{AGENT-NAME}_PROOF.md** 파일 손실
3. **DECISION_LOG.md** 결정 기록 손실
4. **커밋 이력** 손실

이것은 시스템의 신뢰성을 직접 파괴합니다.

### 🔴 강제 푸시가 절대 필요한가?

대부분의 경우 **필요하지 않습니다**. 대신:

#### 케이스 1: 커밋 메시지 오류
```bash
git commit --amend            # 강제 푸시 대신 수정
git push (다시 푸시 안함)     # 그냥 두기
```

#### 케이스 2: 잘못된 커밋 발견
```bash
git revert HEAD               # 강제 푸시 대신 역 커밋
git push                      # 이력 보존
```

#### 케이스 3: 파일 손실 복구
```bash
git reflog                    # 이전 상태 확인
git reset --hard HEAD@{n}     # 로컬에서만 복구
# 강제 푸시 하지 말 것
```

### ⚠️ 정말 필요한 경우

강제 푸시가 정말 필요하다면:

#### Step 1: 영향 분석
```bash
git push --force --dry-run origin master  # 시뮬레이션
```

#### Step 2: 증명 파일 백업
```bash
cp OUTPUT_PROOF.md OUTPUT_PROOF.md.backup
cp -r proofs/ proofs.backup/
cp DECISION_LOG.md DECISION_LOG.md.backup
```

#### Step 3: 팀 협의
- **반드시 팀원과 논의**
- Slack 채널에 이유 공지
- 그 후 승인받기

#### Step 4: 이유 기록
```bash
# DECISION_LOG.md 에 추가
## 2026-04-06 강제 푸시 (매우 드문 경우)
- 이유: [구체적 설명]
- 영향받은 파일: [목록]
- 백업 위치: OUTPUT_PROOF.md.backup
- 팀원 승인: [이름]
```

#### Step 5: 강제 푸시 (코드 검토 필수)
```bash
git push --force-with-lease origin master
# 또는
git push --force-with-lease origin {branch}
```

### 📌 이 제한의 목적

이 차단은:
- ❌ 개발자를 괴롭히려는 것 아님
- ✅ 시스템 신뢰성 보호
- ✅ 증명 이력 보존
- ✅ 팀 협업 강화

### 🔓 차단 해제 (최후의 수단)

정말 필요하다면:
```bash
# 1. DECISION_LOG.md 에 상세 이유 기록
# 2. 팀 전체 승인
# 3. 아래 명령 실행
export PHASE2_BYPASS_PROOF=true
git push --force origin master
unset PHASE2_BYPASS_PROOF

# 주의: 위험합니다. 사용 후 즉시 DECISION_LOG.md 에 기록하세요.
```

### 💡 대안

강제 푸시 대신:
- `git cherry-pick` 선택적 커밋 가져오기
- `git rebase` 히스토리 정리 (로컬에서만)
- `git revert` 역 커밋으로 보정

이들은 모두 이력을 보존합니다.

---

**이 제한은 필수입니다. 해제하지 마세요.**
