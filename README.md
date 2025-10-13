# 🍜 PWD Week 6 - Ajou Campus Foodmap API (Express + MongoDB + 인증 시스템)

아주 캠퍼스 푸드맵 백엔드(API) 완전 가이드입니다. 웹 개발 입문자들이 차근차근 따라할 수 있도록 체계적으로 구성된 문서로, Express.js 기반 REST API 개발부터 인증 시스템 구현, 배포까지 모든 과정을 다룹니다.

## 📋 목차
- [🎯 프로젝트 개요](#-프로젝트-개요)
- [🚀 빠른 시작 가이드](#-빠른-시작-가이드)
- [🛠️ 개발 환경 설정](#️-개발-환경-설정)
- [📁 프로젝트 구조 분석](#-프로젝트-구조-분석)
- [🗄️ 데이터베이스 모델](#️-데이터베이스-모델)
- [🔐 인증 시스템 상세 가이드](#-인증-시스템-상세-가이드)
- [🔌 API 엔드포인트 완전 가이드](#-api-엔드포인트-완전-가이드)
- [🧪 테스트 및 검증](#-테스트-및-검증)
- [🌐 배포 가이드](#-배포-가이드)
- [🔧 관리자 도구 사용법](#-관리자-도구-사용법)
- [🧯 트러블슈팅 가이드](#-트러블슈팅-가이드)
- [✅ 개발 체크리스트](#-개발-체크리스트)
- [📚 추가 학습 자료](#-추가-학습-자료)

---

## 🎯 백엔드 API 서버 개요

### 서버 목표
아주 캠퍼스 푸드맵의 **REST API 서버**로, 프론트엔드 클라이언트가 필요한 모든 데이터와 기능을 제공합니다.

### 🔧 **백엔드 핵심 기능**

#### 🗄️ **데이터 관리 API**
- **맛집 CRUD**: 맛집 정보 생성, 조회, 수정, 삭제
- **제보 관리**: 사용자 제보 수집 및 관리자 승인 시스템
- **사용자 관리**: 사용자 프로필, 권한, 계정 관리
- **데이터 검증**: Mongoose 스키마 기반 데이터 유효성 검사

#### 🔐 **인증 & 보안 시스템**
- **다중 인증 방식**: 로컬 계정, Google OAuth, Naver OAuth
- **세션 관리**: Express Session + MongoDB 세션 저장소
- **권한 제어**: 미들웨어 기반 라우트 보호
- **보안 강화**: bcrypt 해싱, CORS, 쿠키 보안

#### 🛡️ **API 보안 & 미들웨어**
- **인증 미들웨어**: 로그인 상태 확인
- **권한 미들웨어**: 관리자 권한 검증
- **에러 처리**: 통합 에러 핸들링 시스템
- **CORS 설정**: 환경별 허용 도메인 관리

#### 📊 **데이터베이스 설계**
- **MongoDB 스키마**: 최적화된 인덱스 설계
- **관계형 데이터**: 사용자-맛집-제보 관계 모델링
- **데이터 정규화**: 효율적인 데이터 저장 구조
- **쿼리 최적화**: 성능 향상을 위한 인덱스 전략

### 🛠️ **백엔드 기술 스택**

#### **서버 프레임워크**
- **Node.js**: JavaScript 런타임 환경
- **Express.js 5.1**: 최신 웹 애플리케이션 프레임워크
- **MVC 패턴**: 모델-뷰-컨트롤러 아키텍처

#### **데이터베이스 & ODM**
- **MongoDB**: NoSQL 문서 데이터베이스
- **Mongoose 8.18**: MongoDB ODM (Object Document Mapper)
- **MongoDB Atlas**: 클라우드 데이터베이스 서비스
- **연결 풀 최적화**: maxPoolSize, serverSelectionTimeoutMS 설정

#### **인증 & 보안**
- **Passport.js**: 인증 미들웨어 (Local, Google, Naver)
- **bcryptjs**: 비밀번호 해싱 (salt rounds: 12)
- **express-session**: 세션 관리 (7일 만료)
- **connect-mongo**: MongoDB 세션 저장소
- **프록시 신뢰**: Render/Vercel 환경 대응

#### **API & 통신**
- **RESTful API**: REST 아키텍처 원칙
- **동적 CORS**: 환경별 허용 도메인 자동 설정
- **JSON**: 데이터 교환 형식
- **HTTP 메서드**: GET, POST, PUT, DELETE
- **쿠키 기반 인증**: HttpOnly, Secure, SameSite 설정

#### **고급 기능**
- **자동 시드 데이터**: 서버 시작 시 초기 데이터 자동 주입
- **Graceful Shutdown**: SIGINT/SIGTERM 신호 처리
- **환경별 설정**: development/production 자동 감지
- **에러 처리**: 통합 에러 핸들링 시스템
- **성능 최적화**: 세션 터치 최적화, 연결 풀 관리

### 🏗️ **서버 아키텍처**

#### **폴더 구조 (MVC 패턴)**
```
src/
├── models/          # 데이터 모델 (Mongoose 스키마)
├── controllers/      # 비즈니스 로직 (API 핸들러)
├── routes/          # 라우트 정의 (엔드포인트)
├── services/        # 서비스 레이어 (비즈니스 로직)
├── middleware/      # 미들웨어 (인증, 에러 처리)
├── config/          # 설정 파일 (DB, Passport)
└── utils/           # 유틸리티 함수
```

#### **API 설계 원칙**
- **RESTful**: 리소스 기반 URL 설계
- **일관성**: 통일된 응답 형식
- **확장성**: 모듈화된 구조
- **보안**: 인증/권한 기반 접근 제어

---

## 🚀 빠른 시작 가이드

### 1단계: 필수 도구 설치

#### Node.js 설치 (권장 버전: 18.x 이상)
```bash
# Node.js 공식 사이트에서 다운로드
# https://nodejs.org/

# 설치 확인
node --version
npm --version
```

#### MongoDB 설치
**옵션 1: MongoDB Atlas (클라우드, 권장)**
- [MongoDB Atlas](https://www.mongodb.com/atlas)에서 무료 계정 생성
- 클러스터 생성 후 연결 문자열 복사
- IP 화이트리스트 설정 (0.0.0.0/0 권장)

**옵션 2: 로컬 MongoDB 설치**
```bash
# Windows (Chocolatey 사용)
choco install mongodb

# macOS (Homebrew 사용)
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
```

### 2단계: 프로젝트 설정

#### 의존성 설치
```bash
# 프로젝트 디렉토리로 이동
cd pwd-week6-server

# 의존성 설치
npm install
```

#### 환경변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
# 데이터베이스 설정
MONGODB_URI=mongodb://localhost:27017/ajou-foodmap
DB_NAME=ajou-foodmap

# 서버 설정
PORT=5000  # 기본값은 3000이지만 5000 권장
NODE_ENV=development

# 세션 보안
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# 클라이언트 URL (CORS 설정용)
CLIENT_URL=http://localhost:5173

# OAuth 설정 (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_CALLBACK_URL=http://localhost:5000/api/auth/naver/callback
```

> 📝 **중요**: 
> - 환경변수가 없어도 기본값이 자동으로 설정됩니다.
> - `cors-config.js`에서 환경별 CORS 설정을 자동으로 관리합니다.
> - 서버 시작 시 자동으로 시드 데이터가 주입됩니다.

### 3단계: 서버 실행 및 확인

#### 서버 시작
```bash
npm start
```

성공적인 실행 시 다음과 같은 메시지가 출력됩니다:
```
[MongoDB] connected: ajou-foodmap
Server listening on port 5000
```

> 📝 **자동 기능들**:
> - **시드 데이터 자동 주입**: 서버 시작 시 초기 맛집 데이터 자동 생성
> - **환경별 설정**: development/production 환경 자동 감지
> - **CORS 자동 설정**: 클라이언트 도메인 자동 허용
> - **Graceful Shutdown**: 서버 종료 시 안전한 데이터베이스 연결 해제

#### 헬스 체크
```bash
# PowerShell에서
curl http://localhost:5000/health

# 또는 브라우저에서
http://localhost:5000/health
```

정상 응답:
```json
{
  "success": true,
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

## 🛠️ 개발 환경 설정

### 상세 환경변수 설명

#### 필수 환경변수
- **MONGODB_URI**: MongoDB 연결 문자열
  - 로컬: `mongodb://localhost:27017/ajou-foodmap`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/ajou-foodmap`
- **DB_NAME**: 데이터베이스 이름
- **SESSION_SECRET**: 세션 암호화를 위한 비밀키 (최소 32자)
- **CLIENT_URL**: 프론트엔드 URL (CORS 설정용)
- **PORT**: 서버 포트 (기본값: 3000, 권장: 5000)

#### 선택적 환경변수 (OAuth 사용 시)
- **GOOGLE_CLIENT_ID**: Google OAuth 클라이언트 ID
- **GOOGLE_CLIENT_SECRET**: Google OAuth 클라이언트 시크릿
- **GOOGLE_CALLBACK_URL**: Google OAuth 콜백 URL
- **NAVER_CLIENT_ID**: 네이버 OAuth 클라이언트 ID
- **NAVER_CLIENT_SECRET**: 네이버 OAuth 클라이언트 시크릿
- **NAVER_CALLBACK_URL**: 네이버 OAuth 콜백 URL

#### 배포 환경변수 (Render/Vercel 배포 시)
- **VERCEL_URL**: Vercel 배포 시 자동 설정되는 URL
- **PRODUCTION_CLIENT_URL**: 프로덕션 클라이언트 URL
- **DEFAULT_CLIENT_URL**: 기본 클라이언트 URL (기본값: `https://pwd-week6-client.vercel.app`)

### OAuth 설정 가이드

#### Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "사용자 인증 정보" 이동
4. "OAuth 2.0 클라이언트 ID" 생성
5. 승인된 리디렉션 URI 추가: `http://localhost:5000/api/auth/google/callback`

#### 네이버 OAuth 설정
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. 서비스 환경에서 "Web" 선택
4. 서비스 URL: `http://localhost:5000`
5. Callback URL: `http://localhost:5000/api/auth/naver/callback`

---

## 📁 프로젝트 구조 분석

### 전체 폴더 구조
```
pwd-week6-server/
├── src/                          # 소스 코드
│   ├── app.js                    # Express 앱 설정
│   ├── config/                   # 설정 파일
│   │   ├── db.js                # 데이터베이스 연결
│   │   └── passport.config.js    # Passport 인증 설정
│   ├── controllers/              # 컨트롤러 (비즈니스 로직)
│   │   ├── auth.controller.js   # 인증 관련 API
│   │   ├── restaurants.controller.js # 맛집 관리 API
│   │   ├── submissions.controller.js # 제보 관리 API
│   │   └── users.controller.js  # 사용자 관리 API
│   ├── middleware/               # 미들웨어
│   │   ├── auth.middleware.js   # 인증 미들웨어
│   │   ├── error.middleware.js  # 에러 처리
│   │   └── notFound.middleware.js # 404 처리
│   ├── models/                   # 데이터 모델
│   │   ├── restaurant.model.js  # 맛집 모델
│   │   ├── submission.model.js  # 제보 모델
│   │   └── user.model.js        # 사용자 모델
│   ├── routes/                   # 라우트 정의
│   │   ├── auth.routes.js       # 인증 라우트
│   │   ├── restaurants.routes.js # 맛집 라우트
│   │   ├── submissions.routes.js # 제보 라우트
│   │   └── users.routes.js      # 사용자 라우트
│   ├── services/                 # 서비스 레이어
│   │   ├── auth.service.js      # 인증 서비스
│   │   ├── restaurants.service.js # 맛집 서비스
│   │   ├── submissions.service.js # 제보 서비스
│   │   └── users.service.js     # 사용자 서비스
│   ├── utils/                    # 유틸리티
│   │   └── asyncHandler.js      # 비동기 에러 처리
│   └── data/                     # 초기 데이터
│       └── restaurants.json     # 시드 데이터
├── tests/                        # 테스트 파일
├── server.js                     # 서버 진입점
├── package.json                  # 프로젝트 설정
├── .env                         # 환경변수 (생성 필요)
├── cors-config.js               # CORS 설정
├── create-admin.js              # 관리자 계정 생성
├── change-user-type.js          # 사용자 권한 변경
└── test.html                    # API 테스트 페이지
```

### MVC 패턴 설명

#### Model (모델)
- **역할**: 데이터베이스 스키마 정의 및 데이터 검증
- **위치**: `src/models/`
- **주요 파일**:
  - `user.model.js`: 사용자 정보 스키마
  - `restaurant.model.js`: 맛집 정보 스키마
  - `submission.model.js`: 제보 정보 스키마

#### View (뷰)
- **역할**: API 응답 형식 정의 (JSON)
- **구현**: 컨트롤러에서 JSON 응답 반환

#### Controller (컨트롤러)
- **역할**: HTTP 요청 처리 및 비즈니스 로직 호출
- **위치**: `src/controllers/`
- **주요 기능**:
  - 요청 데이터 검증
  - 서비스 레이어 호출
  - 응답 데이터 형식화

#### Service (서비스)
- **역할**: 비즈니스 로직 구현
- **위치**: `src/services/`
- **주요 기능**:
  - 데이터베이스 조작
  - 비즈니스 규칙 적용
  - 에러 처리

---

## 🗄️ 데이터베이스 모델

### User 모델 (`src/models/user.model.js`)

#### 스키마 구조
```javascript
{
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() { return this.provider === 'local'; }
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'naver'],
    default: 'local'
  },
  providerId: {
    type: String,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}
```

#### 주요 기능
- **비밀번호 해싱**: 저장 시 자동으로 bcrypt로 해싱
- **비밀번호 검증**: `comparePassword()` 메서드 제공
- **JSON 직렬화**: 응답 시 비밀번호 필드 자동 제거
- **복합 인덱스**: 이메일 + 프로바이더 조합으로 유니크 제약

### Restaurant 모델 (`src/models/restaurant.model.js`)

#### 스키마 구조
```javascript
{
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true
  },
  priceRange: {
    type: String,
    default: '정보 없음'
  },
  rating: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  recommendedMenu: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  }
}
```

#### 주요 특징
- **인덱스 최적화**: `id`, `name`, `category` 필드에 인덱스 설정
- **기본값 제공**: `priceRange`, `description`, `image` 등에 기본값 설정
- **JSON 변환**: `_id` 필드 자동 제거, `id` 필드만 노출
- **타임스탬프**: `createdAt`, `updatedAt` 자동 생성

### Submission 모델 (`src/models/submission.model.js`)

#### 스키마 구조
```javascript
{
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  restaurantName: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true
  },
  priceRange: {
    type: String,
    default: ''
  },
  recommendedMenu: {
    type: [String],
    default: []
  },
  review: {
    type: String,
    default: ''
  },
  submitterName: {
    type: String,
    default: ''
  },
  submitterEmail: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  }
}
```

#### 주요 특징
- **인덱스 최적화**: `id`, `restaurantName`, `category`, `status` 필드에 인덱스 설정
- **기본값 제공**: 모든 필드에 적절한 기본값 설정
- **JSON 변환**: `_id` 필드 자동 제거, `id` 필드만 노출
- **타임스탬프**: `createdAt`, `updatedAt` 자동 생성

---

## 🔐 인증 시스템 상세 가이드

### 인증 방식 개요

#### 1. 로컬 인증 (이메일/비밀번호)
- **회원가입**: 이메일, 비밀번호, 이름 입력
- **로그인**: 이메일/비밀번호로 인증
- **보안**: bcrypt를 통한 비밀번호 해싱

#### 2. OAuth 인증
- **Google OAuth**: Google 계정으로 로그인
- **네이버 OAuth**: 네이버 계정으로 로그인
- **자동 계정 생성**: OAuth 로그인 시 자동으로 계정 생성

### Passport.js 설정 (`src/config/passport.config.js`)

#### 로컬 전략 설정
```javascript
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email, provider: 'local' });
    if (!user || !await user.comparePassword(password)) {
      return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));
```

#### Google OAuth 전략
```javascript
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  // Google 프로필 정보로 사용자 생성/조회
}));
```

### 세션 관리

#### 세션 설정 (`src/app.js`) - 실제 구현
```javascript
function createApp() {
  const app = express();
  
  // 프록시 환경 대응 (Render, Vercel)
  app.set('trust proxy', 1);

  // CORS 설정 - 환경별 자동 설정
  app.use(cors(getCorsConfig()));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 세션 설정
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  };

  // 프록시 환경에서 set-cookie 처리 안정화
  if (process.env.NODE_ENV === 'production') {
    sessionConfig.proxy = true;
  }

  // MongoDB 연결 상태에 따른 세션 저장소 설정
  if (mongoose.connection.readyState === 1) {
    sessionConfig.store = MongoStore.create({
      client: mongoose.connection.getClient(),
      touchAfter: 24 * 3600 // 24시간 동안 세션 업데이트 방지
    });
  } else if (process.env.MONGODB_URI) {
    sessionConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: process.env.DB_NAME,
      touchAfter: 24 * 3600
    });
  }

  app.use(session(sessionConfig));
  
  // Passport 초기화
  app.use(passport.initialize());
  app.use(passport.session());
  
  return app;
}
```

### 인증 미들웨어 (`src/middleware/auth.middleware.js`)

#### 주요 미들웨어 함수들

**isAuthenticated**: 로그인 확인
```javascript
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: '로그인이 필요합니다.' });
};
```

**isAdmin**: 관리자 권한 확인
```javascript
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.userType === 'admin') {
    return next();
  }
  return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
};
```

**isLocalAccount**: 로컬 계정 확인
```javascript
const isLocalAccount = (req, res, next) => {
  if (req.isAuthenticated() && req.user.provider === 'local') {
    return next();
  }
  return res.status(400).json({ message: '로컬 계정이 아닙니다.' });
};
```

---

## 🔌 API 엔드포인트 완전 가이드

### 인증 API (`/api/auth`)

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "사용자명"
}
```

**응답 예시**:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "사용자명",
    "provider": "local",
    "userType": "user"
  }
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 로그아웃
```http
POST /api/auth/logout
```

#### 현재 사용자 정보
```http
GET /api/auth/me
```

#### OAuth 로그인
```http
GET /api/auth/google    # Google 로그인 시작
GET /api/auth/naver     # 네이버 로그인 시작
```

### 맛집 관리 API (`/api/restaurants`)

#### 모든 맛집 조회
```http
GET /api/restaurants
```

**쿼리 파라미터**:
- `category`: 카테고리별 필터링
- `location`: 위치별 필터링
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)

#### 특정 맛집 조회
```http
GET /api/restaurants/:id
```

#### 인기 맛집 조회
```http
GET /api/restaurants/popular?limit=5
```

#### 맛집 생성 (관리자만)
```http
POST /api/restaurants
Authorization: Required (Admin)

{
  "name": "맛집 이름",
  "category": "한식",
  "location": "위치",
  "priceRange": "5,000~10,000원",
  "description": "설명",
  "recommendedMenu": ["메뉴1", "메뉴2"],
  "image": "이미지URL"
}
```

#### 맛집 수정 (관리자만)
```http
PUT /api/restaurants/:id
Authorization: Required (Admin)
```

#### 맛집 삭제 (관리자만)
```http
DELETE /api/restaurants/:id
Authorization: Required (Admin)
```

### 제보 관리 API (`/api/submissions`)

#### 제보 목록 조회
```http
GET /api/submissions?status=pending
```

**쿼리 파라미터**:
- `status`: pending, approved, rejected

#### 제보 생성
```http
POST /api/submissions

{
  "restaurantName": "맛집 이름",
  "category": "한식",
  "location": "위치",
  "priceRange": "5,000~10,000원",
  "recommendedMenu": ["메뉴1", "메뉴2"],
  "review": "리뷰 내용",
  "submitterName": "제보자 이름",
  "submitterEmail": "제보자 이메일"
}
```

#### 제보 상태 변경 (관리자만)
```http
PUT /api/submissions/:id
Authorization: Required (Admin)

{
  "status": "approved"  // pending, approved, rejected
}
```

### 사용자 관리 API (`/api/users`)

#### 내 프로필 조회
```http
GET /api/users/profile
Authorization: Required
```

#### 프로필 수정
```http
PUT /api/users/profile
Authorization: Required

{
  "name": "새로운 이름"
}
```

#### 비밀번호 변경 (로컬 계정만)
```http
PUT /api/users/password
Authorization: Required (Local Account)

{
  "currentPassword": "현재 비밀번호",
  "newPassword": "새 비밀번호"
}
```

#### 계정 삭제
```http
DELETE /api/users/account
Authorization: Required
```

#### 모든 사용자 조회 (관리자만)
```http
GET /api/users/all
Authorization: Required (Admin)
```

#### 사용자 권한 변경 (관리자만)
```http
PUT /api/users/:userId/type
Authorization: Required (Admin)

{
  "userType": "admin"  // user, admin
}
```

---

## 🧪 테스트 및 검증

### 실제 구현된 고급 기능들

#### 1. **자동 시드 데이터 시스템**
```javascript
// src/services/restaurants.service.js
const { ensureSeededOnce } = require('./src/services/restaurants.service');

// server.js에서 서버 시작 시 자동 실행
async function start() {
  try {
    await connectDB(process.env.MONGODB_URI, process.env.DB_NAME);
    await ensureSeededOnce(); // 초기 데이터 자동 주입
    // ...
  }
}
```

#### 2. **Graceful Shutdown 처리**
```javascript
// server.js
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down...');
  await closeDB();
  process.exit(0);
});
```

#### 3. **환경별 동적 CORS 설정**
```javascript
// cors-config.js
const getCorsConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 개발 환경: 로컬 도메인 허용
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  // 프로덕션 환경: 배포 도메인 자동 감지
  if (!isDevelopment) {
    if (process.env.VERCEL_URL) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
    }
    if (process.env.PRODUCTION_CLIENT_URL) {
      allowedOrigins.push(process.env.PRODUCTION_CLIENT_URL);
    }
  }
  
  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };
};
```

#### 4. **MongoDB 연결 최적화**
```javascript
// src/config/db.js
async function connectDB(uri, dbName) {
  await mongoose.connect(uri, {
    dbName: effectiveDbName,
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: 10,                    // 연결 풀 최대 크기
    serverSelectionTimeoutMS: 10000,    // 서버 선택 타임아웃
    family: 4,                          // IPv4 우선 사용
  });
}
```

#### 5. **프록시 환경 대응**
```javascript
// src/app.js
function createApp() {
  const app = express();
  
  // Render/Vercel 환경에서 HTTPS 스킴 신뢰
  app.set('trust proxy', 1);
  
  // 프로덕션 환경에서 프록시 설정
  if (process.env.NODE_ENV === 'production') {
    sessionConfig.proxy = true;
  }
}
```

### 로컬 테스트 방법

#### 1. 서버 헬스 체크
```bash
curl http://localhost:5000/health
```

#### 2. API 테스트 도구 사용

**Postman 사용**:
1. Postman 설치 및 실행
2. Collection 생성
3. 환경변수 설정 (BASE_URL: http://localhost:5000)
4. 요청 순서대로 테스트

**브라우저 테스트**:
1. `test.html` 파일을 브라우저에서 열기
2. 각 기능별 버튼 클릭하여 테스트

#### 3. PowerShell 테스트 예제

**회원가입 테스트**:
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test1234","name":"테스터"}'
```

**로그인 테스트**:
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test1234"}'
```

### 테스트 시나리오

#### 기본 인증 플로우
1. **회원가입** → 자동 로그인 확인
2. **로그인** → 세션 생성 확인
3. **현재 사용자 정보** → 사용자 데이터 반환 확인
4. **로그아웃** → 세션 삭제 확인

#### 맛집 관리 플로우
1. **맛집 목록 조회** → 데이터 반환 확인
2. **특정 맛집 조회** → 상세 정보 반환 확인
3. **인기 맛집 조회** → 정렬된 데이터 확인

#### 제보 관리 플로우
1. **제보 생성** → 제보 데이터 저장 확인
2. **제보 목록 조회** → 상태별 필터링 확인
3. **제보 상태 변경** → 관리자 권한 확인

#### 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test restaurants.routes.test.js
```

#### 테스트 파일 구조
```
tests/
├── restaurants.routes.test.js    # 맛집 API 테스트
└── restaurants.service.test.js   # 맛집 서비스 테스트
```

---

## 🌐 배포 가이드

### Render 배포

#### 1. GitHub 저장소 준비
```bash
# Git 저장소 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub에 푸시
git remote add origin https://github.com/username/pwd-week6-server.git
git push -u origin main
```

#### 2. Render 서비스 생성
1. [Render Dashboard](https://dashboard.render.com/) 접속
2. "New" → "Web Service" 선택
3. GitHub 저장소 연결
4. 서비스 설정:
   - **Name**: `pwd-week6-server`
   - **Root Directory**: `pwd-week6-server` (모노레포인 경우)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### 3. 환경변수 설정
Render 대시보드에서 다음 환경변수들을 설정:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ajou-foodmap
DB_NAME=ajou-foodmap
SESSION_SECRET=your-production-secret-key
CLIENT_URL=https://your-client-app.vercel.app
PORT=10000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-server-app.onrender.com/api/auth/google/callback
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_CALLBACK_URL=https://your-server-app.onrender.com/api/auth/naver/callback
PRODUCTION_CLIENT_URL=https://your-client-app.vercel.app
DEFAULT_CLIENT_URL=https://pwd-week6-client.vercel.app
```

#### 4. 배포 검증
```bash
# 배포된 서버 헬스 체크
curl https://your-app.onrender.com/health
```

정상 응답:
```json
{
  "success": true,
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Vercel 배포 (프론트엔드)

#### 1. Vercel 프로젝트 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel --prod
```

#### 2. 환경변수 설정
Vercel 대시보드에서 다음 환경변수 설정:
```env
VITE_API_URL=https://your-server-app.onrender.com
```

### 배포 후 확인사항

#### 1. CORS 설정 확인
- 클라이언트에서 `withCredentials: true` 설정
- 서버에서 `credentials: true` 설정

#### 2. HTTPS 설정 확인
- 프로덕션에서는 반드시 HTTPS 사용
- 쿠키 설정: `secure: true`, `sameSite: 'none'`

#### 3. OAuth 리다이렉트 URL 업데이트
- Google/네이버 OAuth 콘솔에서 프로덕션 URL로 변경

---

## 🔧 관리자 도구 사용법

### 관리자 계정 생성

#### 자동 생성 스크립트
```bash
npm run create-admin
```

**생성되는 관리자 계정**:
- 이메일: `admin@ajou.ac.kr`
- 비밀번호: `admin123!`
- 권한: `admin`

#### 수동 생성
```bash
node create-admin.js
```

### 사용자 권한 변경

#### 스크립트 사용
```bash
# 사용자를 관리자로 변경
npm run change-user-type user@example.com admin

# 관리자를 일반 사용자로 변경
npm run change-user-type admin@example.com user
```

#### 수동 실행
```bash
node change-user-type.js user@example.com admin
```

### 관리자 기능 사용

#### 모든 사용자 조회
```http
GET /api/users/all
Authorization: Bearer <admin-token>
```

#### 사용자 권한 변경
```http
PUT /api/users/:userId/type
Authorization: Bearer <admin-token>

{
  "userType": "admin"
}
```

#### 제보 승인/거부
```http
PUT /api/submissions/:id
Authorization: Bearer <admin-token>

{
  "status": "approved"  // 또는 "rejected"
}
```


---

## ✅ 개발 체크리스트

### 기본 설정 체크리스트
- [ ] Node.js 18.x 이상 설치 완료
- [ ] MongoDB 설치 및 실행 (로컬 또는 Atlas)
- [ ] `.env` 파일 생성 및 환경변수 설정
- [ ] `npm install` 실행 완료
- [ ] `npm start` 실행 성공
- [ ] `GET /health` 응답 확인

### 인증 시스템 체크리스트
- [ ] 회원가입 API 테스트 완료
- [ ] 로그인 API 테스트 완료
- [ ] 로그아웃 API 테스트 완료
- [ ] 현재 사용자 정보 API 테스트 완료
- [ ] 세션 유지 확인
- [ ] (선택) Google OAuth 테스트 완료
- [ ] (선택) 네이버 OAuth 테스트 완료

### API 기능 체크리스트
- [ ] 맛집 목록 조회 API 테스트
- [ ] 특정 맛집 조회 API 테스트
- [ ] 인기 맛집 조회 API 테스트
- [ ] 제보 생성 API 테스트
- [ ] 제보 목록 조회 API 테스트
- [ ] 프로필 조회/수정 API 테스트
- [ ] 비밀번호 변경 API 테스트 (로컬 계정)

### 관리자 기능 체크리스트
- [ ] 관리자 계정 생성 완료
- [ ] 관리자 권한으로 맛집 생성/수정/삭제 테스트
- [ ] 제보 승인/거부 기능 테스트
- [ ] 사용자 목록 조회 테스트
- [ ] 사용자 권한 변경 테스트

### 보안 체크리스트
- [ ] 비밀번호 해싱 확인
- [ ] 세션 보안 설정 확인
- [ ] CORS 설정 확인
- [ ] 환경변수 보안 확인
- [ ] HTTPS 설정 (프로덕션)

### 배포 체크리스트
- [ ] GitHub 저장소 생성 및 푸시
- [ ] Render 서비스 생성 및 배포
- [ ] 환경변수 설정 완료
- [ ] 배포된 서버 헬스 체크
- [ ] CORS 설정 확인
- [ ] OAuth 콜백 URL 업데이트
- [ ] 프론트엔드 연동 테스트

---

## 📚 추가 학습 자료

### Express.js 관련
- [Express.js 공식 문서](https://expressjs.com/)
- [Express.js 가이드](https://expressjs.com/en/guide/routing.html)
- [Express.js 미들웨어](https://expressjs.com/en/guide/using-middleware.html)

### MongoDB & Mongoose
- [Mongoose 공식 문서](https://mongoosejs.com/)
- [MongoDB Atlas 가이드](https://docs.atlas.mongodb.com/)
- [Mongoose 스키마 가이드](https://mongoosejs.com/docs/guide.html)

### 인증 & 보안
- [Passport.js 공식 문서](http://www.passportjs.org/)
- [bcrypt.js 문서](https://github.com/dcodeIO/bcrypt.js)
- [Express Session 문서](https://github.com/expressjs/session)

### OAuth 설정
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [네이버 로그인 API 가이드](https://developers.naver.com/docs/login/api/)

### 배포 관련
- [Render 문서](https://render.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [MongoDB Atlas 연결 가이드](https://docs.atlas.mongodb.com/connect-to-cluster/)

### 테스트 관련
- [Jest 공식 문서](https://jestjs.io/)
- [Supertest 문서](https://github.com/visionmedia/supertest)
- [API 테스트 가이드](https://jestjs.io/docs/getting-started)

### 추가 프로젝트 아이디어
- 실시간 채팅 기능 추가 (Socket.io)
- 이미지 업로드 기능 (Multer + Cloudinary)
- 이메일 알림 기능 (Nodemailer)
- 캐싱 시스템 (Redis)
- API 문서화 (Swagger)

---

## 🎊 **프로젝트 완성!**

축하합니다! 이제 **Express.js 기반의 완전한 REST API 서버**를 성공적으로 개발했습니다. 

**Happy Coding! 🚀**

---

*Last Updated: 2025.10.13*  
*Created by: Hyunseok Oh - Ajou Digital Media Practical Web Service*