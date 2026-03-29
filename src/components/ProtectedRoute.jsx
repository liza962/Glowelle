import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * @param {{ children: import("react").ReactNode, role?: "admin" | "user" }} props
 */
export default function ProtectedRoute({ children, role }) {
  const { token, user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
