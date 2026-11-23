import { Routes, Route } from "react-router-dom";

import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrderManagement from "./pages/OrderManagement";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductManagement from "./pages/ProductManagement";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStatistics from "./pages/AdminStatistics";
import CategoryManagement from "./pages/CategoryManagement";
import PaymentSimulation from "./pages/PaymentSimulation";
import BrandManagement from "./pages/BrandManagement";
import UserManagement from "./pages/UserManagement";
import VoucherManagement from "./pages/VoucherManagement";
import VoucherShop from "./pages/VoucherShop";

function App() {
  return (
    <Routes>
      {/* KHU VỰC KHÁCH HÀNG */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/categories" element={<Categories />} />

        <Route path="/brands" element={<Brands />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/orders/:id" element={<OrderDetail />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/payment/:id" element={<PaymentSimulation />} />

        <Route path="/vouchers" element={<VoucherShop />} />
      </Route>

      {/* KHU VỰC ADMIN */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/products" element={<ProductManagement />} />

          <Route path="/admin/orders" element={<OrderManagement />} />

          <Route path="/admin/products/create" element={<ProductForm />} />

          <Route path="/admin/products/:id/edit" element={<ProductEdit />} />

          <Route path="/admin/statistics" element={<AdminStatistics />} />

          <Route path="/admin/categories" element={<CategoryManagement />} />

          <Route path="/admin/brands" element={<BrandManagement />} />

          <Route path="/admin/users" element={<UserManagement />} />

          <Route path="/admin/vouchers" element={<VoucherManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
