const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

module.exports = {
  register,
  login,
};