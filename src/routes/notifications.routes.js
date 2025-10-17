// src/routes/notifications.routes.js
const express = require('express');
const notificationsController = require('../controllers/notifications.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

const router = express.Router();

// 모든 라우트는 인증 필요
router.use(isAuthenticated);

// 내 알림 목록 조회
router.get('/', notificationsController.getMyNotifications);

// 모든 알림 읽음 처리
router.put('/read-all', notificationsController.markAllAsRead);

// 알림 읽음 처리
router.put('/:id/read', notificationsController.markAsRead);

// 모든 알림 삭제
router.delete('/all', notificationsController.deleteAllNotifications);

// 알림 삭제
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;

