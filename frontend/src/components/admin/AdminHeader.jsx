function AdminHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <header className="admin-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Quản lý Technology Gaming Shop</p>
      </div>

      <div className="admin-header-user">
        <span>{user?.name || "Admin"}</span>
      </div>
    </header>
  );
}

export default AdminHeader;
