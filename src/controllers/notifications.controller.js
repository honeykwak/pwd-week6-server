// src/controllers/notifications.controller.js
const notificationsService = require('../services/notifications.service');
const asyncHandler = require('../utils/asyncHandler');

class NotificationsController {
  /**
   * 내 알림 목록 조회
   * GET /api/notifications
   */
  getMyNotifications = asyncHandler(async (req, res) => {
    const { limit = 20, skip = 0, unreadOnly = 'false' } = req.query;

    const result = await notificationsService.getUserNotifications(
      req.user._id,
      {
        limit: parseInt(limit),
        skip: parseInt(skip),
        unreadOnly: unreadOnly === 'true',
      }
    );

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * 알림 읽음 처리
   * PUT /api/notifications/:id/read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await notificationsService.markAsRead(id, req.user._id);

    res.json({
      success: true,
      message: '알림을 읽음 처리했습니다.',
      data: { notification },
    });
  });

  /**
   * 모든 알림 읽음 처리
   * PUT /api/notifications/read-all
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationsService.markAllAsRead(req.user._id);

    res.json({
      success: true,
      message: '모든 알림을 읽음 처리했습니다.',
      data: { modifiedCount: result.modifiedCount },
    });
  });

  /**
   * 알림 삭제
   * DELETE /api/notifications/:id
   */
  deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await notificationsService.deleteNotification(id, req.user._id);

    res.json({
      success: true,
      message: '알림이 삭제되었습니다.',
    });
  });

  /**
   * 모든 알림 삭제
   * DELETE /api/notifications
   */
  deleteAllNotifications = asyncHandler(async (req, res) => {
    const result = await notificationsService.deleteAllNotifications(req.user._id);

    res.json({
      success: true,
      message: '모든 알림이 삭제되었습니다.',
      data: { deletedCount: result.deletedCount },
    });
  });
}

module.exports = new NotificationsController();

