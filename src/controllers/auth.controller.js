// src/controllers/auth.controller.js
const passport = require('passport');
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  /**
   * 회원가입
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    // 이미 로그인되어 있는 경우 현재 사용자 정보 반환
    if (req.isAuthenticated()) {
      return res.json({
        success: true,
        message: '이미 로그인되어 있습니다.',
        data: { user: req.user },
      });
    }

    const { email, password, name } = req.body;

    // 유효성 검사
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '이메일, 비밀번호, 이름은 필수입니다.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다.',
      });
    }

    const user = await authService.register({ email, password, name });

    // 이메일 인증 기능 (이메일 설정이 되어 있을 때만 실행)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        // 인증 토큰 생성 및 저장
        const verificationToken = emailService.generateVerificationToken();
        
        // findByIdAndUpdate를 사용하여 비밀번호 해싱 미들웨어 우회
        await User.findByIdAndUpdate(user._id, {
          verificationToken: verificationToken,
          verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        // 업데이트된 user 객체에 토큰 정보 추가
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // 인증 이메일 발송
        await emailService.sendVerificationEmail(user, verificationToken);
        console.log('✅ 인증 이메일 발송 성공');
      } catch (error) {
        console.error('⚠️ 인증 이메일 발송 실패:', error.message);
        // 이메일 발송 실패해도 회원가입은 완료
      }
    } else {
      console.log('ℹ️  이메일 인증 비활성화 (EMAIL_USER 또는 EMAIL_PASSWORD가 설정되지 않음)');
    }

    // 회원가입 후 자동 로그인
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '회원가입 후 로그인 중 오류가 발생했습니다.',
        });
      }

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.',
        data: { user },
      });
    });
  });

  /**
   * 로컬 로그인
   * POST /api/auth/login
   */
  login = (req, res, next) => {
    // 이미 로그인되어 있는 경우 현재 사용자 정보 반환
    if (req.isAuthenticated()) {
      return res.json({
        success: true,
        message: '이미 로그인되어 있습니다.',
        data: { user: req.user },
      });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '로그인 중 오류가 발생했습니다.',
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || '로그인에 실패했습니다.',
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: '로그인 중 오류가 발생했습니다.',
          });
        }

        return res.json({
          success: true,
          message: '로그인되었습니다.',
          data: { user },
        });
      });
    })(req, res, next);
  };

  /**
   * 로그아웃
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '로그아웃 중 오류가 발생했습니다.',
        });
      }

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: '세션 삭제 중 오류가 발생했습니다.',
          });
        }

        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: '로그아웃되었습니다.',
        });
      });
    });
  });

  /**
   * 현재 사용자 정보 조회
   * GET /api/auth/me
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    const user = await authService.getCurrentUser(req.user._id);

    res.json({
      success: true,
      data: { user },
    });
  });

  /**
   * 구글 OAuth 콜백
   * GET /api/auth/google/callback
   */
  googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=server_error`);
      }

      if (!user) {
        return res.redirect(
          `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=${encodeURIComponent(
            info.message || '로그인 실패'
          )}`
        );
      }

      req.login(user, (err) => {
        if (err) {
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=login_error`);
        }

        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`);
      });
    })(req, res, next);
  };

  /**
   * 네이버 OAuth 콜백
   * GET /api/auth/naver/callback
   */
  naverCallback = (req, res, next) => {
    passport.authenticate('naver', (err, user, info) => {
      console.log('[Naver Callback] Error:', err);
      console.log('[Naver Callback] User:', user);
      console.log('[Naver Callback] Info:', info);
      
      if (err) {
        console.error('[Naver Callback] Authentication error:', err);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=server_error`);
      }

      if (!user) {
        console.error('[Naver Callback] No user found:', info);
        return res.redirect(
          `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=${encodeURIComponent(
            info.message || '로그인 실패'
          )}`
        );
      }

      req.login(user, (err) => {
        if (err) {
          console.error('[Naver Callback] Login error:', err);
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=login_error`);
        }

        console.log('[Naver Callback] Successfully logged in user:', user._id);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`);
      });
    })(req, res, next);
  };

  /**
   * 이메일 인증
   * GET /api/auth/verify-email/:token
   */
  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않거나 만료된 인증 링크입니다.',
      });
    }

    // 이메일 인증 완료
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // 환영 이메일 발송 (선택사항)
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('환영 이메일 발송 실패:', error);
    }

    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다!',
      data: { user },
    });
  });

  /**
   * 인증 이메일 재전송
   * POST /api/auth/resend-verification
   */
  resendVerification = asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: '이미 이메일 인증이 완료되었습니다.',
      });
    }

    // OAuth 사용자는 이메일 인증 불필요
    if (user.provider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'OAuth 로그인 사용자는 이메일 인증이 필요하지 않습니다.',
      });
    }

    // 새 인증 토큰 생성
    const verificationToken = emailService.generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // 인증 이메일 재발송
    await emailService.sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: '인증 이메일이 재전송되었습니다. 이메일을 확인해주세요.',
    });
  });

}

module.exports = new AuthController();

