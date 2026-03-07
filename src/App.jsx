import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Products Page</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="/health-tips" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Health Tips</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="/about" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">About Us</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="/contact" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Contact Us</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="/login" element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Login</h1><p className="mt-4">Component coming soon...</p></div>} />
            <Route path="*" element={<div className="container mx-auto p-8 text-center"><h1 className="text-4xl font-bold text-red-500">404</h1><p className="mt-4">Page not found</p></div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
