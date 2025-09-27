const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// 2. Register function
const register = async (req, res) => {

  console.log("REGISTER hit with body:", req.body); // <— add this

  const { name, email, password } = req.body;

  try {
    // Create user (password hashing is handled in model)
    const user = await User.create({ name, email, password });

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      user: { name: user.name },
      token,
    });
  } catch (error) {
    res.status(500).json({ msg: "User registration failed", error: error.message });
  }
};

// 3. Login function
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 2. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 3. Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      user: { name: user.name },
      token,
    });
  } catch (error) {
    res.status(500).json({ msg: "Login failed", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Please provide an email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        msg: "If an account with that email exists, password reset instructions have been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 minutes

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    const message = {
      to: email,
      subject: "Reset your Job Tracker password",
      text: `Reset your password using the following link: ${resetUrl}`,
      html: `
        <p>We received a request to reset the password for your Job Tracker account.</p>
        <p>
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">
            Click here to reset your password
          </a>
        </p>
        <p>This link expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      `,
    };

    try {
      await sendEmail(message);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      throw emailError;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `Password reset token for ${email}: ${resetToken} (valid for 10 minutes)`
      );
    }

    const responsePayload = {
      msg: "If an account with that email exists, password reset instructions have been sent.",
    };

    if (process.env.NODE_ENV !== "production") {
      responsePayload.resetToken = resetToken;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Unable to process password reset request", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ msg: "Please provide a token and a new password" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Token is invalid or has expired" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ msg: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Unable to reset password", error: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
