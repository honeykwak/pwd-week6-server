// src/config/email.config.js
const nodemailer = require('nodemailer');

// 이메일 전송 설정
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || '';
  
  // Gmail 사용 시
  if (emailUser.includes('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 5000, // 5초 연결 타임아웃
      greetingTimeout: 5000, // 5초 인사 타임아웃
    });
  }
  
  // 아주대 이메일 사용 시 (또는 다른 도메인)
  if (emailUser.includes('@ajou.ac.kr')) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com', // 아주대도 Gmail 기반이면 Gmail SMTP 사용
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 5000, // 5초 연결 타임아웃
      greetingTimeout: 5000, // 5초 인사 타임아웃
    });
  }
  
  // 기본값 (Gmail)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 5000, // 5초 연결 타임아웃
    greetingTimeout: 5000, // 5초 인사 타임아웃
  });
};

// 인증 이메일 템플릿
const getVerificationEmailTemplate = (name, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
        }
        h1 {
          color: #667eea;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h1>🎉 Ajou Campus Foodmap에 오신 것을 환영합니다!</h1>
          <p>안녕하세요, <strong>${name}</strong>님!</p>
          <p>회원가입을 완료하려면 아래 버튼을 클릭하여 이메일을 인증해주세요.</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">이메일 인증하기</a>
          </p>
          <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>
          <div class="footer">
            <p>이 링크는 24시간 동안 유효합니다.</p>
            <p>본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.</p>
            <p>© 2025 Ajou Campus Foodmap. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 인증 완료 알림 이메일 템플릿
const getWelcomeEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          border-radius: 10px;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
        }
        h1 {
          color: #667eea;
          margin-top: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h1>✅ 이메일 인증 완료!</h1>
          <p>안녕하세요, <strong>${name}</strong>님!</p>
          <p>이메일 인증이 성공적으로 완료되었습니다. 🎉</p>
          <p>이제 Ajou Campus Foodmap의 모든 기능을 사용하실 수 있습니다:</p>
          <ul>
            <li>맛집 제보하기</li>
            <li>맛집 리뷰 작성하기</li>
            <li>좋아요 누르기</li>
            <li>실시간 알림 받기</li>
          </ul>
          <p>맛있는 맛집 탐험을 시작해보세요! 🍽️</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  createTransporter,
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
};

