import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Route-based code splitting (lazy loading)
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'));
const PosPage = lazy(() => import('../pages/pos/PosPage.jsx'));
const ProductsPage = lazy(() => import('../pages/products/ProductsPage.jsx'));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage.jsx'));
const QuotationsPage = lazy(() => import('../pages/orders/QuotationsPage.jsx'));
const StockLogsPage = lazy(() => import('../pages/inventory/StockLogsPage.jsx'));
const CustomersPage = lazy(() => import('../pages/customers/CustomersPage.jsx'));
const StaffPage = lazy(() => import('../pages/staff/StaffPage.jsx'));
const AiAssistantPage = lazy(() => import('../pages/ai/AiAssistantPage.jsx'));
const AdminShopsPage = lazy(() => import('../pages/admin/AdminShopsPage.jsx'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Spinner size="lg" label="Loading screen..." />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Guest Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Authenticated Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          <Route path="/inventory/logs" element={<StockLogsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/ai-assistant" element={<AiAssistantPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Owner Only Routes */}
          <Route
            path="/staff"
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <StaffPage />
              </RoleRoute>
            }
          />

          {/* Super Admin Only Routes */}
          <Route
            path="/admin/shops"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminShopsPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
