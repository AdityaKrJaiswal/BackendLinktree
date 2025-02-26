const express = require("express");
const Referral = require("../Models/Referral");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id }).populate("referredUser", "username email");
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching referrals", error: err.message });
  }
});

module.exports = router;
