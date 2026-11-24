# SmartDrive AI — AI-Powered Location-Based Car Rental & Doorstep Delivery Platform
## Master Technical Specification, Architecture & Production Documentation

---

### Executive Summary
**SmartDrive AI** is a production-grade, full-stack MERN application transformed from a baseline car rental tutorial into an enterprise-style platform featuring:
- **Geospatial Intelligence:** Browser Geolocation API, reverse geocoding, real Haversine distance calculations, interactive Leaflet maps, and doorstep delivery routing.
- **Strict Concurrency & Overlap Prevention:** Backend database validation and atomic in-memory mutex locking (`acquireCarLock`) preventing double-booking during simultaneous requests, returning the exact message: `"This car is already booked for these dates. Please select another date or car."`
- **Real-Time Notification & Management Engine:** Socket.IO bidirectional events for instant admin booking alerts, live status updates (`pending`, `confirmed`, `rejected`, `cancelled`, `completed`), and a navbar alert bell with unread counters.
- **SmartDrive AI Assistant:** Google Gemini LLM integrated via a secure backend endpoint, grounded in real MongoDB fleet availability, pricing, and live customer distance.
- **Verified Reviews & Multi-Image Fleet:** Multi-photo interactive car galleries, customer review scores (1-5 ★) with verified trip badges, and admin review moderation.
- **Secure Payments & Image Optimization:** Razorpay test mode with server-side HMAC SHA256 signature verification, and ImageKit CDN image transformation with `<CarImage />` zero-broken-image fallbacks.

---

### Complete List of Implemented Features

#### 1. Customer Experience & Booking Lifecycle
- **Authentication & Security:** JWT-based user authentication, password hashing with bcryptjs, customer profile updates, and role-based permissions (`customer` vs `owner`/`admin`).
- **Fleet Discovery & Filters:** Real-time search across car brand, model, seating capacity (2-8 seats), transmission (Automatic, Manual, Semi-Automatic), fuel type (Petrol, Diesel, Electric, Hybrid), and category (SUV, Sedan, Van, Luxury, Electric).
- **Interactive Multi-Image Gallery:** Image switcher with full-size active image preview, thumbnails strip, and navigation controls on `/car-details/:id`.
- **14-Day Visual Availability Strip:** Real-time calendar displaying available dates, booked/locked dates, and today's date indicator.
- **Doorstep Car Delivery:** Toggle doorstep delivery, calculate dynamic delivery charges based on distance (₹15/km), and store customer coordinates and address.
- **Verified Customer Reviews & Ratings:** Customer review submission form on car details, verified trip badge, 1-5 star breakdown, and automated average rating re-calculation.

#### 2. Real-Time Availability & Race Condition Prevention
- **Date Overlap Prevention:** Backend query checks all non-cancelled bookings:
  $$\text{Overlap} \iff (\text{start} \le \text{existingEnd}) \land (\text{end} \ge \text{existingStart})$$
- **In-Memory Mutex Lock:** `acquireCarLock(carId)` ensures atomic serialized processing for simultaneous requests.
- **Standardized Error Message:** When an overlap occurs, the backend returns:
  `"This car is already booked for these dates. Please select another date or car."`
- **Dynamic Calendar Sync:** Emits `car_calendar_updated` via Socket.IO so other users viewing the same car see the calendar update instantly without refreshing.

#### 3. Real Location & Geolocation System
- **Browser Geolocation API:** Prompts user for GPS location permission with fallback to manual search.
- **Reverse Geocoding:** Converts latitude/longitude to readable street address using OpenStreetMap Nominatim.
- **Geographical Distance Calculation:** Implements the Haversine formula.
- **Proximity Sorting & Radius Filters:** Filter cars within 5 km, 10 km, 20 km, or 50 km of customer location.
- **Interactive Leaflet Map:** Displays customer pin and nearby car fleet pins with popups.

#### 4. SmartDrive AI Assistant
- **Automotive Concierge:** Floating chat widget on all pages with natural language processing powered by Google Gemini.
- **Grounded Inventory Context:** Feeds actual available vehicles from MongoDB with real distance, pricing, and specs into the system prompt.
- **Zero Hallucination:** Strict instructions to only recommend cars from inventory; indicates if cars are unavailable.
- **Resilient Fallback:** Displays helpful error notifications if the Gemini API key is missing or service is offline.

#### 5. Admin & Owner Dashboard
- **Fleet Overview & Analytics:** Total registered users, active fleet count, total bookings, monthly revenue charts, and category breakdown.
- **Live Booking Stream:** Real-time updates for new bookings via Socket.IO without page refresh.
- **1-Click Booking Decisions:** Confirm or Reject buttons with instant status propagation to customer dashboard.
- **Customer Phone Access Control:** Phone numbers and addresses are strictly protected by `protect` and `adminProtect` middleware.
- **Fleet Management:** Add new vehicles, upload images to ImageKit, edit specifications, and toggle availability.
- **Review Moderation Portal:** Dedicated `/owner/manage-reviews` view to monitor feedback, inspect verified trip reviews, and delete abusive reviews.

#### 6. Payments, Images & Notifications
- **Razorpay Integration:** Server-side order generation (`/api/bookings/create-razorpay-order`) and HMAC SHA256 signature verification (`/api/bookings/verify-razorpay-payment`).
- **ImageKit Optimization:** Multi-image uploads with automated WebP compression and CDN delivery.
- **`<CarImage />` Component:** Zero broken image icons; automatically renders sleek SVG vehicle silhouette fallback if image fails to load.
- **Real-Time Notification Center:** Notification bell in navbar with unread badge counter, soundless real-time toast alerts, and history dropdown.
- **Email Notifications:** Automated Nodemailer dispatch for new bookings, admin alerts, and status changes.

---

### Files Created and Modified

| File Path | Type | Key Enhancements / Purpose |
|---|---|---|
| `server/models/Car.js` | Modified | Added `images: [String]`, `ratingsAverage`, `ratingsCount`, `coordinates`, `locationGeo` (2dsphere). |
| `server/models/Booking.js` | Modified | Added `"rejected"` to status enum, added `deliveryFee`, `deliveryAddress`, `customerPhone`. |
| `server/models/Review.js` | Created | Review schema with `car`, `user`, `rating`, `comment`, `userName`, `isVerifiedTrip`. |
| `server/controllers/bookingController.js` | Modified | Added mutex concurrency locking, exact rejection message, Razorpay order/verify endpoints, and `getCarReservedDates`. |
| `server/controllers/reviewController.js` | Created | Endpoints for fetching car reviews, submitting reviews, admin all reviews, and deleting reviews. |
| `server/routes/reviewRoutes.js` | Created | Mounted review routes at `/api/reviews`. |
| `server/controllers/aiController.js` | Modified | Grounded Gemini AI prompt with live inventory, distance calculation, and SmartDrive AI branding. |
| `server/controllers/ownerController.js` | Modified | Multi-image support in `addCar` and `updateCar`, protected customer contact details. |
| `server/configs/socket.js` | Created | Socket.IO server initialization, room routing (`admin_room`, `user_:id`), and event emitters. |
| `server/services/emailService.js` | Created | Nodemailer SMTP service for customer confirmations and admin notifications. |
| `server/server.js` | Modified | Attached Socket.IO to HTTP server, mounted `/api/reviews`, initialized socket configs. |
| `server/.env.example` | Created | Full backend environment variable reference. |
| `client/src/context/AppContext.jsx` | Modified | Socket.IO client integration, notification store, unread counter, location states. |
| `client/src/components/Navbar.jsx` | Modified | Real-time notification bell dropdown, unread count badge, SmartDrive AI branding. |
| `client/src/components/Hero.jsx` | Modified | SmartDrive AI branding, GPS location detector pill, category quick filters. |
| `client/src/components/Footer.jsx` | Modified | SmartDrive AI brand info, updated copyright, links, and support details. |
| `client/src/components/CarAIAssistant.jsx` | Modified | SmartDrive AI Assistant branding, live customer location pill, prompt chips, inventory preview cards. |
| `client/src/components/CarImage.jsx` | Created | ImageKit and CDN image loader with graceful SVG vehicle fallback on broken images. |
| `client/src/pages/CarDetails.jsx` | Modified | Interactive multi-image gallery, 14-day availability calendar strip, customer reviews & ratings, doorstep delivery. |
| `client/src/pages/MyBookings.jsx` | Modified | Live Socket.IO status updates, rejected booking feedback, cancel modal. |
| `client/src/pages/owner/ManageBookings.jsx` | Modified | Real-time booking table, 1-click Confirm / Reject buttons, protected phone & delivery details. |
| `client/src/pages/owner/ManageReviews.jsx` | Created | Admin review moderation dashboard with ratings metrics and delete controls. |
| `client/src/pages/owner/AddCar.jsx` | Modified | Multi-image gallery URLs input and ImageKit upload. |
| `client/src/pages/owner/ManageCars.jsx` | Modified | Multi-image gallery editing support in update modal. |
| `client/src/components/owner/Sidebar.jsx` | Modified | Added Customer Reviews link and icon. |
| `client/src/App.jsx` | Modified | Registered `/owner/manage-reviews` route. |
| `client/.env.example` | Created | Frontend environment variable reference. |

---

### API Endpoints Reference

#### 1. Authentication & User (`/api/user`)
- `POST /api/user/register` — Register a new customer account.
- `POST /api/user/login` — User login & JWT generation.
- `GET /api/user/profile` — Get authenticated user details.
- `POST /api/user/update-profile` — Update name, phone, or avatar.

#### 2. Cars & Inventory (`/api/cars`)
- `GET /api/cars` — List all available cars with optional filters (category, location, price, seats).
- `GET /api/cars/:id` — Get detailed specifications, gallery images, and ratings for a single car.
- `GET /api/cars/locations` — Get distinct active fleet hub locations.

#### 3. Bookings & Concurrency (`/api/bookings`)
- `POST /api/bookings/create` — Create booking with atomic mutex lock and overlap check.
- `GET /api/bookings/my-bookings` — Customer booking history with delivery status.
- `POST /api/bookings/cancel` — Cancel a pending/confirmed booking.
- `GET /api/bookings/car-reserved-dates/:carId` — Returns all booked date intervals for availability calendar.
- `POST /api/bookings/create-razorpay-order` — Generate verified Razorpay test order.
- `POST /api/bookings/verify-razorpay-payment` — Verify HMAC SHA256 payment signature.

#### 4. Reviews & Ratings (`/api/reviews`)
- `GET /api/reviews/car/:carId` — Fetch verified customer reviews for a car.
- `POST /api/reviews/add` — Submit review with 1-5 star rating and comment (requires login).
- `GET /api/reviews/admin/all` — Admin list of all platform reviews across cars.
- `DELETE /api/reviews/admin/:reviewId` — Admin deletion of abusive review.

#### 5. SmartDrive AI Chatbot (`/api/ai`)
- `POST /api/ai/chat` — Conversational query grounded in live MongoDB inventory and customer distance.

#### 6. Owner / Admin Dashboard (`/api/owner`)
- `GET /api/owner/dashboard` — Platform statistics (users, cars, bookings, revenue, monthly trends).
- `GET /api/owner/cars` — Manage owner vehicles.
- `POST /api/owner/add-car` — Add new car with ImageKit image upload.
- `PUT /api/owner/update-car/:id` — Update car details and gallery images.
- `POST /api/owner/toggle-car` — Toggle availability on/off.
- `POST /api/owner/delete-car` — Delete car from fleet.
- `GET /api/owner/bookings` — All customer bookings with phone numbers and delivery details.
- `POST /api/owner/change-status` — Update booking status (`confirmed`, `rejected`, `completed`).

---

### Setup & Run Commands

#### Backend
```bash
cd server
npm install
npm run start
```
*Backend runs on `http://localhost:3000` with live Socket.IO server.*

#### Frontend
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

#### Production Build Verification
```bash
cd client
npm run build
```
*Verified clean build with 0 errors in ~10 seconds.*
