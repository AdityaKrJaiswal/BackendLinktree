const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const sendEmail = require("../utils/mailer");
const crypto = require("crypto");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already in use" });

    const newUser = new User({
      username,
      email,
      password,
      referralCode: username + Math.floor(Math.random() * 10000)
    });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        newUser.referredBy = referrer._id;
        await new Referral({ referrer: referrer._id, referredUser: newUser._id }).save();
      }
    }

    await newUser.save();
    res.status(201).json({ message: "User registered", referralCode: newUser.referralCode });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

module.exports = router;
