import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodeMailer.js";
import userModel from "../models/userModel.js";

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

// Helper function to set cookie
const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" && "none",
    maxAge: 7200000,
  });
};

// Helper function to send email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};

// controller for register
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required", success: false });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user._id);
    setCookie(res, token);

    await sendEmail(email, "Welcome To Sunil Neupane", `Welcome to Sunil Neupane. We are glad to have you on board. ${email}`);
    return res.json({ message: "Registration success", success: true });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

// controller for login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required", success: false });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    return res.json({ message: "Login success", success: true });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

// controller for logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
    });

    return res.json({ message: "Logged out", success: true });
  } catch (error) {
    return res.json({ message: error.message, success: false });
  }
};

// controller for send verify otp
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ message: "User is already verified", success: false });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, "Verify your email", `Your otp is ${otp}`);
    return res.json({ message: "Otp sent", success: true });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

// controller for verify email
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ message: "All fields are required", success: false });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user || user.verifyOtp !== otp || user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired otp", success: false });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({ message: "Email verified", success: true });
  } catch (error) {
    return res.json({ message: error.message, success: false });
  }
};

// controller for isAuthenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ message: "User logged in", success: true });
  } catch (error) {
    return res.json({ message: "User not logged in", success: false });
  }
};

// controller for send password reset otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required", success: false });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, "Reset your OTP", `Your otp is ${otp}`);
    return res.json({ message: "Otp sent", success: true });
  } catch (error) {
    return res.json({ message: error.message, success: false });
  }
};

// controller for reset password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required", success: false });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user || user.resetOtp !== otp || user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired otp", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({ message: "Password reset success", success: true });
  } catch (error) {
    return res.json({ message: error.message, success: false });
  }
};
