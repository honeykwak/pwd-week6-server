// src/config/socket.config.js
const { Server } = require('socket.io');
const session = require('express-session');
const passport = require('passport');

/**
 * Socket.io 서버 초기화
 */
function initializeSocket(server, sessionMiddleware) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket.io에서 Express 세션 사용
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  // Socket.io에서 Passport 인증 사용
  io.use((socket, next) => {
    passport.initialize()(socket.request, {}, () => {
      passport.session()(socket.request, {}, () => {
        if (socket.request.user) {
          next();
        } else {
          next(new Error('인증되지 않은 사용자입니다.'));
        }
      });
    });
  });

  // 연결된 사용자 관리
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.request.user._id.toString();
    
    console.log(`✅ Socket 연결: ${socket.request.user.email} (${userId})`);

    // 사용자 등록
    connectedUsers.set(userId, socket.id);

    // 연결 해제
    socket.on('disconnect', () => {
      console.log(`❌ Socket 연결 해제: ${socket.request.user.email}`);
      connectedUsers.delete(userId);
    });

    // 클라이언트에게 연결 성공 알림
    socket.emit('connected', {
      message: '실시간 알림이 활성화되었습니다.',
      userId,
    });
  });

  // 특정 사용자에게 알림 전송
  io.sendNotificationToUser = (userId, notification) => {
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('notification', notification);
      console.log(`📬 알림 전송: ${userId}`);
      return true;
    }
    console.log(`📭 사용자 오프라인: ${userId}`);
    return false;
  };

  // 모든 관리자에게 알림 전송
  io.sendNotificationToAdmins = (notification) => {
    // 이 기능은 나중에 관리자 목록을 관리하여 구현
    io.emit('admin-notification', notification);
  };

  return io;
}

module.exports = { initializeSocket };

