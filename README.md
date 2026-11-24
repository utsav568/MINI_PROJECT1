# 🚗 CarRental PRO — AI-Powered Luxury & Fleet Car Rental Platform (MERN Stack)

A production-ready, full-stack **Car Rental Booking Web Application** built with the **MERN Stack (MongoDB, Express.js, React 19, Node.js)**, **Tailwind CSS**, **ImageKit** media optimization, and an integrated **Google Gemini AI Assistant** connected to real-time car inventory.

---

## 🌟 Key Features

### 👤 Customer Experience
* **JWT Authentication & Security:** Secure registration, login, and authorization with bcrypt password hashing and token signature validation.
* **Vehicle Discovery & Smart Filters:** Filter fleet by body category (SUV, Sedan, Luxury, Electric, Van), fuel type, transmission (Manual, Automatic), pickup city, and dynamic daily price slider.
* **Car Details & Live Calculation:** View high-resolution ImageKit photos, seating capacity, full specifications, and automatic live price calculation based on chosen dates.
* **Instant Booking & Double-Booking Prevention:** Strict backend conflict detection preventing duplicate reservations for overlapping dates.
* **Test Payment Integration:** Verified payment flow with backend HMAC SHA256 signature verification (Razorpay integration in test and live mode).
* **Booking Management & Cancellation:** Track active trips and view complete booking history. Seamless one-click cancellation with automated refund status.
* **Profile Management:** Edit personal profile details, contact phone, home address, and upload avatar photos via ImageKit.
* **Contact & FAQ Center:** Interactive help desk with concierge messaging and expandable FAQ accordion.

### 🤖 "Car AI Assistant" (Gemini AI Concierge)
* **Floating AI Chatbot:** Available on every page across the platform with quick prompt pills.
* **Real MongoDB Inventory Integration:** The AI Assistant grounds its recommendations strictly in live database fleet data — never generating hallucinated cars or fake prices.
* **Intelligent Recommendations:** Suggests ideal cars tailored to user budget, passenger count, preferred body category, or trip destination.
* **Interactive Car Cards in Chat:** Recommends vehicles with direct preview cards linking straight to the car reservation page.
* **Graceful Fallbacks:** Provides informative messages if the AI service key is not configured.

### 🛠️ Admin & Host Dashboard
* **Real-Time Analytics:** Total registered users, total vehicles, total bookings, and monthly/total revenue metrics.
* **Visual Charts:** 6-month revenue and booking trend bar charts and category distribution metrics.
* **Fleet Management:** Add new vehicles with ImageKit upload, edit existing vehicle specifications, toggle availability, and delete cars.
* **User Management:** View all registered accounts, promote users to Hosts/Admins, and manage security access.
* **Booking Control:** Review customer reservations and update booking status (`pending`, `confirmed`, `cancelled`, `completed`).

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide React, Axios, React Hot Toast, React Router v7 |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose, Multer, ImageKit SDK, Razorpay SDK, Crypto, Dotenv |
| **Database** | MongoDB Atlas (30+ live car records with ImageKit CDN media) |
| **AI Integration** | Google Gemini API (Direct REST / `@google/genai` with live DB grounding) |
| **Media Storage** | ImageKit.io (Automatic WebP conversion, auto-compression & CDN delivery) |

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```env
PORT=3000
MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.mongodb.net'
JWT_SECRET=your_jwt_secret_key

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY='your_imagekit_public_key'
IMAGEKIT_PRIVATE_KEY='your_imagekit_private_key'
IMAGEKIT_URL_ENDPOINT='https://ik.imagekit.io/your_id'

# Google Gemini API Key (Get free from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_id
RAZORPAY_KEY_SECRET=your_test_secret
```

### Frontend (`client/.env`)
```env
VITE_CURRENCY=$
VITE_BASE_URL=http://localhost:3000
```

---

## 🚀 Running the Project Locally

### 1. Start Backend Server
```bash
cd server
npm install
npm run server
```
Server runs on `http://localhost:3000`.

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

---

## 🛡️ Security & Reliability Highlights
1. **JWT Verification:** Upgraded from `jwt.decode` to strict cryptographic `jwt.verify`.
2. **Conflict Checking:** Date overlap logic ignores cancelled reservations, freeing up slots immediately upon cancellation.
3. **Payment Security:** Payments are never assumed successful unless verified by the backend server using cryptographic HMAC signatures.
4. **Environment Isolation:** All sensitive keys (Gemini, ImageKit, Razorpay, MongoDB) are strictly kept on the server and never exposed to client code.
