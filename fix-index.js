// fix-index.js - MongoDB 인덱스 수정 스크립트
require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    console.log('🔄 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log('✅ MongoDB 연결 성공');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('\n📋 현재 인덱스 목록:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // 문제가 되는 인덱스 삭제
    try {
      console.log('\n🗑️  provider_1_providerId_1 인덱스 삭제 중...');
      await collection.dropIndex('provider_1_providerId_1');
      console.log('✅ 인덱스 삭제 완료');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  인덱스가 이미 존재하지 않습니다.');
      } else {
        throw error;
      }
    }

    console.log('\n✅ 인덱스 수정 완료!');
    console.log('💡 이제 서버를 재시작하면 새로운 인덱스가 자동으로 생성됩니다.');

    await mongoose.connection.close();
    console.log('\n✅ MongoDB 연결 종료');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

fixIndex();

