# Complete API-to-UI Mapping Matrix

Every single backend endpoint in the Electric Store backend is 100% covered by a corresponding frontend React screen, modal, or action. Nothing in the API is left disconnected.

---

## 1. User & Authentication Routes (`/api/v2/users`)

| Method | Endpoint | Frontend Service Function | Screen / Component | User Action / Trigger |
|---|---|---|---|---|
| `POST` | `/api/v2/users/register` | `authService.register(formData)` | `RegisterPage.jsx` | Submits shop registration form with owner credentials and avatar image file. Sets cookies & logs in. |
| `POST` | `/api/v2/users/register-staff` | `authService.registerStaff(formData)` | `StaffPage.jsx` (Modal) | Store Owner submits cashier onboarding form with avatar image. |
| `POST` | `/api/v2/users/login` | `authService.login(credentials)` | `LoginPage.jsx` | Submits login credentials (username/email + password). Handles rate limiter (429). |
| `POST` | `/api/v2/users/logout` | `authService.logout()` | `Navbar.jsx` | Profile dropdown -> "Log Out" button. Clears cookies and resets session. |
| `POST` | `/api/v2/users/refresh-token` | `authService.refreshToken()` | `axiosClient.js` | Triggered automatically by Axios response interceptor on 401 response; replays queued requests. |
| `POST` | `/api/v2/users/current-user` | `authService.getCurrentUser()` | `AuthContext.jsx`, `ProfilePage.jsx` | App initialization session check; Profile screen viewing current user info. |
| `POST` | `/api/v2/users/change-password` | `authService.changePassword(payload)` | `ProfilePage.jsx` | "Change Password" form submission with old & new password. |

---

## 2. Category Routes (`/api/v2/categories`)

| Method | Endpoint | Frontend Service Function | Screen / Component | User Action / Trigger |
|---|---|---|---|---|
| `POST` | `/api/v2/categories/create-category` | `categoryService.createCategory(payload)` | `CreateCategoryModal.jsx` | Available via "+ Category" button on `ProductsPage.jsx` or inline shortcut within `CreateProductModal.jsx`. |

---

## 3. Product Routes (`/api/v2/products`)

| Method | Endpoint | Frontend Service Function | Screen / Component | User Action / Trigger |
|---|---|---|---|---|
| `POST` | `/api/v2/products/create-product` | `productService.createProduct(payload)` | `CreateProductModal.jsx` | Submits new hardware product with cost, retail, wholesale prices, unit, and threshold. |
| `GET` | `/api/v2/products/search-product` | `productService.searchProducts(params)` | `ProductsPage.jsx`, `PosPage.jsx`, `DashboardPage.jsx` | Live search input and category filter dropdown; populates product list & POS catalog. |
| `PATCH` | `/api/v2/products/:id` | `productService.updateProduct(id, payload)` | `EditProductModal.jsx` | In `ProductsPage.jsx`, clicking edit icon updates retailPrice, wholesalePrice, costPrice, stockQuantity, or minStockThreshold. |
| `PATCH` | `/api/v2/products/:id/adjust-stock` | `productService.adjustStock(id, payload)` | `StockAdjustModal.jsx` | In `ProductsPage.jsx` and `DashboardPage.jsx`, adjusting stock delta (+ or -) with required audit reason. |
| `GET` | `/api/v2/products/low-stock` | `productService.getLowStock()` | `DashboardPage.jsx` | Dashboard metric card and critical low stock warning table with quick restock buttons. |

---

## 4. Customer Routes (`/api/v2/customers`)

| Method | Endpoint | Frontend Service Function | Screen / Component | User Action / Trigger |
|---|---|---|---|---|
| `POST` | `/api/v2/customers/create-customer` | `customerService.createCustomer(payload)` | `CreateCustomerModal.jsx` | Available on `CustomersPage.jsx`, `PosPage.jsx`, and `ConvertQuotationModal.jsx` to register customer with 11-digit phone. |

---

## 5. Orders & Quotations Routes (`/api/v2/orders`)

| Method | Endpoint | Frontend Service Function | Screen / Component | User Action / Trigger |
|---|---|---|---|---|
| `POST` | `/api/v2/orders/create-order` | `orderService.createOrder(payload)` | `PosPage.jsx` | Clicking "Confirm Sale & Generate Invoice" in POS terminal. Checks stock, calculates discount, handles cash/credit balance, and triggers `PrintableInvoice.jsx`. |
| `PATCH` | `/api/v2/orders/:orderId/cancel` | `orderService.cancelOrder(orderId)` | `OrdersPage.jsx` | Clicking cancel button on pending order. Triggers `ConfirmDialog.jsx` and restocks inventory products. |
| `PATCH` | `/api/v2/orders/:orderId/status` | `orderService.updateOrderStatus(orderId)` | `OrdersPage.jsx` | Clicking checkmark button transitions pending order to `DELIVERED`. |
| `POST` | `/api/v2/orders/quotation` | `orderService.createQuotation(payload)` | `PosPage.jsx` | Clicking "Save as Estimation Quotation" in POS terminal. Draft quotation without stock deduction. |
| `PATCH` | `/api/v2/orders/:quotationId` | `orderService.convertQuotationToInvoice(id, payload)` | `ConvertQuotationModal.jsx` | On `QuotationsPage.jsx`, clicking "Convert to Invoice" prompts for payment amount and customer, and creates official invoice. |
| `GET` | `/api/v2/orders/stocklogs` | `orderService.getStockLogs(params)` | `StockLogsPage.jsx` | Paginated audit log table with product, reason, and date range filters. |

---

## 6. AI Assistant Routes (`/api/v2/ai`)

| Method | Endpoint | Frontend Service Function | Screen / Component | User Action / Trigger |
|---|---|---|---|---|
| `POST` | `/api/v2/ai/query` | `aiService.queryVoice(audioBlob)` | `AiAssistantPage.jsx` (`VoiceRecorder.jsx`) | In-browser mic recording or audio upload. OpenAI transcribes Roman Urdu/Urdu/English, detects intent, and returns product stock quantities. |

---

## 7. Super Admin Routes (`/api/v2/admin`)

| Method | Endpoint | Frontend Service Function | Screen / Component | User Action / Trigger |
|---|---|---|---|---|
| `GET` | `/api/v2/admin/shops` | `adminService.getShops()` | `AdminShopsPage.jsx` | Super Admin portal loads all shops, owner contact information, and license status. |
| `PATCH` | `/api/v2/admin/shops/:id/activate` | `adminService.activateShop(id)` | `AdminShopsPage.jsx` | 1-click "Activate (30d)" button sets `subscriptionActive: true` and 30-day expiry. |
| `PATCH` | `/api/v2/admin/shops/:id/extend` | `adminService.extendSubscription(id)` | `AdminShopsPage.jsx` | 1-click "Extend (+30d)" button adds 30 days to existing or current expiry. |
