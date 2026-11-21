const express = require("express");
const { protect, requireAgent } = require("../../middleware/agentScope");
const dashboard = require("../../controllers/agentDashboardController");
const props = require("../../controllers/agentPropertyController");
const leads = require("../../controllers/agentLeadController");
const bookings = require("../../controllers/agentBookingController");
const commissions = require("../../controllers/agentCommissionController");
const profile = require("../../controllers/agentProfileController");
const notif = require("../../controllers/agentNotificationController");
const baseProfile = require("../../controllers/profileController");

const router = express.Router();
router.use(protect, requireAgent);

router.get("/dashboard", dashboard.stats);

router.get("/properties", props.list);
router.post("/properties", props.create);
router.get("/properties/:id", props.getOne);
router.put("/properties/:id", props.update);
router.delete("/properties/:id", props.remove);
router.post("/properties/:id/submit", props.submit);

router.get("/leads/pipeline", leads.pipeline);
router.post("/leads", leads.create);
router.get("/leads/:id", leads.getOne);
router.put("/leads/:id/move", leads.move);
router.post("/leads/:id/activity", leads.logActivity);

router.get("/bookings", bookings.list);
router.post("/bookings", bookings.create);
router.put("/bookings/:id/status", bookings.setStatus);
router.get("/bookings/:id", bookings.getOne);
router.post("/bookings/:id/accept", bookings.accept);
router.post("/bookings/:id/decline", bookings.decline);
router.post("/bookings/:id/reschedule", bookings.reschedule);
router.post("/bookings/:id/feedback", bookings.feedback);

router.get("/commissions", commissions.ledger);
router.post("/commissions/:id/request-payout", commissions.requestPayout);

router.get("/profile/agent", profile.getAgentProfile);
router.put("/profile/agent", profile.updateAgentProfile);
router.get("/profile", baseProfile.getProfile);
router.put("/profile", baseProfile.updateProfile);
router.post("/profile/change-password", baseProfile.changePassword);

router.get("/notifications", notif.list);

module.exports = router;
