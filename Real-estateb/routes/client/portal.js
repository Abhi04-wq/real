const express = require("express");
const { protect, requireClient } = require("../../middleware/clientAuth");
const c = require("../../controllers/clientController");
const invoiceController = require("../../controllers/invoiceController");

const router = express.Router();
router.use(protect, requireClient);

router.get("/overview", c.overview);

router.post("/bookings", c.createBooking);
router.get("/bookings", c.myBookings);
router.get("/bookings/:id/invoice", invoiceController.getBookingInvoice);
router.post("/bookings/:id/cancel", c.cancelBooking);
router.post("/bookings/:id/payment", c.submitBookingPayment);

router.get("/favorites", c.favorites);
router.post("/favorites/:propertyId/toggle", c.toggleFavorite);

router.get("/offers", c.myOffers);
router.post("/offers", c.createOffer);
router.post("/offers/:id/respond", c.respondOffer);

router.post("/listings", c.submitListing);
router.get("/listings", c.myListings);
router.put("/listings/:id", c.updateListing);
router.get("/seller-leads", c.sellerLeads);

router.get("/transactions", c.myTransactions);
router.get("/transactions/:id/invoice", invoiceController.getTransactionInvoice);

router.get("/profile", c.getClientProfile);
router.put("/profile", c.updateClientProfile);
router.post("/change-password", require("../../controllers/profileController").changePassword);

module.exports = router;
