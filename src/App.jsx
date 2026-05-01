import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';
import HealthTips from './pages/HealthTips';
import HealthTipDetail from './pages/HealthTipDetail';

import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductList from './pages/admin/AdminProductList';
import AdminProductDetail from './pages/admin/AdminProductDetail';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategoryList from './pages/admin/AdminCategoryList';
import AdminUnitList from './pages/admin/AdminUnitList';
import AdminExpiredItemList from './pages/admin/AdminExpiredItemList';
import AdminReorderAlerts from './pages/admin/AdminReorderAlerts';
import AdminPurchaseList from './pages/admin/AdminPurchaseList';
import AdminPurchaseForm from './pages/admin/AdminPurchaseForm';
import AdminSupplierList from './pages/admin/AdminSupplierList';
import AdminPromotionList from './pages/admin/AdminPromotionList';
import AdminPromotionForm from './pages/admin/AdminPromotionForm';
import AdminPOS from './pages/admin/AdminPOS';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminHealthTipList from './pages/admin/AdminHealthTipList';
import AdminHealthTipForm from './pages/admin/AdminHealthTipForm';
import AdminHealthTipDetail from './pages/admin/AdminHealthTipDetail';
import AdminReports from './pages/admin/AdminReports';
import AdminProfitLoss from './pages/admin/AdminProfitLoss';
import AdminTopProfitableProducts from './pages/admin/AdminTopProfitableProducts';

const PublicLayout = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main key={location.pathname} className="flex-grow page-transition">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<UserProfile />} />
          <Route path="/health-tips" element={<HealthTips />} />
          <Route path="/health-tips/:id" element={<HealthTipDetail />} />
          <Route path="/about" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">About Us</h1><p className="mt-4">Page coming soon...</p></div>} />
          <Route path="/contact" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Contact Us</h1><p className="mt-4">Page coming soon...</p></div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div className="container mx-auto p-8 text-center py-20"><h1 className="text-4xl font-bold text-red-500">404</h1><p className="mt-4 text-slate-500">The page you are looking for does not exist.</p><Link to="/" className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded-lg">Back to Home</Link></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - No Public Navbar/Footer */}
        <Route path="/admin/*" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pos" element={<AdminPOS />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="profit-loss" element={<AdminProfitLoss />} />
            <Route path="top-profitable" element={<AdminTopProfitableProducts />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/:id" element={<AdminProductDetail />} />
            <Route path="products/create" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategoryList />} />
            <Route path="units" element={<AdminUnitList />} />
            <Route path="expired" element={<AdminExpiredItemList />} />
            <Route path="reorder-alerts" element={<AdminReorderAlerts />} />
            <Route path="purchases" element={<AdminPurchaseList />} />
            <Route path="purchases/create" element={<AdminPurchaseForm />} />
            <Route path="suppliers" element={<AdminSupplierList />} />
            <Route path="inventory" element={<div className="p-8"><h2 className="text-2xl font-bold">Inventory Control</h2><p className="text-slate-500">Coming soon...</p></div>} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="promotions" element={<AdminPromotionList />} />
            <Route path="promotions/create" element={<AdminPromotionForm />} />
            <Route path="promotions/view/:id" element={<AdminPromotionForm />} />
            <Route path="promotions/edit/:id" element={<AdminPromotionForm />} />
            <Route path="health-tips" element={<AdminHealthTipList />} />
            <Route path="health-tips/create" element={<AdminHealthTipForm />} />
            <Route path="health-tips/edit/:id" element={<AdminHealthTipForm />} />
            <Route path="health-tips/:id" element={<AdminHealthTipDetail />} />
            <Route path="users" element={<div className="p-8"><h2 className="text-2xl font-bold">User & Staff Control</h2><p className="text-slate-500">Coming soon...</p></div>} />
            <Route path="messages" element={<div className="p-8"><h2 className="text-2xl font-bold">Contact Messages</h2><p className="text-slate-500">Coming soon...</p></div>} />
            <Route path="logs" element={<div className="p-8"><h2 className="text-2xl font-bold">Activity Audit Logs</h2><p className="text-slate-500">Coming soon...</p></div>} />
            <Route path="settings" element={<div className="p-8"><h2 className="text-2xl font-bold">Branding & Settings</h2><p className="text-slate-500">Coming soon...</p></div>} />
          </Route>
        </Route>

        {/* Public Routes with Navbar/Footer */}
        <Route path="*" element={<PublicLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
