const Agent = require("../models/Agent");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { ok, fail } = require("../middleware/agentScope");
const { recordActivity } = require("../middleware/activity");

// Agent's own extended profile (bio, license, socials, notification prefs)
const getAgentProfile = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user._id }).populate("user", "name email phone profileImage role");
  if (!agent) return fail(res, 404, "Agent profile not found");
  ok(res, { agent, publicLink: `/agent/${agent._id}` }, "Agent profile");
});

const updateAgentProfile = asyncHandler(async (req, res) => {
  const { bio, licenseNumber, socials, notificationPrefs, profileImage, name, phone } = req.body;
  const agent = await Agent.findOne({ user: req.user._id });
  if (!agent) return fail(res, 404, "Agent profile not found");
  if (bio !== undefined) agent.bio = bio;
  if (licenseNumber !== undefined) agent.licenseNumber = licenseNumber;
  if (socials) agent.socials = { ...agent.socials.toObject(), ...socials };
  if (notificationPrefs) agent.notificationPrefs = { ...agent.notificationPrefs.toObject(), ...notificationPrefs };
  if (profileImage !== undefined) agent.profileImage = profileImage;
  await agent.save();

  if (profileImage !== undefined || name !== undefined || phone !== undefined) {
    await User.findByIdAndUpdate(req.user._id, {
      ...(profileImage !== undefined ? { profileImage } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
    });
  }

  const updatedAgent = await Agent.findById(agent._id).populate("user", "name email phone profileImage role");
  await recordActivity({ user: req.user, module: "agents", action: "Agent profile updated", description: "Updated own agent profile", req });
  ok(res, { agent: updatedAgent }, "Profile updated");
});

module.exports = { getAgentProfile, updateAgentProfile };
