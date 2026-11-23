import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import { getAllOrders } from "../api/orderApi";
import { getUsers } from "../api/userApi";
import "./AdminDashboard.css";
function AdminDashboard() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  useEffect(() => {
    const loadProductCount = async () => {
      try {
        const result = await getProducts();

        const products = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        setProductCount(products.length);
      } catch (error) {
        console.error("Failed to load product count:", error);
      }
    };

    loadProductCount();
  }, []);

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const result = await getAllOrders();

        const orders = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        console.log("ALL ORDERS:", orders);

        console.log(
          "COMPLETED ORDERS:",
          orders
            .filter((item) => item.order?.status === "completed")
            .map((item) => ({
              id: item.order?._id,
              status: item.order?.status,
              totalAmount: item.order?.totalAmount,
            })),
        );

        setOrderCount(orders.length);

        const completedRevenue = orders
          .filter((item) => item.order?.status === "completed")
          .reduce(
            (total, item) => total + Number(item.order?.totalAmount || 0),
            0,
          );

        setRevenue(completedRevenue);
      } catch (error) {
        console.error("Failed to load order data:", error);
      }
    };

    loadOrderData();
  }, []);

  useEffect(() => {
    const loadUserCount = async () => {
      try {
        const result = await getUsers();

        const users = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        setUserCount(users.length);
      } catch (error) {
        console.error("Failed to load user count:", error);
      }
    };

    loadUserCount();
  }, []);
  return (
    <div className="admin-dashboard">
      <div className="dashboard-title">
        <h2>Thống kê</h2>
        <p>Tổng quan hoạt động của cửa hàng.</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span className="dashboard-card-label">Sản phẩm</span>

          <strong className="dashboard-card-value">{productCount}</strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">Đơn hàng</span>

          <strong className="dashboard-card-value">{orderCount}</strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">Người dùng</span>

          <strong className="dashboard-card-value">{userCount}</strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">Doanh thu</span>

          <strong className="dashboard-card-value">
            {revenue.toLocaleString("vi-VN")} ₫
          </strong>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
