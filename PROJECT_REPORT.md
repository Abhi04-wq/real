# PrimeNest Real Estate Ecosystem — Comprehensive Project & Architecture Report

> **Document Version:** 1.0.0  
> **System Architecture:** MERN Stack (MongoDB, Express.js, React 19 / Vite, Node.js, Tailwind CSS)  
> **Target Environment:** Multi-tenant & Multi-role Enterprise Real Estate Platform

---

## 1. Executive Summary

**PrimeNest** is an enterprise-grade real estate platform designed to streamline real estate operations across all stakeholder tiers—from platform founders and operational executives down to field agents, property sellers, and home buyers. 

The software architecture is divided into **five distinct panels/workspaces**, protected by role-gated middleware, strict route guards, and granular permission systems:

1. **Super Admin Panel (`/panel`)** — Executive governance, platform settings, RBAC role management, and audit logging.
2. **Admin & Operations Panel (`/manage`)** — Day-to-day business operations, approval workflows, transaction validation, and customer relationship management.
3. **Agent & Broker Portal (`/agent`)** — Dedicated workstation for licensed realtors to handle assigned leads, conduct site tours, and track commissions.
4. **Client & Customer Workspace (`/home`)** — Dual-mode self-service portal for Property Buyers (Favorites, Tour Bookings, Invoices) and Property Owners/Sellers (Listing Wizard, Lead Inquiries).
5. **Public Real Estate Web Platform (`/`)** — High-end consumer portal featuring architectural property discovery, RERA disclosures, review systems, mortgage calculators, and visit schedulers.

---

## 2. Super Admin vs Admin Role Breakdown

A central architectural highlight of PrimeNest is the strict boundary between **Executive Platform Governance (Super Admin)** and **Operational Business Execution (Admin/Manager)**.

### Side-by-Side Comparison

| Feature / Domain | Super Admin (`SUPER_ADMIN`) | Admin / Manager (`ADMIN` / `MANAGER`) |
| :--- | :--- | :--- |
| **Primary Route** | `/panel` | `/manage` |
| **System Permission Scope** | Universal Wildcard (`*`) | Defined Operations Array (`ADMIN_PERMS`) |
| **Platform Branding & Settings** | **Full Access** (Company Name, Logo, Favicon sync, Currency, SMTP, Contact Info) | **Hidden / No Access** |
| **Role & Permission Management (RBAC)**| **Full Access** (Create, edit, and assign roles & granular permissions) | **Hidden / No Access** |
| **User & Staff Account Control** | Full CRUD (Create, Edit, Deactivate, **Hard Delete**) | View Only / Manage Customer Profiles (No delete, no role changes) |
| **Property Operations** | Create, Edit, **Hard Delete**, Direct Approval, Feature Pinning | Review, Approve, or Reject Submissions (No hard deletion of system catalogs) |
| **Property Types & Taxonomies** | **Full Control** (Add/Edit categories like Villa, Apartment, Plot, Commercial) | View taxonomy only |
| **Lead & CRM Management** | Full visibility across all agency leads, reassign any lead, delete leads | Manage incoming leads, add follow-up notes, convert to bookings, assign agents |
| **Payment & Invoice Approval** | Verify payments, finalize transactions, generate & issue **Official Invoices** | Review payment proofs, verify status, generate invoices |
| **Commission Payouts** | Set commission tiers, authorize monetary disbursements | Review agent performance and commission calculations |
| **System Audit Trail** | Full System Audit Log (`/panel/activity`) with IP & User-Agent tracking | Operational Activity Log (`/manage/activity`) |

---

### Detailed Persona Descriptions

#### 👑 Super Admin (`SUPER_ADMIN`)
- **Role Purpose:** Platform owner, C-level executive, or technical director.
- **Responsibilities:**
  - Manages global settings that affect the entire application (branding, favicons, logos, currencies, notification gateways).
  - Configures security roles, assigning or revoking fine-grained permissions (`users.create`, `properties.approve`, `transactions.manage`, etc.).
  - Has unconstrained authority over all database records with permanent deletion privileges.
  - Monitors high-level financial health, commission liabilities, and complete audit history.

#### 🛡️ Admin / Manager (`ADMIN`, `MANAGER`)
- **Role Purpose:** Real estate operations manager, branch head, or front-desk director.
- **Responsibilities:**
  - Operates day-to-day business workflows: vetting property submissions, assigning incoming leads to brokers, confirming site visit slots, and validating customer payment slips.
  - **Does not** have access to system configuration, RBAC editing, or destruction of core taxonomies.
  - Focuses on operational throughput: moving leads through the sales pipeline, ensuring tours are conducted, and supporting agents in closing transactions.

---

## 3. Comprehensive Panel Breakdown

```
                                  ┌───────────────────────────┐
                                  │      PrimeNest Platform   │
                                  └─────────────┬─────────────┘
          ┌──────────────────┬──────────────────┼──────────────────┬──────────────────┐
          ▼                  ▼                  ▼                  ▼                  ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│   Super Admin    ││  Admin / Manage  ││   Agent Portal   ││ Client Workspace ││  Public Website  │
│     `/panel`     ││    `/manage`     ││     `/agent`     ││     `/home`      ││       `/`        │
└──────────────────┘└──────────────────┘└──────────────────┘└──────────────────┘└──────────────────┘
```

---

### Panel 1: Super Admin Panel (`/panel`)
*Route Guard: Protected by `RequireAdmin` & token verification (`role === "SUPER_ADMIN"`).*

The Super Admin panel is the central control room of PrimeNest. It features an executive light 3D aesthetic with a clean, non-glowing command interface.

#### Key Features & Modules:

1. **Executive Dashboard (`/panel`)**
   - Real-time revenue counter, active listings count, leads pipeline metrics, and visit booking totals.
   - Quick visual charts for transaction trends and lead conversion velocity.
   - Quick Actions: Add new user, broadcast notification, inspect system logs.

2. **User Management (`/panel/users` & `/panel/users/:id`)**
   - Unified directory of all users (Super Admins, Admins, Managers, Agents, Staff, Customers, and Owners).
   - Filter by role, account status (`active`, `inactive`, `suspended`), or search by name/email/phone.
   - User detail drawer: Profile inspection, direct password reset, role reassignment, and account suspension toggle.

3. **Agents & Staff (`/panel/agents`)**
   - Detailed agent roster with accreditation data (license numbers, active listings count, total closed deals, commission tier).
   - Modal to onboard new agents or update broker details.

4. **Property Catalog Management (`/panel/properties`)**
   - Comprehensive master inventory of all listed properties across all locations.
   - Direct toggles for **Verification Status** (Verified badge), **Featured Property** status, and **Active/Inactive** status.
   - Create property modal with media upload, pricing, amenities, coordinates, and brochure uploads.
   - Ability to permanently delete or archive properties.

5. **Property Types Taxonomy (`/panel/property-types`)**
   - Configure architectural categories (e.g., *Luxury Villa, Penthouse, Residential Apartment, Commercial Office, Industrial Warehouse, Agricultural Land, Plot*).
   - Add custom slugs, category descriptions, and activate/deactivate types globally.

6. **Leads & Inquiries Pipeline (`/panel/leads`)**
   - Multi-view CRM: Switch between interactive **Kanban Board** stages (*New, Contacted, Interested, Follow-up, Converted, Lost*) and **Data Table**.
   - Lead assignment to any agent in the agency.
   - In-line follow-up notes modal featuring **Author Tracking** (clearly displays whether a note was logged by an **Admin** or an **Agent** with precise timestamps).
   - One-click Lead-to-Booking conversion.

7. **Site Visits & Tour Bookings (`/panel/bookings`)**
   - View, approve, reschedule, or cancel property tour bookings submitted by buyers or clients.
   - Assign/reassign escorting agents for physical or virtual property walkthroughs.
   - Calendar date-picker and status badges (*Pending, Confirmed, Completed, Cancelled*).

8. **Transactions & Invoicing Engine (`/panel/transactions`)**
   - Master financial registry of all property tokens, down payments, installments, and full purchases.
   - Payment status management (*Pending, Under Review, Paid, Refunded, Failed*).
   - **Automated Luxury Invoice System:**
     - Once payment is confirmed, an interactive **Invoice** action button activates.
     - **Invoice Modal Preview**: Shows high-end branded invoice with customer info, invoice number, payment method, tax/charges breakdown, and date.
     - **PDFKit Luxury PDF Download**: Generates and downloads a clean, printable vector PDF invoice with company headers, stamp, and legal disclosures.


10. **Reports & Business Intelligence (`/panel/reports`)**
    - Analytical breakdowns of monthly revenue, top-performing agents, most visited property types, and geographic demand.
    - Export tools to download CSV/Excel reporting summaries.

11. **System Roles & Permissions (RBAC) (`/panel/roles`)**
    - Visual permission matrix management.
    - Create new custom staff roles and select fine-grained checkboxes from the `PERMS` list.

12. **Agency Settings & Dynamic Branding (`/panel/settings`)**
    - Company profile: Name, tagline, official email, phone numbers, and physical office address.
    - **Logo & Favicon Manager**: Upload agency logo and favicon with instant real-time browser tab favicon update (`agency-settings-updated` custom events).
    - Currency formatters, commission defaults, and legal terms disclosures.

13. **Activity Logs & System Audit (`/panel/activity`)**
    - Immutable audit trail recording every administrative event: user logins, property modifications, status approvals, note additions, and permission updates.

---

### Panel 2: Admin & Manager Operations Panel (`/manage`)
*Route Guard: Protected by `RequireManager` & token verification (`role in ["SUPER_ADMIN", "ADMIN", "MANAGER"]`).*

The Operations Panel is tailored for high-efficiency daily real estate management without system-level distractions.

#### Key Features & Modules:

1. **Operations Dashboard (`/manage`)**
   - Operational KPIs: Pending property approvals, unassigned leads, scheduled tours for today, pending payment verifications.
   - Quick workflow shortcuts to expedite customer requests.

2. **Property Approvals & Inventory (`/manage/properties`)**
   - Filter and review submissions from property owners and agents.
   - Fast-action buttons to **Approve**, **Reject**, or request edits from sellers.
   - View detailed property specifications, legal documents, and uploaded media.

3. **Customer Database (`/manage/customers` & `/manage/customers/:id`)**
   - Comprehensive customer records for buyers and sellers.
   - View customer visit history, favorited homes, submitted inquiries, and transaction records.
   - Add internal operational notes to customer profiles.

4. **Agent Coordination (`/manage/agents`)**
   - Monitor field agent workloads, active assigned leads, and scheduled visit commitments.

5. **Leads Management (`/manage/leads`)**
   - Real-time inbound lead funnel.
   - Triage customer inquiries originating from the public website, assign them to available agents, and maintain chronological follow-up notes.

6. **Site Tour Scheduling (`/manage/bookings`)**
   - Confirm customer appointment requests for properties.
   - Coordinate with agents to ensure client accompaniment.

7. **Transactions & Verification (`/manage/transactions`)**
   - Review buyer payment slips, bank transfer references, or gateway transactions.
   - Change transaction statuses and print/view customer invoices upon approval.


9. **Operations Activity Log (`/manage/activity`)**
   - View operational event logs to ensure team accountability.

---

### Panel 3: Agent & Partner Portal (`/agent`)
*Route Guard: Protected by `RequireAgent` & token verification (`role in ["AGENT", "SUPER_ADMIN", "ADMIN"]`).*

Designed exclusively for real estate agents, brokers, and consultants to manage their portfolio and sales pipeline with zero clutter.

#### Key Features & Modules:

1. **Agent Command Dashboard (`/agent`)**
   - Metrics tailored to the logged-in agent: Active assigned leads, scheduled visits this week, total portfolio value, and accumulated commission earnings.

2. **My Properties (`/agent/properties`)**
   - Directory of properties assigned to or listed by the agent.
   - Add new listing wizard: Submit property details to Admin for catalog approval.
   - Track live listing status: *Draft, Under Review, Active, Sold*.

3. **Leads & CRM (`/agent/leads`)**
   - Isolated CRM view showing only leads assigned to the authenticated agent (`agentScope` isolation).
   - Drag-and-drop or select stage transitions (*New ➔ Contacted ➔ Interested ➔ Converted*).
   - Add follow-up notes directly to the lead. Notes automatically store the agent's name and role badge for transparent team communication.
   - Direct call/WhatsApp integration links to contact prospects immediately.

4. **Visits & Tour Schedule (`/agent/bookings`)**
   - Calendar of customer appointments assigned to the agent.
   - Complete site visits: Update tour status to *Completed* and record visit feedback.



6. **Agent Profile & Bio (`/agent/profile`)**
   - Customize public-facing profile displayed on the public `/agents` page.
   - Update contact phone, experience level, biography, and profile photo.

---

### Panel 4: Client & Customer Workspace (`/home`)
*Route Guard: Protected by `RequireClient` (`role in ["CUSTOMER", "OWNER", "AGENT", "MANAGER", "ADMIN", "SUPER_ADMIN"]`).*

A modern, dual-mode client portal where users can seamlessly switch between **Buyer Mode** and **Seller Mode** with a single click.

```
       ┌────────────────────────────────────────────────────────┐
       │             Client Workspace (/home)                   │
       ├───────────────────────────┬────────────────────────────┤
       │     🏠 Buyer Mode         │      🏷️ Seller Mode         │
       ├───────────────────────────┼────────────────────────────┤
       │ • Tour Bookings Tracker   │ • Property Listing Wizard  │
       │ • Saved / Favorite Homes  │ • Managed Real Estate      │
       │ • Invoices & Receipts     │ • Inbound Buyer Inquiries  │
       │ • Property Preferences    │ • Sale Transaction Records │
       └───────────────────────────┴────────────────────────────┘
```

#### A. Buyer Mode (`mode === "buying"`)
- **Dashboard Overview (`/home/dashboard`)**: Upcoming site visit countdowns, total saved homes counter, and recommended matches.
- **Saved Properties (`/home/favorites`)**: Live bookmarking list of luxury properties with immediate price updates and direct "Schedule Visit" buttons.
- **My Bookings (`/home/my-bookings`)**: Status of all booked property visits (scheduled date/time, escorting agent info, and cancellation options).
- **Transactions & Receipts (`/home/transactions`)**: History of payments made for tokens or bookings, with downloadable PDF invoice receipts.
- **Profile & Alerts (`/home/profile`)**: Update personal details, contact preferences, and WhatsApp property alert subscriptions.

#### B. Seller / Property Owner Mode (`mode === "selling"`)
- **Seller Dashboard (`/home/dashboard`)**: Listing view counters, pending buyer inquiries, and property review statuses.
- **My Properties (`/home/my-properties`)**: Overview of all properties owned and listed by the client, displaying real-time review status (*Pending Approval, Published, Under Offer, Sold*).
- **Add Property Wizard (`/home/add-property`)**: User-friendly multi-step submission form allowing owners to list their apartments, plots, or villas with photo uploads, price, and amenities.
- **Visit Requests & Leads (`/home/seller-leads`)**: View inquiries and tour requests made by potential buyers specifically for the owner's properties.
- **Sale Transactions (`/home/transactions`)**: Track payment milestones received from buyers.

---

### Panel 5: Public Web Platform & Discovery Portal (`/`)
*Open Access for all prospective property buyers, investors, and visitors.*

A luxury architectural experience crafted with responsive layouts, smooth micro-interactions, and comprehensive real estate tools.

#### Key Features & Pages:

1. **Hero & Landing Page (`/`)**
   - High-impact luxury real estate presentation with curated architectural features.
   - Interactive Blueprint Spotlight Grid & Sonar Pulse animations.
   - Curated collections: Featured luxury villas, waterfront apartments, and prime investment plots.
   - Live Testimonial Carousel fed directly from real MongoDB customer reviews.
   - Dynamic Agency Statistics Counter (satisfied buyers, verified listings, active agents).

2. **Property Directory & Advanced Filter (`/properties`)**
   - Search by keyword, city, property type, price range slider, and bedroom count.
   - Filter by listing intent (*Buy vs Rent*), ready-to-move status, or verified badge.
   - Grid and List layout switcher with smooth sorting options.

3. **Property Details Showcase (`/property/:id`)**
   - Ultra-high-resolution image galleries and interactive floor plan views.
   - Key specifications: Square footage, RERA registration numbers, furnishing status, and parking slots.
   - **Interactive Schedule a Visit Modal**: Directly creates a lead and booking in the database for instant Admin assignment.
   - **Integrated Mortgage / EMI Calculator**: Real-time principal, interest rate, and tenure calculation.
   - **Verified Reviews & Rating System**: Visitors and buyers can submit 5-star ratings and written reviews which persist to MongoDB and render immediately.



---

## 4. Technical Architecture & Security Model

### Authentication & Token Flow
- **JSON Web Tokens (JWT)**: Issued on `/api/auth/login` and stored in secure HTTP-only cookies as well as Bearer headers.
- **Bcrypt Password Encryption**: Salt rounds of 10 applied automatically via Mongoose pre-save hooks.
- **Brute-Force Rate Limiting**: Configured with `express-rate-limit` (100 attempts per 15 min on login; strict 10 attempts per 15 min on forgot-password endpoints).

### Role-Based Access Control (RBAC) Architecture
```javascript
// Hierarchical permission evaluation in middleware/auth.js:
1. If user.role === "SUPER_ADMIN" -> Grant full access immediately (wildcard "*")
2. Retrieve roleRef.permissions or query Role model for user.role
3. Check if permissions array contains requested action (e.g., "properties.approve")
4. If missing -> HTTP 403 Forbidden with clear permission requirement
```

### Database Schema Highlights (Mongoose)
- **User**: Name, email, password hash, role (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `AGENT`, `STAFF`, `CUSTOMER`, `OWNER`), status, preferences, favorites array.
- **Property**: Title, description, slug, type, price, location, bedrooms, bathrooms, area, amenities, images, status (`available`, `pending`, `sold`), verification status, reviews array with ratings.
- **Lead**: Name, email, phone, property reference, source, stage, assigned agent reference, chronological notes array with author tracking.
- **Booking**: Property reference, user reference, assigned agent, date, time slot, tour type (in-person/virtual), approval status, notes.
- **Transaction**: Property, buyer, seller, amount, payment method, payment status, transaction ID, invoice details.
- **Commission**: Transaction reference, agent reference, percentage rate, commission amount, payout status.
- **Settings**: Dynamic company name, tagline, email, phone, logo URL, favicon URL, currency, SMTP configuration.

---

## 5. Summary of Recent Enhancements

1. **Follow-Up Notes Author Identification**:
   - Super Admin and Admin lead pipelines now prominently display an **Admin** vs **Agent** author badge with exact timestamps on every note, preventing communication confusion.
2. **Luxury Invoice & PDF Engine**:
   - When a Super Admin or Admin confirms payment on a transaction, an **Invoice** button appears. It opens an invoice modal preview and enables one-click PDF generation via PDFKit.
3. **Property Reviews & Testimonials Pipeline**:
   - Fixed and verified review submission on property pages; reviews save to MongoDB and dynamically populate the public testimonial carousel.
4. **Refined UI & Icon Aesthetics**:
   - Removed intense pulsating glowing borders from sidebar icons, restoring an executive, crisp aesthetic with subtle neutral borders (`#E2E8F0`) across all five panels.

---
*Report compiled for PrimeNest Real Estate Platform documentation.*
