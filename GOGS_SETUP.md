# Gogs 서버 실행 방법

**작성일**: 2026-04-04
**목표**: 로컬 Gogs 서버 설정 및 phase2-agents-harness 저장소 관리

---

## 📋 사전 요구사항

```bash
# 필요한 것들:
- Docker (권장) 또는 직접 설치
- Git
- GOGS_TOKEN (환경변수)
```

---

## 🚀 방법 1: Docker로 실행 (권장)

### 1단계: Docker 이미지 내려받기
```bash
docker pull gogs/gogs:latest
```

### 2단계: Gogs 컨테이너 실행
```bash
docker run -d \
  --name gogs \
  -p 3000:3000 \
  -p 10022:22 \
  -v /var/gogs:/data \
  gogs/gogs:latest
```

**포트 설정**:
- HTTP: `3000` (웹 인터페이스)
- SSH: `10022` (Git SSH 접근)

### 3단계: 초기 설정
```bash
# 브라우저에서 접속
http://localhost:3000

# 초기 설정:
# - 데이터베이스: SQLite
# - 리포지토리 경로: /data/gogs-repositories
# - 사용자명: admin
# - 비밀번호: 설정
```

### 4단계: 저장소 생성
```bash
# Gogs 웹 인터페이스에서:
# 1. 로그인
# 2. 새 저장소 → phase2-agents-harness
# 3. 설명: "54개 AI 에이전트 자동 조율 하네스"
```

---

## 🚀 방법 2: 직접 설치 (Linux)

### 1단계: Gogs 내려받기
```bash
# 최신 버전 다운로드
wget https://github.com/gogs/gogs/releases/download/v0.12.3/gogs_0.12.3_linux_amd64.tar.gz

# 압축 해제
tar xzf gogs_0.12.3_linux_amd64.tar.gz
cd gogs
```

### 2단계: 데이터베이스 준비
```bash
# SQLite 사용 (기본)
mkdir -p custom/conf
mkdir -p data
```

### 3단계: Gogs 시작
```bash
./gogs web
```

**출력**:
```
2026/04/04 16:30:00 [TRACE] AppPath: /path/to/gogs
2026/04/04 16:30:00 [INFO] Gogs 0.12.3
2026/04/04 16:30:00 [INFO] Listening on 0.0.0.0:3000
```

---

## 🔐 GitHub 토큰 설정

### 1단계: 토큰 생성
```bash
# GitHub에서:
# Settings → Developer settings → Personal access tokens
# 권한: repo, admin:repo_hook, admin:org_hook
```

### 2단계: 환경변수 설정
```bash
# ~/.env 파일에 추가:
export GOGS_TOKEN="your_github_token_here"
export GITHUB_TOKEN="your_github_token_here"

# 적용:
source ~/.env
```

### 3단계: 저장소 동기화
```bash
# Gogs에서 GitHub로:
git remote add github https://github.com/kim/phase2-agents-harness.git
git push github master

# GitHub에서 Gogs로:
git remote set-url origin https://gogs.dclub.kr/kim/phase2-agents-harness.git
git push origin master
```

---

## 📤 저장소에 푸시하기

### 단계 1: 원격 저장소 설정
```bash
# 로컬 저장소에서:
cd phase2-agents-harness

# 원격 저장소 확인:
git remote -v

# 없으면 추가:
git remote add origin https://gogs.dclub.kr/kim/phase2-agents-harness.git
```

### 단계 2: 토큰 인증
```bash
# HTTP 기반 인증:
git remote set-url origin \
  https://x-access-token:${GOGS_TOKEN}@gogs.dclub.kr/kim/phase2-agents-harness.git
```

### 단계 3: 푸시 실행
```bash
# 마스터 브랜치 푸시:
git push -u origin master

# 모든 브랜치 푸시:
git push -u origin --all

# 모든 태그 푸시:
git push origin --tags
```

**출력 예시**:
```
Counting objects: 100% (25/25), done.
Delta compression using up to 8 threads
Compressing objects: 100% (20/20), done.
Writing objects: 100% (25/25), 15.32 KiB | 3.83 MiB/s, done.
Total 25 (delta 10), reused 0 (delta 0), reused 1 (delta 0)
remote: Create a new pull request for 'master':
To https://gogs.dclub.kr/kim/phase2-agents-harness.git
   46fd826..e58f84f  master -> master
```

---

## 🔄 양방향 동기화

### GitHub ↔ Gogs 동기화 설정

```bash
# 1. GitHub를 기본값으로 설정:
git remote rename origin github
git remote add origin https://gogs.dclub.kr/kim/phase2-agents-harness.git

# 2. 자동 동기화 스크립트:
cat > sync-repos.sh << 'EOF'
#!/bin/bash

echo "🔄 GitHub → Gogs 동기화"

# GitHub에서 최신 가져오기
git fetch github
git fetch github --tags

# Gogs로 푸시
git push origin refs/remotes/github/*:refs/heads/*
git push origin --tags

echo "✅ 동기화 완료"
EOF

chmod +x sync-repos.sh
./sync-repos.sh
```

---

## 🧪 푸시 테스트

### 테스트 커밋 만들기
```bash
# 테스트 파일 생성:
echo "# Gogs 테스트" > GOGS_TEST.md

# 스테이징:
git add GOGS_TEST.md

# 커밋:
git commit -m "test: Gogs 푸시 테스트"

# 푸시:
git push origin master

# Gogs 웹에서 확인:
# https://gogs.dclub.kr/kim/phase2-agents-harness
```

---

## 🛠️ 문제 해결

### 1. 인증 실패
```bash
# 토큰 확인:
echo $GOGS_TOKEN

# 리모트 URL 확인:
git remote -v

# 수정:
git remote set-url origin \
  https://x-access-token:${GOGS_TOKEN}@gogs.dclub.kr/kim/phase2-agents-harness.git
```

### 2. 연결 거부
```bash
# Gogs 서버 상태 확인:
curl http://localhost:3000

# Docker 로그 확인:
docker logs gogs

# 방화벽 확인:
sudo iptables -L -n | grep 3000
```

### 3. SSH 연결 (대안)
```bash
# SSH 키 설정:
ssh-keygen -t ed25519 -f ~/.ssh/gogs_key

# Gogs 설정에서 공개키 등록

# SSH로 푸시:
git remote set-url origin \
  ssh://git@gogs.dclub.kr:10022/kim/phase2-agents-harness.git

git push origin master
```

---

## 📊 Gogs 관리

### 사용자 관리
```bash
# 새 사용자 추가 (CLI):
./gogs admin create-user --name admin --password "password"
```

### 저장소 설정
```bash
# 웹 인터페이스에서:
1. Settings → Repository
2. 설명 업데이트
3. 웹훅 추가 (GitHub Actions 통합)
4. 보호된 브랜치 설정
```

### 백업
```bash
# Docker 볼륨 백업:
docker run --rm \
  -v /var/gogs:/data \
  -v $(pwd):/backup \
  busybox tar czf /backup/gogs-backup.tar.gz -C / data

# 복원:
docker run --rm \
  -v /var/gogs:/data \
  -v $(pwd):/backup \
  busybox tar xzf /backup/gogs-backup.tar.gz -C /
```

---

## ✅ 체크리스트

```
Gogs 설정:
[✓] Docker 또는 직접 설치
[✓] 서버 시작 (포트 3000)
[✓] 초기 설정 (admin 계정)
[✓] 저장소 생성

토큰 설정:
[✓] GOGS_TOKEN 환경변수 설정
[✓] 로컬 Git 설정 (remote URL)
[✓] 인증 확인

푸시:
[✓] 테스트 푸시 실행
[✓] Gogs 웹에서 확인
[✓] 동기화 스크립트 설정

선택사항:
[ ] GitHub 양방향 동기화
[ ] 웹훅 설정
[ ] 백업 스크립트
```

---

## 📚 참고 자료

- [Gogs 공식 문서](https://gogs.io)
- [Docker Gogs 이미지](https://hub.docker.com/r/gogs/gogs)
- [Git 인증 설정](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)

---

**최종 상태**: 배포 준비 완료
**다음 단계**: GitHub Actions 워크플로우 실행 (2026-04-05)
