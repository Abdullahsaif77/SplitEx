const Group = require("../models/group");
const ActivityController = require("../controllers/activityController");
const Users = require("../models/users");
const inviteToken = require("../utils/inviteTokenGenerate");
const Invite = require("../models/invites");
const sendEmail = require("../utils/emailGenerator");

const groupCreated = async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Fill all the inputs" });
    }

    const existedName = await Group.findOne({ name });
    if (existedName) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    const allMembers = [
      {
        userId: req.user.id,
        name: req.user.name,
        role: "admin",
      },
    ];


    const pendingInvites = [];
    if (Array.isArray(members) && members.length > 0) {
      for (const m of members) {
        const existUser = await Users.findOne({ email: m.email });

        if (existUser) {
          allMembers.push({
            userId: existUser._id,
            name: existUser.name,
            role: "member",
          });
        } else {
          pendingInvites.push(m.email);
        }
      }
    }

    
    const group = new Group({
      name,
      currency: "PKR",
      createdBy: req.user.id,
      members: allMembers,
    });
    await group.save();


    const inviteResults = [];

    for (const email of pendingInvites) {
      try {
        const { token, expiresAt } = inviteToken(48);
        const invite = new Invite({
          email,
          groupId: group._id,
          token,
          expiresAt,
          invitedBy: req.user.id,
        });
        await invite.save();

        const inviteLink = `http://localhost:5173/group/invite/accept/${token}`;
        await sendEmail(
          email,
          "You're invited to join a group!",
          `<p>Hello,</p>
           <p>You have been invited to join the group <b>${name}</b>.</p>
           <a href="${inviteLink}">${inviteLink}</a>`
        );

        console.log(`✅ Invite sent to ${email} for group "${name}"`);
        inviteResults.push({ email, status: "sent" });
      } catch (err) {
        console.error(`❌ Failed to send invite to ${email}:`, err);
        inviteResults.push({ email, status: "failed", error: err.message });
      }
    }

    await ActivityController.logActivity(
      req.user.id,
      "GROUP_CREATED",
      group._id,
      group._id,
      `${req.user.name || "User"} created a new group: ${group.name}`
    );

    
    return res.status(200).json({
      message: "Group is created successfully",
      group,
      invites: inviteResults,
    });
  } catch (error) {
    console.error("❌ Error creating group:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = groupCreated;
