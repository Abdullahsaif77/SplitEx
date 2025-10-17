const Users = require("../models/users");
const Group = require("../models/group");
const Invite = require("../models/invites");
const { hashpassword, comparePassword } = require("../utils/hash");
const generateToken = require("../utils/tokenGenerate");

const register = async (req, res) => {
  try {
    const { name, email, passwordHash, createAt, groupId, token } = req.body;

    if (!name || !email || !passwordHash) {
      return res.status(400).json({ message: "Fill all the inputs" });
    }

    
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    
    const hashedPass = await hashpassword(passwordHash);
    const user = await Users.create({
      name,
      email,
      passwordHash: hashedPass,
      createAt,
    });

    let groupJoined = false;

   
    if (groupId && token) {
      const invite = await Invite.findOne({ groupId, token, email });

      if (invite) {
       
        await Group.updateOne(
          { _id: groupId },
          { $push: { members: { userId: user._id, role: "member" } } }
        );

        
        await Invite.deleteOne({ _id: invite._id });

        groupJoined = true;
      }
    }

    return res.status(201).json({
      message: groupJoined
        ? "User registered and added to group successfully"
        : "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;
    if (!email || !passwordHash) {
      return res.status(400).json({ message: "Fill all the inputs" });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const CorrPass = await comparePassword(passwordHash, user.passwordHash);
    if (!CorrPass) {
      return res.status(400).json({ error: "Password does not match" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login };
