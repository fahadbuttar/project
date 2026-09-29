# VoltManage - Frontend Web Application

Modern, high-performance Point of Sale (POS) and inventory management web dashboard for electric hardware retail and wholesale stores. Built with **React 18, Vite, React Router v6, Tailwind CSS, TanStack Query, and React Hook Form**.

---

## 🚀 Key Features

- **Point of Sale (POS) Terminal**:
  - Live search across products and brands with instant category filtering.
  - Dynamic switching between **Retail** and **Wholesale** pricing mode.
  - Real-time cart calculations (subtotal, percentage/fixed discounts, cash paid, credit balance).
  - Walk-in cash sales and registered customer credit sales.
  - Thermal / A4 printable sales receipts and quotation slips (`window.print()`).
- **Product & Inventory Catalog**:
  - Comprehensive hardware catalog tracking cost price, retail price, wholesale price, and unit types (`pcs`, `meter`, `coil`, `box`, `packet`, `feet`, `set`).
  - Low stock warning badges and safety threshold configuration.
  - Inline modal for instant price updates.
  - Atomic stock adjustment modal with required audit reason logs.
  - Nested category creation modal.
- **Sales & Order Management**:
  - List and filter all invoices by status (`PENDING`, `DELIVERED`, `CANCELLED`).
  - 1-click status fulfillment ("Mark as Delivered").
  - Atomic order cancellation with automatic product restocking.
- **Customer Quotation Estimator**:
  - Draft quotations that calculate price estimations without affecting stock.
  - 1-click conversion from draft quotation into an official sales invoice with stock deduction and invoice numbering.
- **Stock Audit Logs**:
  - Paginated immutable history of all inventory movements.
  - Filters by product, reason, and date ranges.
- **Customer Directory & Credit Ledger**:
  - Customer directory with Pakistani 11-digit mobile validation (`03001234567`).
  - Remaining credit balance tracking.
- **Multilingual AI Voice Assistant**:
  - In-browser microphone audio recording using the native `MediaRecorder` API.
  - Voice queries in Roman Urdu, Urdu, and English (e.g. *"fan ka stock kitna hai?"*).
  - Live AI transcription and inventory stock level display.
- **Role-Based Access Control (RBAC)**:
  - **OWNER**: Full store control, inventory management, POS billing, and staff cashier onboarding.
  - **CASHIER**: Daily store operations, POS sales, quotation generation, and stock search.
  - **ADMIN**: Super admin SaaS management to view all registered shop tenants and activate or extend 30-day subscriptions.
- **Enterprise UX & Security**:
  - Dual authentication: HTTP-only cookies + Bearer token fallback.
  - Automatic 401 token refresh queue with loop protection.
  - Global React error boundary with fallback recovery and 404 page.
  - Brute force rate limit error handling (5 attempts / 15 minutes).

---

## 🛠 Tech Stack

- **Build**: Vite 5 / 6
- **UI Framework**: React 18 (functional components + hooks)
- **Routing**: React Router DOM v6 (lazy loading + route-based code splitting)
- **Server State**: `@tanstack/react-query` v5
- **Styling**: Tailwind CSS v3 with Plus Jakarta Sans typography
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request & response interceptors
- **Form Handling**: React Hook Form + Zod validators
- **Audio API**: Web Audio & MediaRecorder API

---

## 📦 Project Structure

```
frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── .env
├── .env.example
└── src/
    ├── api/
    │   ├── axiosClient.js          # Centralized Axios with auto-refresh queue
    │   ├── authService.js          # Authentication & staff onboarding
    │   ├── productService.js      # Products catalog, stock adjust, low stock
    │   ├── categoryService.js      # Category management & local catalog sync
    │   ├── orderService.js        # Sales orders, quotations, and stock audit logs
    │   ├── customerService.js      # Customer directory & credit tracking
    │   ├── aiService.js            # Multilingual voice AI query
    │   └── adminService.js         # Super admin shop subscription licensing
    ├── components/
    │   ├── common/                 # Button, Input, Select, Modal, Badge, Card, Table, Pagination, Spinner, EmptyState, ConfirmDialog, ErrorBoundary
    │   ├── layout/                 # AppLayout, Navbar, Sidebar, SubscriptionBanner
    │   └── ui/                     # StatCard, VoiceRecorder, PrintableInvoice
    ├── context/
    │   ├── AuthContext.jsx         # User session, login, register, roles
    │   ├── ToastContext.jsx        # Unified success/error/warning alerts
    │   └── CartContext.jsx         # POS cart calculations & state
    ├── pages/
    │   ├── auth/                   # LoginPage, RegisterPage
    │   ├── dashboard/              # DashboardPage
    │   ├── pos/                    # PosPage
    │   ├── products/               # ProductsPage, CreateProductModal, EditProductModal, StockAdjustModal, CreateCategoryModal
    │   ├── orders/                 # OrdersPage, QuotationsPage, ConvertQuotationModal
    │   ├── inventory/              # StockLogsPage
    │   ├── customers/              # CustomersPage, CreateCustomerModal
    │   ├── staff/                  # StaffPage
    │   ├── ai/                     # AiAssistantPage
    │   ├── admin/                  # AdminShopsPage
    │   ├── profile/                # ProfilePage
    │   └── NotFoundPage.jsx
    ├── routes/
    │   ├── AppRoutes.jsx           # Lazy-loaded route map
    │   ├── ProtectedRoute.jsx      # Authentication guard
    │   └── RoleRoute.jsx           # RBAC permission guard
    ├── utils/
    │   ├── formatters.js           # Currency, dates, phone, error formatting
    │   └── validators.js           # Regex patterns
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `/frontend` directory:

```env
# API Base URL (defaults to /api/v2 through Vite proxy to http://localhost:3001)
VITE_API_BASE_URL=/api/v2
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`. Requests to `/api` are automatically proxied to the backend at `http://localhost:3001`.

### 3. Production Build
```bash
npm run build
npm run preview
```
