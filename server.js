require('dotenv').config();
const http = require('http');
const { connectDB, closeDB } = require('./src/config/db');
const createApp = require('./src/app');
const { ensureSeededOnce } = require('./src/services/restaurants.service');
const { initializeSocket } = require('./src/config/socket.config');

const PORT = process.env.PORT || 3000;

const { app, sessionMiddleware } = createApp();
const server = http.createServer(app);

// Socket.io 초기화
const io = initializeSocket(server, sessionMiddleware);

// app과 io를 전역적으로 사용 가능하도록 설정
app.set('io', io);

async function start() {
  try {
    console.log('🚀 Starting server...');
    console.log(`📊 Connecting to MongoDB...`);
    await connectDB(process.env.MONGODB_URI, process.env.DB_NAME);
    console.log('✅ MongoDB connected');
    
    console.log('🌱 Seeding initial data...');
    const seedResult = await ensureSeededOnce();
    console.log('✅ Seed complete:', seedResult);
    
    if (require.main === module) {
      server.listen(PORT, () => {
        console.log(`✅ Server listening on port ${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`📚 API ready: http://localhost:${PORT}/api`);
        console.log(`🔔 Socket.io ready for real-time notifications`);
      });
    }
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

// graceful shutdown
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

module.exports = app;
