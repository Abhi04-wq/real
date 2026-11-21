# Execution Task Checklist

- [x] Create mockBookingModel.js backend database schema with status, buyer text, and 3-installment matrices
- [x] Create mockBookingController.js backend handlers (send mock form, submit, admin approve, sandbox pay, lists)
- [x] Mount mock booking workflow API endpoints under /api/bookings/mock router
- [x] Integrate Agent Chat overlays with a "Send Mock Booking Form" trigger action
- [x] Lift property fetching to `Landingpage.jsx` and pass props to `FeaturedProjects.jsx` & `CompareProperties.jsx`
- [x] Add defaults for `amenities` and `rating` in `CompareProperties.jsx` to support dynamic properties and trigger "Mock Approve Document" actions
- [x] Add "Mock Bookings" tab to BuyerDashboard listing active transaction cards
- [x] Implement pre-filled text document submission modals in BuyerDashboard
- [x] Implement Sandbox Payment Escrow Gateway popup screens with Success button triggers in BuyerDashboard
- [x] Instantly calculate and display a 3-installment schedule payment matrix table once booked
- [x] Support dynamic Mock Legal Agreement generation as printable text file downloads
