require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");

async function seedMonthlyTimeline() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/propestate";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB for monthly timeline seeding.");

  const customer = await User.findOne({ role: "CUSTOMER" });
  const agent = await User.findOne({ role: "AGENT" });
  const properties = await Property.find({}).limit(8);

  if (!customer || !properties.length) {
    console.error("Missing customer or properties to associate transactions with.");
    process.exit(1);
  }

  const now = new Date(); // Current date (Sep 2026)

  // 6-Month Trajectory: Apr, May, Jun, Jul, Aug, Sep
  const monthlyTimelineData = [
    {
      monthsAgo: 5, // Apr 2026
      transactions: [
        { amount: 180000, method: "Bank Transfer", gateway: "ICICI Escrow" },
        { amount: 45000, method: "UPI", gateway: "Razorpay" },
      ],
      dealsCount: 2,
      propsCount: 1,
    },
    {
      monthsAgo: 4, // May 2026
      transactions: [
        { amount: 310000, method: "Bank Transfer", gateway: "HDFC Escrow" },
        { amount: 75000, method: "Card", gateway: "Stripe" },
      ],
      dealsCount: 3,
      propsCount: 2,
    },
    {
      monthsAgo: 3, // Jun 2026
      transactions: [
        { amount: 480000, method: "Bank Transfer", gateway: "Axis Escrow" },
        { amount: 80000, method: "UPI", gateway: "Razorpay" },
      ],
      dealsCount: 4,
      propsCount: 1,
    },
    {
      monthsAgo: 2, // Jul 2026
      transactions: [
        { amount: 620000, method: "Bank Transfer", gateway: "ICICI Escrow" },
        { amount: 95000, method: "Online Payment", gateway: "HDFC Direct" },
      ],
      dealsCount: 4,
      propsCount: 2,
    },
    {
      monthsAgo: 1, // Aug 2026
      transactions: [
        { amount: 740000, method: "Bank Transfer", gateway: "Escrow Trust" },
        { amount: 110000, method: "UPI", gateway: "Razorpay" },
      ],
      dealsCount: 5,
      propsCount: 1,
    },
    {
      monthsAgo: 0, // Sep 2026 (current)
      transactions: [
        { amount: 780000, method: "Bank Transfer", gateway: "ICICI Direct" },
        { amount: 125000, method: "UPI", gateway: "Razorpay" },
      ],
      dealsCount: 6,
      propsCount: 1,
    },
  ];

  // Clear previous historical data
  await Transaction.collection.deleteMany({ transactionId: { $regex: /^TXN-HIST-/ } });
  await Booking.collection.deleteMany({ bookingId: { $regex: /^BKG-HIST-/ } });

  let txCounter = 300;
  let bkgCounter = 300;

  for (const mData of monthlyTimelineData) {
    // Exact middle of that month
    const targetDate = new Date(now.getFullYear(), now.getMonth() - mData.monthsAgo, 15, 12, 0, 0);
    console.log(`Seeding month: ${targetDate.toISOString().slice(0, 7)} (months ago: ${mData.monthsAgo})`);

    // Insert historical transactions using raw collection to preserve createdAt
    for (const txItem of mData.transactions) {
      txCounter++;
      const txId = `TXN-HIST-${txCounter}`;
      await Transaction.collection.insertOne({
        transactionId: txId,
        user: customer._id,
        property: properties[txCounter % properties.length]._id,
        amount: txItem.amount,
        paymentMethod: txItem.method,
        paymentGateway: txItem.gateway,
        gatewayTransactionId: `GTW-${txId}`,
        status: "Paid",
        transactionDate: targetDate,
        createdAt: targetDate,
        updatedAt: targetDate,
      });
    }

    // Insert historical bookings (deals) using raw collection
    for (let i = 0; i < mData.dealsCount; i++) {
      bkgCounter++;
      const bkgId = `BKG-HIST-${bkgCounter}`;
      const bkgDate = new Date(targetDate.getTime() + (i * 2 + 1) * 24 * 3600 * 1000);
      await Booking.collection.insertOne({
        bookingId: bkgId,
        user: customer._id,
        property: properties[bkgCounter % properties.length]._id,
        agent: agent ? agent._id : null,
        bookingDate: bkgDate,
        tourType: i % 2 === 0 ? "In-Person Physical Visit" : "Live Video Tour",
        amount: 5000,
        paymentMethod: "UPI",
        payerName: customer.name,
        approvalStatus: "Approved",
        paymentStatus: "Paid",
        status: "Completed",
        createdAt: bkgDate,
        updatedAt: bkgDate,
      });
    }

    // Assign property createdAt to spread property growth across months
    if (properties[mData.monthsAgo]) {
      await Property.collection.updateOne(
        { _id: properties[mData.monthsAgo]._id },
        { $set: { createdAt: targetDate } }
      );
    }
  }

  console.log("Successfully seeded 6-month historical financial and deal trajectory via raw driver!");
  await mongoose.disconnect();
}

seedMonthlyTimeline().catch((err) => {
  console.error("Error seeding timeline:", err);
  process.exit(1);
});
