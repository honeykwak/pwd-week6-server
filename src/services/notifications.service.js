// src/services/notifications.service.js
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

class NotificationsService {
  /**
   * 알림 생성 및 실시간 전송
   */
  async createNotification(io, notificationData) {
    const { recipient, type, title, message, data, link } = notificationData;

    // 알림 저장
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
      link,
    });

    // 실시간으로 전송 (사용자가 온라인인 경우)
    if (io && io.sendNotificationToUser) {
      io.sendNotificationToUser(recipient, {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        link: notification.link,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  }

  /**
   * 사용자의 알림 목록 조회
   */
  async getUserNotifications(userId, options = {}) {
    const { limit = 20, skip = 0, unreadOnly = false } = options;

    const query = { recipient: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new Error('알림을 찾을 수 없습니다.');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return result;
  }

  /**
   * 알림 삭제
   */
  async deleteNotification(notificationId, userId) {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId,
    });

    if (result.deletedCount === 0) {
      throw new Error('알림을 찾을 수 없습니다.');
    }

    return result;
  }

  /**
   * 모든 알림 삭제
   */
  async deleteAllNotifications(userId) {
    const result = await Notification.deleteMany({ recipient: userId });
    return result;
  }

  /**
   * 제보 승인 알림 생성
   */
  async notifySubmissionApproved(io, submissionData) {
    const { userId, restaurantName, restaurantId } = submissionData;

    return this.createNotification(io, {
      recipient: userId,
      type: 'submission_approved',
      title: '🎉 맛집 제보가 승인되었습니다!',
      message: `'${restaurantName}' 제보가 승인되어 맛집 목록에 추가되었습니다.`,
      data: {
        restaurantId,
        restaurantName,
      },
      link: `/restaurant/${restaurantId}`,
    });
  }

  /**
   * 제보 거부 알림 생성
   */
  async notifySubmissionRejected(io, submissionData) {
    const { userId, restaurantName, submissionId, rejectionReason } = submissionData;

    return this.createNotification(io, {
      recipient: userId,
      type: 'submission_rejected',
      title: '❌ 맛집 제보가 거부되었습니다',
      message: `'${restaurantName}' 제보가 거부되었습니다.${rejectionReason ? ` 사유: ${rejectionReason}` : ''}`,
      data: {
        submissionId,
        restaurantName,
        rejectionReason,
      },
      link: '/dashboard',
    });
  }

  /**
   * 새로운 제보 알림 (관리자들에게)
   */
  async notifyNewSubmission(io, submissionData) {
    const { restaurantName, submissionId } = submissionData;

    // 모든 관리자 찾기
    const admins = await User.find({ userType: 'admin', isActive: true });

    // 각 관리자에게 알림 생성
    const notifications = await Promise.all(
      admins.map(admin =>
        this.createNotification(io, {
          recipient: admin._id,
          type: 'new_submission',
          title: '📝 새로운 맛집 제보',
          message: `'${restaurantName}' 제보가 등록되었습니다. 검토가 필요합니다.`,
          data: {
            submissionId,
            restaurantName,
          },
          link: '/submissions',
        })
      )
    );

    return notifications;
  }
}

module.exports = new NotificationsService();

