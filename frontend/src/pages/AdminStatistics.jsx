import { useState, useEffect, useMemo } from "react";
import { getAllOrders } from "../api/orderApi";
import "./AdminStatistics.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
const formatVND = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;

export default function AdminStatistics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState("3months");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const result = await getAllOrders();

        console.log("Dữ liệu đơn hàng:", result.data);
        console.log("Chi tiết đơn hàng đầu tiên:", result.data?.[0]);
        console.log(
          "Các sản phẩm trong đơn hàng đầu tiên:",
          result.data?.[0]?.items,
        );
        setOrders(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="statistics-message">Đang tải dữ liệu thống kê...</div>
    );
  }

  if (error) {
    return <div className="statistics-message statistics-error">{error}</div>;
  }

  const countByStatus = (status) =>
    orders.filter((item) => item.order?.status === status).length;

  const completedOrders = orders.filter(
    (item) => item.order?.status === "completed",
  );

  const bestSellingProducts = (() => {
    const productMap = {};

    completedOrders.forEach((orderItem) => {
      (orderItem.items || []).forEach((item) => {
        const productId = item.product?._id || item.product || item.name;

        if (!productId) return;

        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: item.name || item.product?.name || "Sản phẩm không tên",
            quantity: 0,
            revenue: 0,
            image: item.product?.image || "",
          };
        }

        productMap[productId].quantity += Number(item.quantity) || 0;
        productMap[productId].revenue +=
          Number(item.subtotal) ||
          (Number(item.price) || 0) * (Number(item.quantity) || 0);
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  })();

  console.log("Top 5 sản phẩm bán chạy:", bestSellingProducts);

  const revenue = completedOrders.reduce(
    (total, item) => total + Number(item.order?.totalAmount || 0),
    0,
  );

  const averageOrderValue =
    completedOrders.length > 0 ? revenue / completedOrders.length : 0;

  const statistics = [
    {
      label: "Tổng đơn hàng",
      value: orders.length,
      color: "purple",
    },
    {
      label: "Chờ xác nhận",
      value: countByStatus("pending"),
      color: "orange",
    },
    {
      label: "Đã xác nhận",
      value: countByStatus("confirmed"),
      color: "blue",
    },
    {
      label: "Đang giao hàng",
      value: countByStatus("shipping"),
      color: "violet",
    },
    {
      label: "Đơn hoàn thành",
      value: completedOrders.length,
      color: "green",
    },
    {
      label: "Đơn đã hủy",
      value: countByStatus("cancelled"),
      color: "red",
    },
  ];

  const orderChartData = [
    {
      name: "Chờ xác nhận",
      soLuong: countByStatus("pending"),
      fill: "#f59e0b",
    },
    {
      name: "Đã xác nhận",
      soLuong: countByStatus("confirmed"),
      fill: "#3b82f6",
    },
    {
      name: "Đang giao",
      soLuong: countByStatus("shipping"),
      fill: "#8b5cf6",
    },
    {
      name: "Hoàn thành",
      soLuong: countByStatus("completed"),
      fill: "#10b981",
    },
    {
      name: "Đã hủy",
      soLuong: countByStatus("cancelled"),
      fill: "#ef4444",
    },
  ];

  const now = new Date();

  const getMonthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const getMonthLabel = (date) =>
    `T${date.getMonth() + 1}/${date.getFullYear()}`;

  const getMonthsForFilter = () => {
    const months = [];

    if (timeFilter === "thisMonth") {
      months.push(new Date(now.getFullYear(), now.getMonth(), 1));
    } else if (timeFilter === "3months") {
      for (let i = 2; i >= 0; i--) {
        months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
      }
    } else if (timeFilter === "6months") {
      for (let i = 5; i >= 0; i--) {
        months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
      }
    } else if (timeFilter === "thisYear") {
      for (let month = 0; month <= now.getMonth(); month++) {
        months.push(new Date(now.getFullYear(), month, 1));
      }
    }

    return months;
  };

  const revenueChartData = getMonthsForFilter().map((month) => {
    const monthKey = getMonthKey(month);

    const monthlyRevenue = completedOrders.reduce((total, item) => {
      const createdAt = item.order?.createdAt;

      if (!createdAt) return total;

      const orderDate = new Date(createdAt);

      if (Number.isNaN(orderDate.getTime())) return total;

      if (getMonthKey(orderDate) !== monthKey) return total;

      return total + Number(item.order?.totalAmount || 0);
    }, 0);

    return {
      month: getMonthLabel(month),
      doanhThu: monthlyRevenue,
    };
  });

  const filteredRevenue = revenueChartData.reduce(
    (total, item) => total + item.doanhThu,
    0,
  );

  return (
    <div className="admin-statistics">
      <header className="statistics-header">
        <h1>Thống kê bán hàng</h1>
        <p>Tổng quan tình hình kinh doanh của cửa hàng.</p>
      </header>

      <section className="statistics-grid">
        {statistics.map((item) => (
          <article
            key={item.label}
            className={`statistics-card statistics-card--${item.color}`}
          >
            <p className="statistics-card-label">{item.label}</p>
            <h2 className="statistics-card-value">{item.value}</h2>
          </article>
        ))}
      </section>

      <section className="statistics-revenue-grid">
        <article className="statistics-revenue-card statistics-revenue-card--total">
          <p className="statistics-revenue-label">
            Doanh thu từ đơn hoàn thành
          </p>
          <h2 className="statistics-revenue-value">{formatVND(revenue)}</h2>
        </article>

        <article className="statistics-revenue-card statistics-revenue-card--average">
          <p className="statistics-revenue-label">
            Giá trị trung bình mỗi đơn hoàn thành
          </p>
          <h2 className="statistics-revenue-value">
            {formatVND(averageOrderValue)}
          </h2>
        </article>
      </section>
      <section className="statistics-chart-card">
        <div className="statistics-chart-header">
          <h2>Đơn hàng theo trạng thái</h2>
          <p>So sánh số lượng đơn hàng của cửa hàng.</p>
        </div>

        <div className="statistics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={orderChartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                width={35}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [value, "Số đơn hàng"]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar
                dataKey="soLuong"
                name="Số đơn hàng"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              >
                {orderChartData.map((item) => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="statistics-chart-card">
        <div className="statistics-chart-header">
          <div>
            <h2>Doanh thu theo thời gian</h2>
            <p>Chỉ tính các đơn hàng đã hoàn thành.</p>
          </div>

          <select
            className="statistics-filter"
            value={timeFilter}
            onChange={(event) => setTimeFilter(event.target.value)}
          >
            <option value="thisMonth">Tháng này</option>
            <option value="3months">3 tháng gần nhất</option>
            <option value="6months">6 tháng gần nhất</option>
            <option value="thisYear">Năm nay</option>
          </select>
        </div>

        <div className="statistics-revenue-summary">
          <span>Tổng doanh thu trong khoảng thời gian</span>
          <strong>{formatVND(filteredRevenue)}</strong>
        </div>

        <div className="statistics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueChartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={(value) =>
                  value >= 1000000
                    ? `${(value / 1000000).toLocaleString("vi-VN")} tr`
                    : value.toLocaleString("vi-VN")
                }
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={75}
              />

              <Tooltip
                formatter={(value) => [formatVND(value), "Doanh thu"]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              />

              <Bar
                dataKey="doanhThu"
                name="Doanh thu"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="statistics-chart-card best-selling-card">
        <div className="statistics-chart-header">
          <div>
            <h2>Top 5 sản phẩm bán chạy</h2>
            <p>
              Xếp hạng theo số lượng sản phẩm trong các đơn hàng hoàn thành.
            </p>
          </div>
        </div>

        <div className="best-selling-table-wrapper">
          <table className="best-selling-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Sản phẩm</th>
                <th>Số lượng đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>

            <tbody>
              {bestSellingProducts.length > 0 ? (
                bestSellingProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>
                      <span className={`best-selling-rank rank-${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>

                    <td>
                      <div className="best-selling-product">
                        {product.image ? (
                          <img
                            src={`/images/${product.image}`}
                            alt={product.name}
                            className="best-selling-image"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}

                        <span>{product.name}</span>
                      </div>
                    </td>

                    <td>{product.quantity.toLocaleString("vi-VN")}</td>
                    <td>{formatVND(product.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="best-selling-empty">
                    Chưa có sản phẩm trong các đơn hàng hoàn thành.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
