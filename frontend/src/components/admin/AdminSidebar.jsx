import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";
import {
  LayoutDashboard,
  Package,
  Folder,
  Tags,
  ShoppingCart,
  Users,
  ChartNoAxesCombined,
  Ticket,
} from "lucide-react";

const menuItems = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/products",
    label: "Sản phẩm",
    icon: Package,
  },
  {
    to: "/admin/categories",
    label: "Danh mục",
    icon: Folder,
  },
  {
    to: "/admin/brands",
    label: "Thương hiệu",
    icon: Tags,
  },
  {
    to: "/admin/orders",
    label: "Đơn hàng",
    icon: ShoppingCart,
  },
  {
    to: "/admin/users",
    label: "Người dùng",
    icon: Users,
  },
  {
    to: "/admin/statistics",
    label: "Thống kê",
    icon: ChartNoAxesCombined,
  },
  {
    to: "/admin/vouchers",
    label: "Quản lý voucher",
    icon: Ticket,
  },
];

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <h2>Admin Panel</h2>
        <p>Technology Gaming Shop</p>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} title={label} aria-label={label}>
            <Icon className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
