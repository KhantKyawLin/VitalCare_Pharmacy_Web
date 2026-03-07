import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/orders" element={<UserProfile />} />
            <Route path="/health-tips" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Health Tips</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="/about" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">About Us</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="/contact" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Contact Us</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<div className="container mx-auto p-8 text-center"><h1 className="text-4xl font-bold text-red-500">404</h1><p className="mt-4">Page not found</p></div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
