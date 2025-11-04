# 🧠 Online Learning System (LMS)

학생이 강의를 수강하고, 전문가가 강의를 만들 수 있는 웹 기반 학습 관리 시스템입니다.
개인은 자신이 원하는 기술을 배우고, 전문가들은 지식을 강의로 만들어 다른 사람들과 공유할 수 있습니다.
---


### 호환성이 높고 스트리밍을 지원하는 HLS를 사용하였습니다.
---

## 🚀 기술 스택

### Backend
- Java 21, Spring Boot 3.2
- JPA, PostgreSQL:15
- JWT 기반 인증
- Gradle

### Frontend
- Next.js 15 (Vite + TypeScript)
- Axios, Next.js

### Infrastructure
- **Docker**: 백엔드/프론트엔드 컨테이너화
- **Nginx**: 프론트엔드 정적 파일 서빙 및 리버스 프록시

---

## ⚙️ 프로젝트 구조

```plaintext
ols-system
├── ols-backend/              # Spring Boot 서버
├── ols-frontend/             # React 프론트엔드
├── nginx/                # Nginx 설정 파일
├── docker-compose.yml
└── README.md
