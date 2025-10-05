// src/routes/users.routes.js
const express = require('express');
const usersController = require('../controllers/users.controller');
const { isAuthenticated, isLocalAccount } = require('../middleware/auth.middleware');

const router = express.Router();

// 내 프로필 조회
router.get('/profile', isAuthenticated, usersController.getProfile);

// 내 프로필 수정
router.put('/profile', isAuthenticated, usersController.updateProfile);

// 비밀번호 변경 (로컬 계정만)
router.put('/password', isLocalAccount, usersController.changePassword);

// 계정 삭제
router.delete('/account', isAuthenticated, usersController.deleteAccount);

module.exports = router;

