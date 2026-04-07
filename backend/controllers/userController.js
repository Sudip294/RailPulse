const User = require('../models/User');
const Report = require('../models/Report');
const ChatMessage = require('../models/ChatMessage');

exports.getProfile = async (req, res) => {
  try {
    const targetId = req.params.id || req.userId;
    const user = await User.findById(targetId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Aggregate statistics from the Report model for the specific user
    const verifiedCount = await Report.countDocuments({ verifiedBy: targetId });
    const fakedCount = await Report.countDocuments({ fakedBy: targetId });

    res.status(200).json({ 
      user, 
      stats: { verifiedCount, fakedCount } 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImg } = req.body;
    
    // Server-side Base64 size validation (roughly 2MB)
    if (profileImg && profileImg.length > 2.5 * 1024 * 1024) { 
        return res.status(400).json({ message: "Image size must be less than 2MB" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, profileImg },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { confirmationEmail } = req.body;
    const user = await User.findById(req.userId);

    // Strict confirmation check
    if (confirmationEmail !== `${user.email} delete`) {
      return res.status(400).json({ message: "Confirmation text does not match" });
    }

    // Performance Cleanup: Delete all reports by this user
    await Report.deleteMany({ userId: req.userId });

    // Privacy Cleanup: Delete all chat messages by this user
    await ChatMessage.deleteMany({ userId: req.userId });
    
    // Optionally: Remove user from verifiedBy/fakedBy arrays in other reports
    await Report.updateMany(
      {},
      { $pull: { verifiedBy: req.userId, fakedBy: req.userId } }
    );

    // Final step: Delete the user account
    await User.findByIdAndDelete(req.userId);

    res.status(200).json({ message: "Account and associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account" });
  }
};
