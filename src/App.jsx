import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminHeader from "./components/AdminHeader.jsx";
import About from "./pages/About.jsx";
import Cart from "./pages/Cart.jsx";
import Contact from "./pages/Contact.jsx";
import ContactAdmin from "./pages/ContactAdmin.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import News from "./pages/News.jsx";
import BookingsAdmin from "./pages/BookingsAdmin.jsx";
import NewsAdmin from "./pages/NewsAdmin.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import Offers from "./pages/Offers.jsx";
import OrdersAdmin from "./pages/OrdersAdmin.jsx";
import ProductsAdmin from "./pages/ProductsAdmin.jsx";
import UsersAdmin from "./pages/UsersAdmin.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function NavAuth() {
  const { user, ready, logout, token } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!ready || user?.role !== "user" || !token) {
      setCartCount(0);
      return;
    }
    let cancelled = false;
    const loadCount = () => {
      fetch("/api/cart", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (cancelled || !d.items) return;
          const n = d.items.reduce((s, i) => s + i.quantity, 0);
          setCartCount(n);
        })
        .catch(() => {
          if (!cancelled) setCartCount(0);
        });
    };
    loadCount();
    const onCart = () => loadCount();
    window.addEventListener("glowelle-cart", onCart);
    return () => {
      cancelled = true;
      window.removeEventListener("glowelle-cart", onCart);
    };
  }, [ready, user?.role, token, location.pathname]);

  if (!ready) {
    return null;
  }

  if (!user) {
    return (
      <>
        <Nav.Link as={Link} to="/login">
          Sign in
        </Nav.Link>
        <Nav.Link as={Link} to="/register">
          Register
        </Nav.Link>
      </>
    );
  }

  if (user.role === "admin") {
    return (
      <>
        <Nav.Link as={Link} to="/admin/products">
          Admin panel
        </Nav.Link>
        <span className="navbar-text small text-muted me-2 d-none d-md-inline">
          {user.email}
        </span>
        <Nav.Link
          as="button"
          type="button"
          className="btn btn-link nav-link"
          onClick={() => logout()}
        >
          Sign out
        </Nav.Link>
      </>
    );
  }

  return (
    <>
      <Nav.Link as={Link} to="/cart">
        Cart{cartCount > 0 ? ` (${cartCount})` : ""}
      </Nav.Link>
      <span className="navbar-text small text-muted me-2 d-none d-md-inline">
        {user.email}
      </span>
      <Nav.Link
        as="button"
        type="button"
        className="btn btn-link nav-link"
        onClick={() => logout()}
      >
        Sign out
      </Nav.Link>
    </>
  );
}

export default function App() {
  const location = useLocation();
  const { user, ready } = useAuth();
  const showAdminHeader =
    ready && user?.role === "admin" && location.pathname.startsWith("/admin");

  return (
    <div className="d-flex flex-column min-vh-100">
      {!showAdminHeader && (
        <Navbar bg="light" expand="lg" className="border-bottom mb-0 shadow-sm">
          <Container>
            <Navbar.Brand as={Link} to="/">
              Glowelle
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="main-nav" />
            <Navbar.Collapse id="main-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/about">
                  About us
                </Nav.Link>
                <Nav.Link as={Link} to="/offers">
                  Offers
                </Nav.Link>
                <Nav.Link as={Link} to="/contact">
                  Contact us
                </Nav.Link>
                <Nav.Link as={Link} to="/news">
                  News
                </Nav.Link>
              </Nav>
              <Nav className="ms-auto align-items-lg-center">
                <NavAuth />
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      {showAdminHeader && <AdminHeader />}
      <Container className="flex-grow-1 pb-4">
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Navigate to="/admin/products" replace />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute role="admin">
                <ProductsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute role="admin">
                <OrdersAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute role="admin">
                <BookingsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <UsersAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute role="admin">
                <NewsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute role="admin">
                <ContactAdmin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
      <footer className="border-top bg-light py-3 mt-auto">
        <Container>
          <p className="text-center text-muted small mb-0">
            © 2026 Glowelle. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}
