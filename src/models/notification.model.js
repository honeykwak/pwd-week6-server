// src/models/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // 알림 받을 사용자
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // 알림 유형
  type: {
    type: String,
    enum: [
      'submission_approved',  // 제보 승인
      'submission_rejected',  // 제보 거부
      'new_submission',       // 새로운 제보 (관리자용)
      'popular_restaurant',   // 인기 맛집 등극
    ],
    required: true,
  },

  // 알림 제목
  title: {
    type: String,
    required: true,
  },

  // 알림 메시지
  message: {
    type: String,
    required: true,
  },

  // 관련 데이터
  data: {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    restaurantName: String,
  },

  // 읽음 여부
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },

  // 링크 (클릭 시 이동할 경로)
  link: {
    type: String,
  },
}, {
  timestamps: true,
});

// 인덱스 설정 (빠른 조회를 위해)
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

