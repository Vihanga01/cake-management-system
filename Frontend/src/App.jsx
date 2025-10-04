import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import AddCake from "./pages/cake_management/AddCake";
import CakeList from "./pages/cake_management/CakeList";
import EditCake from "./pages/cake_management/EditCake";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="app">
        {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
        <Routes>
          <Route path="/" element={<Home setShowLogin={setShowLogin} />} />
          <Route path="/products" element={<Products setShowLogin={setShowLogin} />} />
          <Route path="/cart" element={<Cart setShowLogin={setShowLogin} />} />
          <Route path="/checkout" element={<Checkout setShowLogin={setShowLogin} />} />
          <Route path="/thank-you" element={<ThankYou setShowLogin={setShowLogin} />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="addcake" element={<AddCake />} />
            <Route path="cakelist" element={<CakeList />} />
            <Route path="editcake/:id" element={<EditCake />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer />
    </>
  );
};

export default App;
