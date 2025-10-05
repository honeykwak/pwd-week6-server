// CORS 설정 - 로컬 개발 및 배포 환경 대응
const getCorsConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 허용할 클라이언트 URL들
  const allowedOrigins = [
    'http://localhost:5173',    // 로컬 Vite 개발 서버
    'http://localhost:3000',    // 로컬 React 개발 서버 (백업)
    'http://127.0.0.1:5173',    // 로컬 Vite (IP 주소)
  ];

  // 환경변수에서 추가 URL들 가져오기
  if (process.env.CLIENT_URL) {
    const clientUrls = process.env.CLIENT_URL.split(',');
    allowedOrigins.push(...clientUrls);
  }

  // 프로덕션 환경에서 Vercel URL 패턴 허용
  if (!isDevelopment) {
    // Vercel 배포 URL 패턴 허용 (실제 도메인으로 교체 필요)
    if (process.env.VERCEL_URL) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
    }
    // 커스텀 도메인이 있는 경우
    if (process.env.PRODUCTION_CLIENT_URL) {
      allowedOrigins.push(process.env.PRODUCTION_CLIENT_URL);
    }
  }

  return {
    origin: (origin, callback) => {
      // Origin 헤더가 없는 요청(Postman, 서버간 통신, 헬스체크 등)은 항상 허용
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        console.log('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200, // IE11 지원
  };
};

module.exports = getCorsConfig;
