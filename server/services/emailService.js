const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: `"NITM Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your NITM Hub Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to NITM Hub, ${firstName}!</h2>
          
          <p>Thank you for joining NITM Hub, the exclusive platform for NIT Meghalaya students.</p>
          
          <p>To complete your registration and start connecting with fellow students, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          
          <p style="color: #ef4444; font-size: 14px;">⚠️ This link will expire in 24 hours.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6b7280;">
            If you didn't create an account with NITM Hub, please ignore this email.
            <br><br>
            Best regards,<br>
            The NITM Hub Team
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"NITM Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your NITM Hub Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          
          <p>Hello ${firstName},</p>
          
          <p>We received a request to reset your NITM Hub password. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
          
          <p style="color: #ef4444; font-size: 14px;">⚠️ This link will expire in 10 minutes for security reasons.</p>
          
          <p style="color: #f59e0b; font-size: 14px;">
            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6b7280;">
            For security reasons, this reset link is only valid for 10 minutes.
            <br><br>
            Best regards,<br>
            The NITM Hub Team
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"NITM Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to NITM Hub! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Welcome to NITM Hub, ${firstName}!</h2>
          
          <p>Congratulations! Your account has been successfully verified and you're now part of the NITM Hub community.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #065f46;">
              <li>Create and customize your profile</li>
              <li>Connect with fellow NITM students</li>
              <li>Join clubs and discover events</li>
              <li>Stay updated with college notices</li>
              <li>Find your perfect match ❤️</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete Your Profile
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            Need help getting started? Check out our community guidelines or contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6b7280;">
            Happy connecting!<br>
            The NITM Hub Team
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failures
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};