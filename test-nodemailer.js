// test-nodemailer.js
require('dotenv').config();

console.log('📦 Nodemailer 테스트 시작...\n');

// 1. nodemailer import 테스트
try {
  const nodemailer = require('nodemailer');
  console.log('✅ nodemailer import 성공');
  console.log('📋 nodemailer 타입:', typeof nodemailer);
  console.log('📋 nodemailer.createTransport 타입:', typeof nodemailer.createTransport);
  console.log('📋 nodemailer 객체 키:', Object.keys(nodemailer).join(', '));
  
  // 2. Transporter 생성 테스트
  if (typeof nodemailer.createTransport === 'function') {
    console.log('\n✅ createTransport는 함수입니다');
    
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      
      console.log('✅ Transporter 생성 성공');
      console.log('📋 Transporter 타입:', typeof transporter);
      
      // 3. 연결 테스트
      console.log('\n🔍 SMTP 서버 연결 테스트...');
      transporter.verify((error, success) => {
        if (error) {
          console.log('❌ SMTP 연결 실패:', error.message);
        } else {
          console.log('✅ SMTP 서버 준비 완료!');
          console.log('📧 발신 이메일:', process.env.EMAIL_USER);
        }
        process.exit(error ? 1 : 0);
      });
    } catch (error) {
      console.error('❌ Transporter 생성 실패:', error);
      process.exit(1);
    }
  } else {
    console.error('❌ createTransport가 함수가 아닙니다!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ nodemailer import 실패:', error);
  process.exit(1);
}

