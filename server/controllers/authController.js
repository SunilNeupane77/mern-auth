import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodeMailer.js";
import userModel from "../models/userModel.js";
// controller for register

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
      maxAge: 7200000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Sunil Neupane",
      text: `Welcome to Sunil Neupane. We are glad to have you on board. ${email}`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({ message: "Registration success", success: true });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

// controller for login

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" && "none",
      maxAge: 7200000,
    });

    return res.json({ message: "Login success", success: true });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

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

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your email",
      text: `Your otp is ${otp}`,
    };
    await transporter.sendMail(mailOption);
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};
// auth for verify email

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid otp", success: false });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "Otp expired", success: false });
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

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ message: "User logged in", success: true });
  } catch (error) {
    return res.json({ message: "User not logged in", success: false });
  }
};
// send password reset otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required", success: false });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset your OTP",
      text: `Your otp is ${otp}`,
    };
    await transporter.sendMail(mailOption);
    return res.json({ message: "Otp sent", success: true });
  } catch (error) {
    return res.json({ message: error.message, success: false });
  }
};

// reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid otp", success: false });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "Otp expired", success: false });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = ""; 
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({ message: "Password reset success", success: true });
  } catch (error) {
    return res.json({ message: error.message, success: false });
  }
};
