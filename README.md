# 🍜 PWD Week 6 - Ajou Campus Foodmap API (Express + MongoDB + 로그인)

아주 캠퍼스 푸드맵 백엔드(API) 전체 문서입니다. 빠른 시작 → 환경설정 → 기능/아키텍처 → 인증(OAuth 포함) → 로컬 테스트 → 배포(Render) → 트러블슈팅까지 한 문서에서 확인할 수 있습니다.

## 목차
- [🧭 한눈에 보는 개발 흐름](#-한눈에-보는-개발-흐름)
- [⚡ 빠른 시작(Quick Start)](#-빠른-시작quick-start)
- [🧩 아키텍처 & 폴더 구조](#-아키텍처--폴더-구조)
- [🔧 환경 변수(요약)](#-환경-변수요약)
- [🗃️ 데이터 모델](#️-데이터-모델)
- [🔌 API 레퍼런스](#-api-레퍼런스)
- [🔐 인증 시스템 가이드](#-인증-시스템-가이드)
- [🧪 로컬 테스트 가이드](#-로컬-테스트-가이드)
- [🌍 배포 가이드(Render 요약)](#-배포-가이더ender-요약)
- [🧯 트러블슈팅](#-트러블슈팅)
- [✅ 체크리스트](#-체크리스트)
- [📚 참고 자료](#-참고-자료)

---

## 🧭 한눈에 보는 개발 흐름
- 0) 목표: 맛집 데이터 CRUD, 제보 관리, 사용자 인증(로컬/구글)
- 1) 환경 준비: Node/npm, MongoDB(Atlas 권장 또는 로컬), OAuth 콘솔
- 2) .env 설정: `MONGODB_URI`, `SESSION_SECRET`, `CLIENT_URL`, `PORT`, (선택) OAuth 키들
- 3) 로컬 실행: `npm start` → `GET /health` 확인
- 4) 기능 구현/검증: Restaurants, Submissions, Auth, Users
- 5) 프론트 연동: 세션 기반(CORS + credentials)
- 6) 배포(Render): 환경변수/도메인 설정, CORS/쿠키 확인
- 7) 운영: 로그/모니터링, OAuth 리다이렉트, 보안(HTTPS/Cookie/SameSite)

---

## ⚡ 빠른 시작(Quick Start)

### 1) .env 생성
프로젝트 루트(`pwd-week6-server/.env`)에 다음을 설정합니다.
```env
# MongoDB (Atlas 또는 로컬)
MONGODB_URI=mongodb://localhost:27017/foodmap
DB_NAME=pwd-week6

# 서버
PORT=5000
NODE_ENV=development
SESSION_SECRET=my-super-secret-key-12345

# 클라이언트 URL (CORS 및 OAuth 리다이렉트 대상)
CLIENT_URL=http://localhost:5173

# 선택: OAuth 사용 시
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 2) 설치/실행
```bash
npm install
npm start
```
성공 시:
```
[MongoDB] connected: pwd-week6
Server listening on port 5000
```

### 3) 헬스 체크
```bash
curl http://localhost:5000/health
# { "status":"ok", "db": 1 }  # 1: connected
```

---

## 🧩 아키텍처 & 폴더 구조

- Runtime: Node.js 22
- Framework: Express 5, cors
- DB: MongoDB (Mongoose 8)
- 인증: Passport(Local/Google) + express-session + connect-mongo
- 구조: MVC(S)

```
src/
 ├─ app.js                       # Express 앱 구성(미들웨어/CORS/세션/라우팅)
 ├─ config/
 │   ├─ db.js                    # Mongoose 연결/종료
 │   └─ passport.config.js       # Passport(Local/Google)
 ├─ controllers/
 │   ├─ auth.controller.js
 │   ├─ restaurants.controller.js
 │   ├─ submissions.controller.js
 │   └─ users.controller.js
 ├─ data/restaurants.json        # 초기 시드 데이터
 ├─ middleware/
 │   ├─ auth.middleware.js       # isAuthenticated/isNotAuthenticated/isLocalAccount
 │   ├─ error.middleware.js
 │   └─ notFound.middleware.js
 ├─ models/
 │   ├─ restaurant.model.js
 │   ├─ submission.model.js
 │   └─ user.model.js
 ├─ routes/
 │   ├─ auth.routes.js
 │   ├─ restaurants.routes.js
 │   ├─ submissions.routes.js
 │   └─ users.routes.js
 ├─ services/
 │   ├─ auth.service.js
 │   ├─ restaurants.service.js
 │   ├─ submissions.service.js
 │   └─ users.service.js
 └─ utils/asyncHandler.js
server.js                        # 서버 시작 + DB 연결 + 시드 주입
```

---

## 🔧 환경 변수(요약)
필수
- `MONGODB_URI`: MongoDB 연결 문자열 (Atlas/로컬)
- `DB_NAME`: 데이터베이스 명 (예: `pwd-week6`)
- `SESSION_SECRET`: 긴 랜덤 문자열
- `CLIENT_URL`: 클라이언트 Origin(로컬은 `http://localhost:5173`)
- `PORT`: 기본 5000 권장(서버 코드 기본값이 3000이므로 .env로 5000 지정)

선택(OAuth 활성화 시)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

---

## 🗃️ 데이터 모델
### Restaurant (`src/models/restaurant.model.js`)
```js
{
  id: Number,
  name: String,
  category: String,
  location: String,
  priceRange: String,
  rating: Number,
  description: String,
  recommendedMenu: [String],
  likes: Number,
  image: String
}
```
- 컨트롤러에서 `recommendedMenu` 문자열 입력 시 콤마 기준으로 정규화 처리

### Submission (`src/models/submission.model.js`)
```js
{
  id: Number,
  restaurantName: String,
  category: String,
  location: String,
  priceRange: String,
  recommendedMenu: [String],
  review: String,
  submitterName: String,
  submitterEmail: String,
  status: 'pending'|'approved'|'rejected'
}
```

### User (`src/models/user.model.js`)
```js
{
  email: String,
  password: String,            // provider === 'local'일 때만 필수
  provider: 'local'|'google',
  providerId: String | null,
  name: String,
  avatar: String | null,
  isActive: Boolean
}
```
- 저장 시 비밀번호 해시, 응답 직렬화 시 비밀번호 제거

---

## 🔌 API 레퍼런스

### Health
- `GET /health` → `{ status: 'ok', db: <mongooseState> }`

### Restaurants
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `GET /api/restaurants/popular?limit=5`
- `POST /api/restaurants`
- `PUT /api/restaurants/:id`
- `DELETE /api/restaurants/:id`

### Submissions
- `GET /api/submissions?status=pending|approved|rejected`
- `GET /api/submissions/:id`
- `POST /api/submissions`
- `PUT /api/submissions/:id`
- `DELETE /api/submissions/:id`

### Auth (세션 기반)
- `POST /api/auth/register`  회원가입(자동 로그인)
- `POST /api/auth/login`     로그인
- `POST /api/auth/logout`    로그아웃(세션 제거)
- `GET  /api/auth/me`        현재 사용자 정보(보호)
- `GET  /api/auth/google`    구글 OAuth 시작(옵션)

### Users
- `GET  /api/users/profile`  내 프로필 조회(보호)
- `PUT  /api/users/profile`  내 프로필 수정(보호)
- `PUT  /api/users/password` 비밀번호 변경(보호, 로컬 계정만)
- `DELETE /api/users/account` 계정 삭제/비활성화(보호)

---

## 🔐 인증 시스템 가이드

### 핵심 흐름
- 세션 기반 인증: `express-session` + `connect-mongo`
- 미들웨어:
  - `isAuthenticated`: 로그인 필요 라우트 보호
  - `isNotAuthenticated`: 비로그인 상태 전용(로그인/회원가입)
  - `isLocalAccount`: 로컬 계정 전용 기능(비밀번호 변경 등)

### 로컬 계정(Auth)
- 회원가입 → 세션 로그인 → `/api/auth/me`에서 사용자 반환
- 로그인/로그아웃 → 세션 생성/삭제

### OAuth(선택: 환경변수 설정 시 활성화)
- 구글: `GET /api/auth/google` → 구글 동의 후 콜백(`/api/auth/google/callback`) → 세션 저장 → `CLIENT_URL/dashboard`로 리다이렉트
- 동일 이메일로 다른 제공자에 가입된 경우 → 로그인 거절(중복 방지)

### 보안 고려
- 프로덕션은 HTTPS 사용, 쿠키: `secure: true`, `sameSite: 'none'`
- 긴 `SESSION_SECRET` 필수, 환경변수로만 관리
- CORS: `origin = CLIENT_URL`, `credentials: true`

---

## 🧪 로컬 테스트 가이드

### 사전 준비
- Node/npm 설치
- MongoDB(Atlas 권장) 또는 로컬 `mongod` 실행

### 서버 시작/확인
```bash
npm start
curl http://localhost:5000/health
```

### PowerShell 예제
```powershell
# 회원가입
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test1234","name":"테스터"}'

# 로그인
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test1234"}'
```
> curl은 쿠키 저장을 자동으로 처리하지 않습니다. 이후 요청은 브라우저/Postman 권장.

### 브라우저 테스트
- 간단한 HTML(`test.html`)로 버튼 테스트 또는 프론트엔드 클라이언트 연동(권장)

### Postman 테스트 팁
- 쿠키 자동 저장 설정
- 순서: Health → Register → Login → Me → Profile/Password → Logout

---

## 🌍 배포 가이드(Render 요약)

1) Render Dashboard → New → Web Service → GitHub 저장소 선택
2) 설정 예시
- Name: `pwd-week6-server`
- Branch: `main`
- Root Directory: `pwd-week6-server` (모노레포 시)
- Build Command: `npm install`
- Start Command: `npm start`

3) Environment Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodmap?retryWrites=true&w=majority
SESSION_SECRET=super-secret-production-key-change-this
CLIENT_URL=https://your-client-app.vercel.app
PORT=10000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-server-app.onrender.com/api/auth/google/callback
```

4) 배포 검증
```bash
curl https://your-app.onrender.com/health   # {"status":"ok","db":1}
```
- CORS/쿠키: 클라이언트 `withCredentials: true`, 서버 `credentials: true`
- 프론트엔드(Vercel)에 `VITE_API_URL`을 Render 서버 URL로 설정

---

## 🧯 트러블슈팅
- Mongo 연결 실패: `MONGODB_URI`/방화벽/IP 허용 확인, Atlas 계정/권한
- CORS 오류: `CLIENT_URL` 정확한 Origin 등록(프로토콜/서브도메인 포함)
- 세션 미유지: HTTPS + `SameSite=None; Secure`, 쿠키/도메인 확인
- OAuth redirect mismatch: 제공자 콘솔의 Callback URL과 .env 일치
- 포트 충돌: `PORT` 변경 또는 사용 중인 PID 종료

---

## ✅ 체크리스트
- [ ] `/health` 200 OK, `db:1`
- [ ] Restaurants CRUD 정상 응답
- [ ] Submissions CRUD 정상 응답
- [ ] Register/Login/Logout/Me 정상 동작
- [ ] Users Profile/Password/Account 정상 동작
- [ ] (선택) Google OAuth 정상 동작
- [ ] CORS/세션 쿠키 정상 동작(로컬/배포)

---

## 📚 참고 자료
- Passport: Local/Google Strategy
- Express Session / connect-mongo / Mongoose
- Render/Vercel 배포 문서

이 문서에 빠진 내용이 있거나 팀 규칙(브랜치 전략/코드 스타일/PR 템플릿 등)이 필요하면 섹션을 추가해 확장하세요.