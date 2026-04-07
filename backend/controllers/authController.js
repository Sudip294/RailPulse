const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: { id: newUser._id, name, email, profileImg: "", bio: "" }, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ user: { id: user._id, name: user.name, email, profileImg: user.profileImg, bio: user.bio }, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await resend.emails.send({
      from: 'RailPulse <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your Password - RailPulse',
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <table align="center" width="100%" max-width="600px" style="background: #ffffff; border-radius: 10px; padding: 30px;">
      <tr>
        <td style="text-align: center;">
          <h2 style="color: #2c3e50; margin-bottom: 10px;">RailPulse</h2>
          <p style="color: #7f8c8d; font-size: 14px;">Password Reset Request</p>
        </td>
      </tr>

      <tr>
        <td style="padding: 20px 0; text-align: center;">
          <p style="font-size: 16px; color: #333;">
            We received a request to reset your password.
          </p>
          <p style="font-size: 16px; color: #333;">
            Use the OTP below to proceed:
          </p>

          <div style="margin: 25px 0;">
            <span style="
              display: inline-block;
              font-size: 28px;
              letter-spacing: 5px;
              font-weight: bold;
              color: #ffffff;
              background: #3498db;
              padding: 12px 25px;
              border-radius: 8px;
            ">
              ${otp}
            </span>
          </div>

          <p style="color: #e74c3c; font-size: 14px;">
            This OTP is valid for 1 hour.
          </p>
        </td>
      </tr>

      <tr>
        <td style="border-top: 1px solid #ecf0f1; padding-top: 20px; text-align: center;">
          <p style="font-size: 13px; color: #95a5a6;">
            If you did not request this, please ignore this email.
          </p>
          <p style="font-size: 12px; color: #bdc3c7;">
            © ${new Date().getFullYear()} RailPulse. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </div>
  `
    });

    res.status(200).json({ message: "OTP sent to email successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error generating OTP" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetPasswordOTP || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    const isValidOTP = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!isValidOTP) return res.status(400).json({ message: "Incorrect OTP" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };
