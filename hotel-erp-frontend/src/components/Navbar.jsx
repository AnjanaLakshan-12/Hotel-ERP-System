import { NavLink, useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../services/userService";
import { NavLink, useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../services/userService";
import { canAccess, navigationItems } from "../utils/roleAccess";


function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearStoredUser();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">H</div>
        <div>
          <h1>Hotel ERP</h1>
          <p>Operations Suite</p>
        </div>
      </div>

      <nav className="nav-menu">
  {navigationItems
    .filter((item) => canAccess(user?.role, item.roles))
    .map((item) => (
      <NavLink key={item.path} to={item.path}>
        {item.label}
      </NavLink>
    ))}
</nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <span>{user?.firstName?.charAt(0) || "U"}</span>
          <div>
            <strong>{user ? `${user.firstName} ${user.lastName}` : "User"}</strong>
            <small>{user?.role || "ADMIN"}</small>
          </div>
        </div>
        <button className="ghost-button" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default Navbar;
