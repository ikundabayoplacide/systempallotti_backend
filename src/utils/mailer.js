const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: { user: env.smtpUser, pass: env.smtpPass },
});

const sendPasswordResetEmail = async (to, name, token) => {
  const link = `${env.frontendUrl}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Pallotti Presse" <${env.smtpUser}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <p>Hello ${name},</p>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${link}">Reset Password</a>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
