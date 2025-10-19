// src/services/email.service.js
const crypto = require('crypto');
const {
  createTransporter,
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
} = require('../config/email.config');

class EmailService {
  /**
   * 인증 토큰 생성
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 인증 이메일 발송
   */
  async sendVerificationEmail(user, verificationToken) {
    try {
      const transporter = createTransporter();
      
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verificationUrl = `${clientUrl}/#/verify-email/${verificationToken}`;

      const mailOptions = {
        from: `"Ajou Campus Foodmap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '이메일 인증을 완료해주세요 - Ajou Campus Foodmap',
        html: getVerificationEmailTemplate(user.name, verificationUrl),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ 인증 이메일 발송 성공:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ 인증 이메일 발송 실패:', error);
      // 이메일 발송 실패는 회원가입을 실패시키지 않음 (Render 등에서 SMTP가 차단될 수 있음)
      return false;
    }
  }

  /**
   * 환영 이메일 발송 (인증 완료 후)
   */
  async sendWelcomeEmail(user) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Ajou Campus Foodmap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '환영합니다! - Ajou Campus Foodmap',
        html: getWelcomeEmailTemplate(user.name),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ 환영 이메일 발송 성공:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ 환영 이메일 발송 실패:', error);
      // 환영 이메일 실패는 critical하지 않으므로 에러를 throw하지 않음
      return false;
    }
  }

  /**
   * 알림 이메일 발송 (제보 승인/거부 등)
   */
  async sendNotificationEmail(user, subject, htmlContent) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Ajou Campus Foodmap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ 알림 이메일 발송 성공:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ 알림 이메일 발송 실패:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

