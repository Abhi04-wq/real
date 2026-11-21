require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const twelveAgo = new Date();
  twelveAgo.setMonth(twelveAgo.getMonth() - 11);
  twelveAgo.setDate(1);

  const monthly = await Transaction.aggregate([
    { $match: { status: 'Paid', createdAt: { $gte: twelveAgo } } },
    { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, total: { $sum: '$amount' } }, },
    { $sort: { '_id.y': 1, '_id.m': 1 } }
  ]);

  const sales = await Booking.aggregate([
    { $match: { createdAt: { $gte: twelveAgo } } },
    { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } }, },
    { $sort: { '_id.y': 1, '_id.m': 1 } }
  ]);

  console.log('Monthly revenue points:', monthly);
  console.log('Sales points:', sales);
  await mongoose.disconnect();
}

check();
