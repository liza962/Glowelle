import { Container, Nav } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const tabs = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/bookings", label: "Offer requests" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/news", label: "News" },
  { to: "/admin/contact", label: "Contact" },
];

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="admin-header">
      <Container>
        <div className="admin-header-top">
          <div className="admin-header-top-left">
            <Link to="/" className="admin-header-brand">
              Glowelle
            </Link>
            <span className="admin-header-badge">Admin</span>
            <Link to="/" className="admin-header-site-link">
              View site
            </Link>
          </div>
          <div className="admin-header-top-right">
            <span
              className="admin-header-email text-truncate"
              title={user?.email ?? ""}
            >
              {user?.email}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-light admin-header-signout"
              onClick={() => logout()}
            >
              Sign out
            </button>
          </div>
        </div>

        <Nav
          variant="pills"
          className="admin-header-tabs justify-content-center justify-content-md-start"
          role="navigation"
          aria-label="Admin sections"
        >
          {tabs.map(({ to, label }) => (
            <Nav.Item key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `nav-link admin-header-tab${isActive ? " active" : ""}`
                }
              >
                {label}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>
      </Container>
    </header>
  );
}
