// src/config/passport.config.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

// 세션에 사용자 ID 저장
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// 세션에서 사용자 ID로 사용자 객체 조회
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ==================== 로컬 전략 (이메일/비밀번호) ====================
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // 사용자 찾기
        const user = await User.findOne({ email: email.toLowerCase(), provider: 'local' });
        
        if (!user) {
          return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
          return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 계정 활성화 확인
        if (!user.isActive) {
          return done(null, false, { message: '비활성화된 계정입니다.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ==================== 구글 OAuth 전략 ====================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('[OAuth][Google] callback start', {
            id: profile && profile.id,
            email: Array.isArray(profile.emails) && profile.emails[0] && profile.emails[0].value,
          });
          // 기존 사용자 찾기
          let user = await User.findOne({
            provider: 'google',
            providerId: profile.id,
          });

          if (user) {
            // 기존 사용자 로그인
            console.log('[OAuth][Google] existing user', user._id);
            return done(null, user);
          }

          // 새 사용자 생성
          user = await User.create({
            provider: 'google',
            providerId: profile.id,
            email: profile.emails[0].value.toLowerCase(),
            name: profile.displayName,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          });

          console.log('[OAuth][Google] created user', user._id);
          return done(null, user);
        } catch (error) {
          console.error('[OAuth][Google] error', error);
          return done(error, null);
        }
      }
    )
  );
}


module.exports = passport;

