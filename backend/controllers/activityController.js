const Activity = require("../models/activity");


exports.logActivity = async (userId, type, relatedId, groupId, message) => {
  try {
    await Activity.create({
      user: userId,
      type,
      relatedId,
      group: groupId || null,
      message
    });
  } catch (error) {
    console.error("Error logging activity:", error.message);
  }
};


exports.getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .populate("user", "name")
      .populate("group", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching activities" });
  }
};
