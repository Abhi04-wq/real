# PrimeNest Real Estate Platform — Architecture & System Documentation

> **Complete Platform Specification & Module Breakdown**  
> *Generated on September 25, 2026*  
> **Stack**: React 19 + Vite + Tailwind CSS v4 + Node.js + Express 5 + MongoDB / Mongoose

---

## Table of Contents
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Public Web Platform & Client Pages](#2-public-web-platform--client-pages)
3. [Super Admin Panel (`/panel`)](#3-super-admin-panel-panel)
4. [Operations & Branch Manager Panel (`/manage`)](#4-operations--branch-manager-panel-manage)
5. [Agent & Broker Partner Portal (`/agent`)](#5-agent--broker-partner-portal-agent)
6. [Customer & Homeowner Client Hub (`/home`)](#6-customer--homeowner-client-hub-home)
7. [Database Models & API Infrastructure](#7-database-models--api-infrastructure)
8. [Design System & UI Tokens](#8-design-system--ui-tokens)

---

## 1. Executive Summary & System Architecture

PrimeNest is an enterprise-grade luxury real estate marketplace, brokerage operations CRM, and customer portal platform. It supports **5 distinct user portals**, role-based access control (RBAC), physical visit booking, real-time notifications, dynamic agency branding, and financial escrow ledgers.

```
                              ┌────────────────────────────────────────┐
                              │          PrimeNest Platform            │
                              └──────────────────┬─────────────────────┘
                                                 │
      ┌──────────────────┬───────────────────────┼───────────────────────┬──────────────────┐
      ▼                  ▼                       ▼                       ▼                  ▼
┌──────────────┐  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐   ┌──────────────┐
│ Public Web   │  │ Customer Hub │        │ Agent Portal │        │ Manager CRM  │   │ Super Admin  │
│ (Landing/SEO)│  │ (`/home`)    │        │ (`/agent`)   │        │ (`/manage`)  │   │ (`/panel`)   │
└──────────────┘  └──────────────┘        └──────────────┘        └──────────────┘   └──────────────┘
```

---

## 2. Public Web Platform & Client Pages

Publicly accessible routes with luxury aesthetics, Sparkle dynamic navigation, editorial typography, and SEO metadata.

| Page Route | Purpose | Key Features & Capabilities |
| :--- | :--- | :--- |
| `/` | **Main Landing Page** | Sparkle Navbar, Hero carousel, Curated Residences showcase, Neighborhood spotlights, Customer reviews, Testimonials, FAQ accordion, Luxury footer. |
| `/properties` | **Property Catalog** | Grid/List view toggle, Multi-filter search (Price range, Bedrooms, Property Type, City), Keyword lookup, Real-time sorting, Pagination. |
| `/property/:id` | **Property Details** | Image gallery, Price breakdown, Key architectural specs (BHK, Sq.Ft, Furnishing), Amenities grid, Interactive map location, Direct Enquiry modal, Physical Tour Booking modal, **Customer Reviews & Ratings scorecard**. |
| `/agents` | **Agent Directory** | Directory of accredited agents, bio summaries, contact buttons, and verified badges. |
| `/agent/:id` | **Agent Showcase Page** | Public client-facing agent profile, verified RERA license, active assigned listings, specialties, and direct inquiry form. |
| `/plots` | **Land & Plots Portal** | Curated catalog of open architectural land and estate plots. |
| `/schedule-visit` | **Tour Booking** | Dedicated calendar slot selector for physical property walkthroughs with instant confirmation. |
| `/about-us` | **About the Agency** | Agency narrative, mission, leadership team, and corporate credentials. |
| `/contact-support` | **Concierge Support** | Contact inquiry form, headquarters address, phone numbers, and operating hours. |
| `/login` & `/register` | **Authentication** | Customer, seller, and staff sign-in / registration with JWT session tokens. |
| `/agent/login` | **Partner Login** | Dedicated login portal for licensed agents and brokers. |
| `/forgot-password` & `/reset-password` | **Recovery** | Email password reset workflow. |
| `/privacy-policy`, `/refund-policy`, `/rera-disclaimer`, `/sitemap` | **Legal Compliance** | Institutional legal, compliance, and disclaimers. |

---

## 3. Super Admin Panel (`/panel`)

The master administrative console for agency principals and system administrators. Full read/write authority across the database.

### Navigation Tabs & Functional Breakdown:

| Tab Name | Route | What It Does |
| :--- | :--- | :--- |
| **Dashboard** | `/panel` | Executive KPI grid (Gross Revenue, Active Listings, Total Leads, Scheduled Visits, Pending Payouts), 6-month Revenue vs. Bookings Area Chart, Lead Conversion Bar Chart, Property Type Donut Chart, Quick Navigation Dock, and Real-time Activity Logs. |
| **Properties** | `/panel/properties` | Master inventory management. Filter by status (`Available`, `Pending`, `Sold`, `Rented`). Add/Edit property drawer with Cloudinary/Multer photo uploads, pricing, address, features, and moderation approval. |
| **Property Types** | `/panel/property-types` | Create and manage categories (e.g., Luxury Villas, Penthouses, Sea-Facing Apartments, Commercial, Plots) with cover images and active statuses. |
| **Users** | `/panel/users` | Comprehensive platform directory of all Customers, Agents, Managers, and Admins. Role assignment, account suspension, and detailed customer drawers (`/panel/users/:id`). |
| **Agents** | `/panel/agents` | Manage licensed advisors, assign commission rates (%), monitor allocated properties/leads, and link to their public showcase. |
| **Leads** | `/panel/leads` | Interactive CRM Pipeline (both Drag-and-Drop Kanban and Data Table). Stages: `New` → `Contacted` → `Showing Scheduled` → `Negotiation` → `Under Contract` → `Closed` / `Lost`. Agent reassignment and activity logs. |
| **Bookings** | `/panel/bookings` | Physical visit coordination. View scheduled buyer tours, approve/decline requests, reschedule slots, and assign tour agents. |
| **Transactions** | `/panel/transactions` | Financial ledger tracking token deposits, escrow disbursements, and buyer payments. Filter by date/status with exportable receipts. |
| **Commissions** | `/panel/commissions` | Agent commission calculations based on closed deals. Review pending payout requests and record payouts. |
| **Reports** | `/panel/reports` | Business intelligence analytics: sales velocity, agent conversion rates, revenue statements, and Excel/CSV data exports. |
| **Notifications** | `/panel/notifications` | Broadcast platform-wide announcements and review transactional system alert logs. |
| **Roles & Permissions** | `/panel/roles` | Granular Role-Based Access Control (RBAC). Create custom roles and configure permissions across every module. |
| **Activity Logs** | `/panel/activity` | Security audit trail recording every administrative edit, timestamp, user ID, module name, and IP address. |
| **Agency Settings** | `/panel/settings` | **Agency Profile**: Legal name, Tagline, Email, Phone, Website, RERA number, Corporate address, Currency, Timezone.<br>**Branding & Media**: Direct **Logo Upload** with live preview and instant sidebar sync; Direct **Favicon Upload** with dynamic cache-busting tab sync; Brand color theme swatches. |

---

## 4. Operations & Branch Manager Panel (`/manage`)

A focused operations CRM designed for regional branch directors and property managers to supervise listings, agents, and showings.

| Tab Name | Route | What It Does |
| :--- | :--- | :--- |
| **Dashboard** | `/manage` | Operations KPIs: branch listings count, active customer leads, scheduled tours today, and branch deal progress. |
| **Properties** | `/manage/properties` | Review and verify property listings submitted by agents and sellers prior to public publication. |
| **Agents** | `/manage/agents` | Supervise regional team agents, inspect active lead assignments, and review daily showing activities. |
| **Customers** | `/manage/customers` | Client directory, budget preferences, search requirements, and contact histories. |
| **Leads** | `/manage/leads` | Branch CRM pipeline. Assign incoming property inquiries to available team agents. |
| **Bookings** | `/manage/bookings` | Schedule and assign staff agents to accompany buyers on physical site visits. |
| **Transactions** | `/manage/transactions` | Track token payments and deposits collected at the branch level. |
| **Commissions** | `/manage/commissions` | Review agent commission earnings and verify payout eligibility. |
| **Reports** | `/manage/reports` | Branch performance reports and listing conversion rates. |
| **Notifications** | `/manage/notifications` | Operational alerts for visit requests, pending approvals, and deal milestones. |
| **Activity Log** | `/manage/activity` | Branch-level audit trail of manager actions. |
| **Profile** | `/manage/profile` | Personal manager profile, contact details, and password security. |

---

## 5. Agent & Broker Partner Portal (`/agent`)

Built specifically for real estate agents to run their advisory practice, nurture leads, manage showings, and request commission payouts.

| Tab Name | Route | What It Does |
| :--- | :--- | :--- |
| **Dashboard** | `/agent` | Personal sales metrics, active assigned listings, pipeline stage counter, upcoming client tours, and earned commission balance. |
| **My Properties** | `/agent/properties` | Portfolio of properties assigned to the agent. Add new listings with image uploads and submit them for admin approval. |
| **Leads & CRM** | `/agent/leads` | Personal CRM pipeline. Drag-and-drop Kanban view, contact buyers via click-to-call/email, log visit notes and client feedback. |
| **Visits & Bookings** | `/agent/bookings` | Scheduled buyer walkthroughs. Accept tour requests, reschedule conflicting slots, enter post-visit client feedback. |
| **Commissions** | `/agent/commissions` | Personal earnings ledger detailing commission percentage per transaction and one-click **Request Payout** action. |
| **Profile & Settings** | `/agent/profile` | **Executive Identity Card**: Avatar upload with live database persistence, verified partner badge.<br>**Personal & Contact**: Name, direct mobile, verified email.<br>**Bio & Accreditation**: Official RERA license number and client-facing biography.<br>**Social Media**: LinkedIn, Instagram, Facebook, and X links.<br>**Alerts & Preferences**: Toggle email and SMS alerts for tour visits.<br>**Security**: Password change with interactive show/hide eye toggles. |

---

## 6. Customer & Homeowner Client Hub (`/home`)

A unified dual-mode portal serving both **Homebuyers** (Buyer Mode) and **Homeowners / Landlords** (Seller Hub).

| Tab Name | Route | What It Does |
| :--- | :--- | :--- |
| **Overview Console** | `/home/dashboard` | **Buyer View**: 6 executive KPI cards (Saved Wishlist valuation, Tour Visits with upcoming count, Active Offers & Inquiries, Total Escrow Deposits, Prime Locales Explored, Verified Tier), 6-month Activity Area Chart, Tour Distribution Donut Chart, Interactive Data Hub (Upcoming Tours, Saved Wishlist, Active Offers, Financial Ledger), and Quick Action Dock.<br><br>**Seller Hub**: Portfolio total count, Active on market, Review queue, Gross portfolio valuation (₹ Cr), Deals closed, Seller verification status, Listing distribution breakdown, and Listed Inventory tab. |
| **Favorites** | `/home/favorites` | Bookmarked residences with live pricing, BHK/sq.ft specs, and one-click "Schedule Physical Tour" buttons. |
| **My Bookings** | `/home/my-bookings` | Customer's booked property visits. Shows assigned agent contact, tour date/time slot, status chips (`Confirmed`, `Pending`), and cancel/reschedule actions. |
| **My Properties** | `/home/my-properties` | Homeowners' submitted listings. Tracks moderation review (`Pending`, `Approved`, `Rejected`), inquiry counts, and listing status. |
| **Add Property** | `/home/add-property` | Guided multi-step submission wizard for homeowners to list homes for sale or rent with photo uploads, price, and amenities. |
| **Seller Leads** | `/home/seller-leads` | Direct buyer inquiries and showing requests received on the seller's properties. |
| **Transactions** | `/home/transactions` | Financial records of deposits, booking reservations, and receipts. |
| **Profile & Settings** | `/home/profile` | Personal contact details, buyer search preferences (max budget, preferred city, bedrooms), profile photo upload, and account password management. |

---

## 7. Database Models & API Infrastructure

The backend is organized with standard MongoDB collections and RESTful controllers:

| Model / Entity | File Path | Responsibilities |
| :--- | :--- | :--- |
| **User** | `models/User.js` | Core authentication entity (`name`, `email`, `phone`, `password`, `role`: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `AGENT`, `CUSTOMER`, `OWNER`, `profileImage`, `status`, `preferences`). |
| **Agent** | `models/Agent.js` | Extended advisor credentials (`user` ref, `employeeId`, `department`, `designation`, `commissionRate`, `bio`, `licenseNumber`, `socials`, `notificationPrefs`, `profileImage`). |
| **Property** | `models/Property.js` | Real estate listings (`title`, `slug`, `price`, `propertyType`, `status`, `bedrooms`, `bathrooms`, `area`, `location`, `images`, `amenities`, `assignedAgent`, `owner`). |
| **PropertyType** | `models/PropertyType.js` | Classification categories (Villas, Apartments, Penthouses, Plots). |
| **Lead** | `models/Lead.js` | CRM prospective clients (`name`, `email`, `phone`, `property`, `assignedAgent`, `stage`, `budget`, `source`, `activities`). |
| **Booking** | `models/Booking.js` | Tour visit requests (`property`, `user`, `agent`, `bookingDate`, `slot`, `status`, `notes`, `feedback`). |
| **Transaction** | `models/Transaction.js` | Escrow payments and deposits (`property`, `user`, `amount`, `currency`, `type`, `status`, `paymentMethod`). |
| **Commission** | `models/Commission.js` | Agent payout records (`agent`, `transaction`, `dealAmount`, `rate`, `commissionAmount`, `status`). |
| **Settings** | `models/Settings.js` | Platform-wide agency settings (`companyName`, `tagline`, `logo`, `favicon`, `email`, `phone`, `address`, `website`, `currency`, `timezone`, `reraNumber`, `taxNumber`, `socialLinks`, `emailSettings`, `systemSettings`). |
| **Role** | `models/Role.js` | RBAC access matrices and custom permission arrays. |
| **ActivityLog** | `models/ActivityLog.js` | Regulatory audit log tracking IP addresses, users, modules, and changes. |
| **Notification** | `models/Notification.js` | Real-time in-app alerts and notifications. |

---

## 8. Design System & UI Tokens

The entire frontend adheres to an architectural luxury design palette:

- **Primary Emerald**: `#176B5B` (Brand identity, primary buttons, active links, chart fills)
- **Deep Hover Emerald**: `#12584B` / `#0F5143`
- **Soft Sage**: `#DCEBE5` (Badge backgrounds, selected tabs, icon glow containers)
- **Charcoal Text**: `#1C2421` (High-contrast typography)
- **Muted Slate**: `#6B746F` (Helper text, secondary descriptions, labels)
- **Warm Amber**: `#C98A24` (Offers, featured highlights, pending status chips)
- **Card Backgrounds**: `#FFFFFF` with `border border-[#E4E7E5]` and `shadow-[0_2px_10px_rgba(28,36,33,0.02)]`
- **Canvas Background**: `#F7F7F2` (Warm architectural paper tone)

---

### File Location
This document is saved as:
`c:\Users\NEXACHAIN AI\Desktop\real-estate\SYSTEM_DOCUMENTATION.md`
