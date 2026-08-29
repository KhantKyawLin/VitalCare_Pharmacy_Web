# 💊 Vital Care Pharmacy - Modern React Web Application & POS

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Echo](https://img.shields.io/badge/Real--Time-Laravel_Echo-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/docs/broadcasting)

A high-performance, accessible Single Page Application (SPA) providing an **Omnichannel Pharmacy Experience**—integrating a customer-facing e-commerce portal, an in-store **Walk-in Point of Sale (POS)** with hardware barcode scanner support, and a specialized **Pharmacist Prescription Review Queue**.

---

## 🚀 Key Modules & Interactive Features

### 1. 🛒 In-Store Point of Sale (POS) & Barcode Scanner
* **Hardware Keyboard-Wedge Scanner Integration:** Custom `useBarcodeScanner` hook that captures rapid keystroke inputs from physical USB/Bluetooth barcode scanners without requiring user focus on input fields.
* **Instant Calculation & Promotions:** Real-time cart calculations including automatic promo deductions and original vs. discounted price comparisons.
* **Payment Modal & Thermal Receipts:** Supports Cash, QR, and Card payments with quick-denomination shortcuts and auto-calculated change return. Includes an 80mm thermal receipt voucher component that triggers automatically on checkout.

### 2. 🔍 Pharmacist Digital Prescription Queue & Interactive Viewer
* Dedicated review interface for orders containing regulated medications flagged with `RX Needed`.
* **Interactive Document Inspection Canvas:**
  * **Zoom Controls:** Variable 50% to 400% zoom capability to inspect fine-print doctor handwriting.
  * **Rotation:** 90° clockwise/counter-clockwise rotation to correct mobile photos taken sideways.
  * **Drag-to-Pan:** Smooth pan and drag behavior to freely inspect zoomed areas of high-resolution prescription images.
  * **Instant Actioning:** Direct Approval or Rejection with automated feedback.

### 3. 🔔 Real-Time Chronic Medication Refills
* Connected to **Laravel Echo / Reverb WebSockets** for live push notifications on private user channels.
* Interactive banner in the Customer Dashboard with **"⚡ Refill Now"** (1-click reorder and cart addition) and **"Skip"** dismissal actions.

### 4. 🛍️ Customer E-Commerce Storefront
* **Live Global Search:** Instant modal search previewing both pharmaceutical products and certified health tip articles.
* **Prescription Upload Checkout:** Seamless drag-and-drop prescription and payment proof upload directly during order placement.
* **User Dashboard:** Order timeline tracking, status badges, one-click past order re-ordering, and printable PDF invoices.

### 5. 📊 Comprehensive Admin & Inventory Management
* Inventory dashboard tracking stock levels, reorder alerts, and expiring batch warnings.
* Real-time activity logs, supplier management, and visual Profit & Loss financial statements.
* White-label branding controls to customize site logo, name, and contact metadata.

---

## 🛠️ Technology Stack & Dependencies

* **Core Framework:** React 18 (Vite Bundler)
* **Styling:** Tailwind CSS with standardized design tokens
* **Icons:** Lucide React & FontAwesome
* **Real-time WebSockets:** Laravel Echo & Pusher JS (Reverb Protocol)
* **HTTP Client:** Axios (Custom interceptor instance with JWT auth handling)
* **UI Alerts & Modals:** SweetAlert2
* **Animations:** AOS (Animate on Scroll) & Swiper.js

---

## 📁 Directory Architecture

```
frontend/src/
├── assets/          # Static icons, banners, and placeholders
├── components/      # Reusable UI building blocks
│   ├── auth/        # Protected admin routes & password change enforcement
│   ├── common/      # Buttons, ProductCards, Modals, Printable vouchers
│   └── layout/      # Navbar, Footers, and responsive Admin/User sidebars
├── context/         # React Context state providers (Auth, Cart, Wishlist, Settings)
├── hooks/           # Custom hooks (e.g., useBarcodeScanner)
├── pages/           # Customer pages (Products, Cart, Checkout, FAQ, HealthTips)
│   ├── admin/       # Management pages (POS, Orders, PrescriptionQueue, Reports)
│   └── user/        # Customer dashboard, Order history, and settings
└── utils/           # Axios API instance, Echo websocket client, and toast helpers
```

---

## 💻 Local Setup & Development

### Prerequisites
* Node.js >= 18.x
* npm or yarn
* Running backend API server ([Backend Repository](https://github.com/KhantKyawLin/VitalCare_Pharmacy_Backend.git))

### 1. Clone the repository
```bash
git clone https://github.com/KhantKyawLin/VitalCare_Pharmacy_Web.git
cd VitalCare_Pharmacy_Web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the frontend folder:
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_STORAGE_URL=http://127.0.0.1:8000/storage

# Reverb WebSockets Configuration
VITE_REVERB_APP_KEY=vitalcare_key
VITE_REVERB_HOST="localhost"
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME="http"
```

### 4. Run the Development Server
```bash
npm run dev
```

The application will be live at `http://localhost:5173`.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
