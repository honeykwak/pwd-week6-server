// check-user-token.js - 사용자 토큰 확인
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');

async function checkToken() {
  try {
    console.log('🔄 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log('✅ MongoDB 연결 성공\n');

    // 최근 생성된 사용자 조회
    const users = await User.find({ provider: 'local' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email name verificationToken verificationTokenExpires emailVerified createdAt');

    console.log('📋 최근 로컬 계정 사용자 (최대 5명):\n');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
      console.log(`   생성 시간: ${user.createdAt}`);
      console.log(`   이메일 인증: ${user.emailVerified ? '✅ 완료' : '❌ 미완료'}`);
      console.log(`   토큰 있음: ${user.verificationToken ? '✅ 있음' : '❌ 없음'}`);
      if (user.verificationToken) {
        console.log(`   토큰 앞 10자: ${user.verificationToken.substring(0, 10)}...`);
        console.log(`   토큰 만료: ${user.verificationTokenExpires}`);
        
        // 만료 여부 확인
        const now = new Date();
        if (user.verificationTokenExpires && user.verificationTokenExpires > now) {
          const hoursLeft = Math.floor((user.verificationTokenExpires - now) / (1000 * 60 * 60));
          console.log(`   ⏰ 만료까지: ${hoursLeft}시간 남음`);
        } else {
          console.log(`   ⚠️ 토큰 만료됨`);
        }
      }
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ MongoDB 연결 종료');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

checkToken();

