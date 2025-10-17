const submissionsService = require('../services/submissions.service');
const notificationsService = require('../services/notifications.service');
const asyncHandler = require('../utils/asyncHandler');

const normaliseMenu = (menu) => {
  if (!menu) return [];
  if (Array.isArray(menu)) return menu;
  if (typeof menu === 'string') {
    return menu.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

exports.list = asyncHandler(async (req, res) => {
  const items = await submissionsService.listSubmissions(req.query.status);
  res.json({ data: items });
});

exports.get = asyncHandler(async (req, res) => {
  const item = await submissionsService.getSubmissionById(req.params.id);
  if (!item) return res.status(404).json({ error: { message: 'Submission not found' } });
  res.json({ data: item });
});

exports.create = asyncHandler(async (req, res) => {
  const payload = {
    restaurantName: req.body.restaurantName,
    category: req.body.category,
    location: req.body.location,
    priceRange: req.body.priceRange ?? '',
    recommendedMenu: normaliseMenu(req.body.recommendedMenu),
    review: req.body.review ?? '',
    submitterName: req.body.submitterName ?? '',
    submitterEmail: req.body.submitterEmail ?? '',
    status: 'pending',
    submittedBy: req.user?._id, // 로그인한 사용자 ID
  };

  const required = ['restaurantName', 'category', 'location'];
  const missing = required.find((k) => !payload[k]);
  if (missing) {
    res.status(400).json({ error: { message: `'${missing}' is required` } });
    return;
  }

  const created = await submissionsService.createSubmission(payload);

  // 관리자들에게 새로운 제보 알림 전송
  const io = req.app.get('io');
  if (io) {
    await notificationsService.notifyNewSubmission(io, {
      restaurantName: created.restaurantName,
      submissionId: created.id,
    });
  }

  res.status(201).json({ data: created });
});

exports.update = asyncHandler(async (req, res) => {
  const prevSubmission = await submissionsService.getSubmissionById(req.params.id);
  if (!prevSubmission) {
    return res.status(404).json({ error: { message: 'Submission not found' } });
  }

  const payload = {
    restaurantName: req.body.restaurantName,
    category: req.body.category,
    location: req.body.location,
    priceRange: req.body.priceRange,
    recommendedMenu: Array.isArray(req.body.recommendedMenu) ? req.body.recommendedMenu : undefined,
    review: req.body.review,
    submitterName: req.body.submitterName,
    submitterEmail: req.body.submitterEmail,
    status: req.body.status,
    rejectionReason: req.body.rejectionReason,
  };

  const updated = await submissionsService.updateSubmission(req.params.id, payload);
  if (!updated) {
    return res.status(404).json({ error: { message: 'Submission not found' } });
  }

  // 상태가 변경된 경우 알림 전송
  const io = req.app.get('io');
  if (io && updated.submittedBy && prevSubmission.status !== updated.status) {
    if (updated.status === 'approved') {
      // 승인 알림
      await notificationsService.notifySubmissionApproved(io, {
        userId: updated.submittedBy,
        restaurantName: updated.restaurantName,
        restaurantId: null, // 실제 레스토랑 ID가 생성되면 추가
      });
    } else if (updated.status === 'rejected') {
      // 거부 알림
      await notificationsService.notifySubmissionRejected(io, {
        userId: updated.submittedBy,
        restaurantName: updated.restaurantName,
        submissionId: updated.id,
        rejectionReason: updated.rejectionReason,
      });
    }
  }

  res.json({ data: updated });
});

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await submissionsService.deleteSubmission(req.params.id);
  if (!deleted) return res.status(404).json({ error: { message: 'Submission not found' } });
  res.status(204).send();
});


