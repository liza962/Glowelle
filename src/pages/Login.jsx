import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { postAuthJson } from "../utils/authFetch.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  /** Admins land on the admin panel unless they were trying to open a specific /admin URL. */
  function postLoginPath(user) {
    if (user.role === "admin") {
      if (typeof from === "string" && from.startsWith("/admin")) {
        return from;
      }
      return "/admin/products";
    }
    return from;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await postAuthJson("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      if (!data.token || !data.user) {
        throw new Error("Unexpected response from server.");
      }
      login(data.token, data.user);
      navigate(postLoginPath(data.user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Enter your email and password to continue to your account, cart, or admin tools."
      footer={
        <>
          <p className="small text-muted mb-2">
            Don&apos;t have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
          <p className="small mb-0">
            <Link to="/" className="text-muted">
              ← Back to home
            </Link>
          </p>
        </>
      }
    >
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="loginEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Form.Group>
        <Form.Group className="mb-4" controlId="loginPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Form.Group>
        <Button type="submit" className="w-100" disabled={submitting} size="lg">
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </Form>
    </AuthPageShell>
  );
}
