require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const Property = require("../models/Property");
const PropertyType = require("../models/PropertyType");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Lead = require("../models/Lead");
const Offer = require("../models/Offer");
const Notification = require("../models/Notification");
const Agent = require("../models/Agent");

async function seedLuxuryData() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/propestate";
  console.log("Connecting to database at:", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));
  await mongoose.connect(uri);
  console.log("Connected to MongoDB successfully.");

  // 1. Get or create Property Types
  const types = {};
  const defaultTypes = [
    { name: "Villa", description: "Standalone luxury villas with private gardens and pools" },
    { name: "Apartment", description: "Premium high-rise apartments and residences" },
    { name: "Penthouse", description: "Top-floor exclusive penthouses with panoramic city views" },
    { name: "Duplex", description: "Multi-level modern luxury duplexes" },
    { name: "Commercial Building", description: "Grade-A corporate office and retail spaces" },
    { name: "Farm House", description: "Lush countryside retreats and private estates" },
  ];

  for (const t of defaultTypes) {
    const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let doc = await PropertyType.findOne({ name: t.name });
    if (!doc) {
      doc = await PropertyType.create({ name: t.name, slug, description: t.description, status: "active" });
    }
    types[t.name] = doc._id;
  }

  // 2. Fetch Users
  const superAdmin = await User.findOne({ role: "SUPER_ADMIN" });
  let agentUser = await User.findOne({ role: "AGENT" });
  if (!agentUser) {
    const agentRole = await Role.findOne({ name: "AGENT" });
    agentUser = await User.create({
      name: "Marcus Vance",
      email: "agent.vance@primenest.com",
      password: "Password123!",
      role: "AGENT",
      roleRef: agentRole?._id,
      status: "active",
      emailVerified: true,
      phone: "+91 98200 45678",
      profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
    });
  }

  // Ensure agent profile in Agent collection
  await Agent.findOneAndUpdate(
    { user: agentUser._id },
    {
      $set: {
        user: agentUser._id,
        agencyName: "PrimeNest Luxury Realty",
        licenseNumber: "PRM-RERA-2024-8849",
        specialization: ["Luxury Residential", "Waterfront Penthouses", "High-Net-Worth Advisory"],
        phone: agentUser.phone || "+91 98200 45678",
        status: "active",
        bio: "Senior Portfolio Partner with 12+ years representing ultra-luxury residential properties across Mumbai, Goa, and Bangalore.",
        rating: 4.95,
        reviewCount: 38,
        profileImage: agentUser.profileImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
      }
    },
    { upsert: true }
  );

  // Fetch customers
  let customers = await User.find({ role: { $in: ["CUSTOMER", "OWNER"] } });
  if (!customers.length) {
    const customerRole = await Role.findOne({ name: "CUSTOMER" });
    const c1 = await User.create({
      name: "Abhijit Kayal",
      email: "kayalabhi06@gmail.com",
      password: "Password123!",
      role: "CUSTOMER",
      roleRef: customerRole?._id,
      status: "active",
      emailVerified: true,
      phone: "+91 98765 43210",
    });
    customers = [c1];
  }
  const primaryCustomer = customers[0];
  const secondaryCustomer = customers[1] || customers[0];

  console.log(`Using primary customer: ${primaryCustomer.name} (${primaryCustomer.email})`);
  console.log(`Using agent: ${agentUser.name} (${agentUser.email})`);

  // 3. Luxury Real Estate Listings Data
  const luxuryProperties = [
    {
      title: "The Glass Pavilion & Infinity Estate",
      propertyId: "PROP-000101",
      description: "An architectural marvel perched high above the coastline featuring floor-to-ceiling acoustic glass walls, private cantilevered infinity pool, dual chef kitchens, and automated climate corridors.",
      propertyType: types["Villa"] || types["Apartment"],
      listingType: "Sale",
      price: 185000000, // 18.5 Cr
      address: "Ridgeview Promontory, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400050",
      bedrooms: 5,
      bathrooms: 6,
      area: 6850,
      furnishingStatus: "Fully-Furnished",
      amenities: [
        "Private Infinity Pool",
        "Home Theater (Dolby Atmos)",
        "Italian Marble Flooring",
        "Private Elevator",
        "Smart Home Automation",
        "Wine Cellar",
        "4-Car Underground Garage",
        "24/7 Concierge Security",
      ],
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: true,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: primaryCustomer._id, // Assign to primary customer so they see it in Seller Hub!
    },
    {
      title: "Skyline Presidential Penthouse",
      propertyId: "PROP-000102",
      description: "Crown jewel penthouse occupying the entire 48th floor with 360-degree unobstructed sea views, private helipad landing access, sky garden, and bespoke imported finishes.",
      propertyType: types["Penthouse"] || types["Apartment"],
      listingType: "Sale",
      price: 240000000, // 24 Cr
      address: "Worli Sea Face Boulevard, Tower Aurelia",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400018",
      bedrooms: 4,
      bathrooms: 5,
      area: 5400,
      furnishingStatus: "Fully-Furnished",
      amenities: [
        "Panoramic Sea View",
        "Private Sky Garden",
        "Jacuzzi Spa Deck",
        "Dedicated Valet & Private Lift",
        "Biometric Security Suite",
        "German Modular Kitchen",
      ],
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: true,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: secondaryCustomer._id,
    },
    {
      title: "The Oasis Zen Courtyard Villa",
      propertyId: "PROP-000103",
      description: "Serene Portuguese-modern fusion villa tucked in Assagao, designed around lush internal tropical gardens, plunge pool, open-concept timber lanais, and bespoke brass accents.",
      propertyType: types["Villa"] || types["Apartment"],
      listingType: "Sale",
      price: 85000000, // 8.5 Cr
      address: "Badem Sunset Valley, Assagao",
      city: "Goa",
      state: "Goa",
      country: "India",
      zipCode: "403507",
      bedrooms: 4,
      bathrooms: 4,
      area: 4200,
      furnishingStatus: "Fully-Furnished",
      amenities: [
        "Private Plunge Pool",
        "Tropical Courtyard",
        "High Timber Ceilings",
        "Solar Micro-grid Ready",
        "Bespoke Outdoor Barbecue Lounge",
      ],
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: true,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: primaryCustomer._id, // Also owned by customer!
    },
    {
      title: "The Indiranagar Heritage Duplex",
      propertyId: "PROP-000104",
      description: "Sophisticated bi-level residence in the prime neighborhood of Indiranagar. Featuring double-height light wells, private terrace sanctuary, and sustainable timber craftsmanship.",
      propertyType: types["Duplex"] || types["Apartment"],
      listingType: "Sale",
      price: 52000000, // 5.2 Cr
      address: "12th Main, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      zipCode: "560038",
      bedrooms: 3,
      bathrooms: 4,
      area: 3600,
      furnishingStatus: "Semi-Furnished",
      amenities: [
        "Double-Height Ceiling",
        "Rooftop Terrace Lounge",
        "EV Charging Port",
        "Italian Sanitaryware",
        "2 Dedicated Stilt Car Parks",
      ],
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: true,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: secondaryCustomer._id,
    },
    {
      title: "Golf Course Sanctuary Residence",
      propertyId: "PROP-000105",
      description: "Ultra-prime golf greens facing luxury condominium on Golf Course Road. Features floor-to-ceiling soundproof glass, VRV central cooling, club access, and private wine lounge.",
      propertyType: types["Apartment"],
      listingType: "Sale",
      price: 68000000, // 6.8 Cr
      address: "DLF Phase 5, Golf Course Road",
      city: "Gurugram",
      state: "Haryana",
      country: "India",
      zipCode: "122002",
      bedrooms: 4,
      bathrooms: 4,
      area: 4100,
      furnishingStatus: "Fully-Furnished",
      amenities: [
        "Golf Course View",
        "Clubhouse & Olympic Pool Access",
        "VRV Air Conditioning",
        "Multi-Tier Security & Card Access",
        "Squash & Tennis Courts",
      ],
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: true,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: superAdmin?._id || primaryCustomer._id,
    },
    {
      title: "Jubilee Grand Contemporary Mansion",
      propertyId: "PROP-000106",
      description: "Majestic palatial residence in Road No. 36 Jubilee Hills. Highlights include a subterranean private bowling alley, temperature-regulated lap pool, and landscaped zen waterfalls.",
      propertyType: types["Villa"] || types["Apartment"],
      listingType: "Sale",
      price: 290000000, // 29 Cr
      address: "Road No. 36, Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      zipCode: "500033",
      bedrooms: 6,
      bathrooms: 7,
      area: 9200,
      furnishingStatus: "Fully-Furnished",
      amenities: [
        "Private Temperature-Controlled Lap Pool",
        "Subterranean Recreation Lounge",
        "Landscaped Zen Waterfalls",
        "Smart App Driven Security",
        "Staff Quarters & Driver Suite",
      ],
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: true,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: primaryCustomer._id, // Owned by primary customer!
    },
    {
      title: "Verdant Hills Eco-Luxury Estate",
      propertyId: "PROP-000107",
      description: "Exclusive coffee estate retreat in Coorg featuring rammed-earth sustainable architecture, private stream, outdoor fire pits, and organic orchards.",
      propertyType: types["Farm House"] || types["Villa"],
      listingType: "Sale",
      price: 38000000, // 3.8 Cr
      address: "Madikeri Highlands",
      city: "Coorg",
      state: "Karnataka",
      country: "India",
      zipCode: "571201",
      bedrooms: 3,
      bathrooms: 3,
      area: 3200,
      furnishingStatus: "Fully-Furnished",
      amenities: [
        "Private Organic Plantation",
        "Natural Stream Access",
        "Outdoor Sunken Fire Pit",
        "Solar Heating & Rainwater Harvesting",
      ],
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: false,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: secondaryCustomer._id,
    },
    {
      title: "The Apex Commercial Corporate Tower",
      propertyId: "PROP-000108",
      description: "LEED Platinum certified corporate suite in Bandra Kurla Complex (BKC). High ceilings, grand double-height atrium reception, column-free office floor plates, and high-speed elevators.",
      propertyType: types["Commercial Building"] || types["Apartment"],
      listingType: "Rent",
      price: 850000, // Monthly Rent
      address: "G Block, Bandra Kurla Complex",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400051",
      bedrooms: 0,
      bathrooms: 4,
      area: 4500,
      furnishingStatus: "Semi-Furnished",
      amenities: [
        "LEED Platinum Certified",
        "High-Speed Destination Elevators",
        "Triple-Height Reception Atrium",
        "Dedicated Multi-Level Parking",
        "100% Power Backup",
      ],
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "Available",
      approvalStatus: "approved",
      isFeatured: false,
      isPublished: true,
      assignedAgent: agentUser._id,
      owner: superAdmin?._id || primaryCustomer._id,
    }
  ];

  console.log("Upserting luxury properties...");
  const createdProperties = [];
  for (const propData of luxuryProperties) {
    const existing = await Property.findOne({ propertyId: propData.propertyId });
    if (existing) {
      await Property.updateOne({ propertyId: propData.propertyId }, { $set: propData });
      createdProperties.push(existing);
    } else {
      const created = await Property.create(propData);
      createdProperties.push(created);
    }
  }
  console.log(`Saved ${createdProperties.length} luxury properties.`);

  // 4. Populate Customer Favorites (so Buyer Hub shows real saved items!)
  const favIds = [createdProperties[0]._id, createdProperties[1]._id, createdProperties[3]._id];
  for (const cust of customers) {
    await User.findByIdAndUpdate(cust._id, {
      $set: { favorites: favIds }
    });
  }
  console.log(`Updated ${customers.length} customer accounts with 3 saved favorites.`);

  // 5. Populate Realistic Tour Bookings
  console.log("Seeding Tour Bookings...");
  const tourDates = [
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days ahead
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days ahead
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (completed)
    new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days ahead
  ];

  const bookingSeeds = [
    {
      bookingId: "BKG-000101",
      user: primaryCustomer._id,
      property: createdProperties[1]._id, // Skyline Penthouse
      agent: agentUser._id,
      bookingDate: tourDates[0],
      tourType: "In-Person Physical Visit",
      amount: 5000,
      paymentMethod: "UPI",
      payerName: primaryCustomer.name,
      approvalStatus: "Approved",
      paymentStatus: "Paid",
      status: "Confirmed",
      notes: "Client requested an evening sunset walkthrough to inspect terrace sea views.",
    },
    {
      bookingId: "BKG-000102",
      user: primaryCustomer._id,
      property: createdProperties[3]._id, // Indiranagar Duplex
      agent: agentUser._id,
      bookingDate: tourDates[1],
      tourType: "Live Video Tour",
      amount: 2500,
      paymentMethod: "Card",
      payerName: primaryCustomer.name,
      approvalStatus: "Approved",
      paymentStatus: "Paid",
      status: "Confirmed",
      notes: "Virtual 4K walkthrough via private stream.",
    },
    {
      bookingId: "BKG-000103",
      user: secondaryCustomer._id,
      property: createdProperties[0]._id, // Glass Pavilion
      agent: agentUser._id,
      bookingDate: tourDates[2],
      tourType: "In-Person Physical Visit",
      amount: 5000,
      paymentMethod: "Bank Transfer",
      payerName: secondaryCustomer.name,
      approvalStatus: "Approved",
      paymentStatus: "Paid",
      status: "Completed",
      notes: "Tour completed. Buyer submitted formal letter of interest.",
    },
    {
      bookingId: "BKG-000104",
      user: primaryCustomer._id,
      property: createdProperties[4]._id, // Golf Course Sanctuary
      agent: agentUser._id,
      bookingDate: tourDates[3],
      tourType: "In-Person Physical Visit",
      amount: 5000,
      paymentMethod: "UPI",
      payerName: primaryCustomer.name,
      approvalStatus: "Pending",
      paymentStatus: "Submitted",
      status: "Pending",
      notes: "Requested weekend morning slot with private parking access.",
    },
  ];

  for (const bkg of bookingSeeds) {
    await Booking.findOneAndUpdate(
      { bookingId: bkg.bookingId },
      { $set: bkg },
      { upsert: true }
    );
  }
  console.log("Seeded 4 Tour Bookings.");

  // 6. Populate Realistic Transactions (Tokens, Escrows, Verification)
  console.log("Seeding Transactions...");
  const txSeeds = [
    {
      transactionId: "TXN-000101",
      user: primaryCustomer._id,
      property: createdProperties[1]._id,
      amount: 250000, // Token Reservation Deposit (2.5 Lakhs)
      paymentMethod: "Bank Transfer",
      paymentGateway: "ICICI Escrow Direct",
      gatewayTransactionId: "ESC-ICICI-88491290",
      status: "Paid",
      transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      transactionId: "TXN-000102",
      user: primaryCustomer._id,
      property: createdProperties[3]._id,
      amount: 5000, // Private Tour Verification Fee
      paymentMethod: "UPI",
      paymentGateway: "Razorpay",
      gatewayTransactionId: "pay_OpQwe82910kd",
      status: "Paid",
      transactionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      transactionId: "TXN-000103",
      user: primaryCustomer._id,
      property: createdProperties[0]._id,
      amount: 150000, // Legal Due Diligence & Title Search Retainer
      paymentMethod: "Online Payment",
      paymentGateway: "HDFC Payment Gateway",
      gatewayTransactionId: "HDFC-TXN-994102",
      status: "Paid",
      transactionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      transactionId: "TXN-000104",
      user: secondaryCustomer._id,
      property: createdProperties[2]._id,
      amount: 500000, // Token Booking
      paymentMethod: "Bank Transfer",
      paymentGateway: "Wire Transfer",
      gatewayTransactionId: "WIRE-NEFT-92019401",
      status: "Paid",
      transactionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const tx of txSeeds) {
    await Transaction.findOneAndUpdate(
      { transactionId: tx.transactionId },
      { $set: tx },
      { upsert: true }
    );
  }
  console.log("Seeded 4 Financial Transactions.");

  // 7. Populate Leads & Visit Requests for Seller Hub
  console.log("Seeding Leads & Inquiries...");
  const leadSeeds = [
    {
      name: "Rohit Singhania",
      email: "rohit.singhania@apexcapital.in",
      phone: "+91 99201 22881",
      property: createdProperties[0]._id, // Customer's owned villa
      assignedAgent: agentUser._id,
      source: "Website",
      status: "Interested",
      priority: "Urgent",
      notes: "High-net-worth investor interested in immediate cash closing. Looking for architectural drawings.",
    },
    {
      name: "Dr. Malini Iyer",
      email: "malini.iyer@apollohospitals.org",
      phone: "+91 98450 77123",
      property: createdProperties[2]._id, // Customer's owned Goa Villa
      assignedAgent: agentUser._id,
      source: "Referral",
      status: "Showing Scheduled",
      priority: "High",
      notes: "Wants a holiday retreat home in North Goa. Scheduled visit this coming Saturday.",
    },
    {
      name: "Vikramaditya Mehta",
      email: "vikram@mehtagroup.com",
      phone: "+91 98210 99401",
      property: createdProperties[5]._id, // Customer's Jubilee Mansion
      assignedAgent: agentUser._id,
      source: "Walk-in",
      status: "Negotiation",
      priority: "Urgent",
      notes: "Offered ₹27.5 Cr against listing price of ₹29 Cr. Awaiting seller counter-offer.",
    },
    {
      name: "Tara Deshmukh",
      email: "tara.deshmukh@studioarc.com",
      phone: "+91 97690 33812",
      property: createdProperties[0]._id, // Customer's owned villa
      assignedAgent: agentUser._id,
      source: "Social Media",
      status: "New",
      priority: "Medium",
      notes: "Inquired about floor plan dimensions and whether furnishings are included.",
    }
  ];

  for (const ld of leadSeeds) {
    await Lead.create(ld);
  }
  console.log("Seeded 4 Leads / Inquiries.");

  // 8. Populate Formal Offers
  console.log("Seeding Formal Offers...");
  const offerSeeds = [
    {
      property: createdProperties[0]._id, // Customer's Villa
      buyer: secondaryCustomer._id,
      seller: primaryCustomer._id,
      amount: 178000000,
      status: "Pending",
      message: "Formal offer submitted with 10% immediate escrow transfer ready upon agreement.",
    },
    {
      property: createdProperties[5]._id, // Customer's Jubilee Mansion
      buyer: secondaryCustomer._id,
      seller: primaryCustomer._id,
      amount: 275000000,
      counterAmount: 282000000,
      status: "Countered",
      message: "Seller submitted counter-offer of ₹28.2 Cr with included interior art collection.",
    }
  ];

  for (const ofr of offerSeeds) {
    await Offer.create(ofr);
  }
  console.log("Seeded 2 Formal Offers.");

  // 9. Populate High-Priority Notifications
  console.log("Seeding Real-Time Notifications...");
  const notifSeeds = [
    {
      recipient: primaryCustomer._id,
      sender: agentUser._id,
      title: "Private Tour Confirmed",
      message: "Your VIP tour of Skyline Presidential Penthouse has been scheduled with Senior Partner Marcus Vance for this Thursday.",
      type: "booking_confirmation",
      isRead: false,
    },
    {
      recipient: primaryCustomer._id,
      sender: null,
      title: "Escrow Deposit Verified",
      message: "Your token deposit of ₹2,50,000 for PROP-000102 has been secured in the escrow trust account.",
      type: "payment_received",
      isRead: false,
    },
    {
      recipient: primaryCustomer._id,
      sender: null,
      title: "New Inbound Inquiry on The Glass Pavilion",
      message: "Rohit Singhania submitted an urgent inquiry and requested architectural documentation.",
      type: "new_lead",
      isRead: false,
    },
    {
      recipient: primaryCustomer._id,
      sender: null,
      title: "Price Counter-Offer Received",
      message: "Counter-offer of ₹28.2 Cr is pending review for Jubilee Grand Contemporary Mansion.",
      type: "system",
      isRead: false,
    },
    {
      recipient: agentUser._id,
      sender: primaryCustomer._id,
      title: "New VIP Tour Booking",
      message: "Abhijit Kayal requested a sunset in-person walkthrough for Worli Sea Face Penthouse.",
      type: "new_booking",
      isRead: false,
    }
  ];

  for (const ntf of notifSeeds) {
    await Notification.create(ntf);
  }
  console.log("Seeded 5 Notifications.");

  console.log("\n==============================================");
  console.log("SUCCESS: Luxury real estate database populated!");
  console.log("==============================================");
  console.log("Properties added: 8 ultra-luxury estates");
  console.log("Saved Favorites added to customers: 3 properties");
  console.log("Tour Bookings: 4 scheduled & completed tours");
  console.log("Transactions: 4 verified escrow & fee records");
  console.log("Leads / Inquiries: 4 inquiries for Seller Hub");
  console.log("Offers: 2 pending & countered offers");
  console.log("Notifications: 5 live notifications");
  console.log("==============================================\n");

  await mongoose.disconnect();
}

seedLuxuryData().catch((err) => {
  console.error("Error seeding luxury data:", err);
  process.exit(1);
});
