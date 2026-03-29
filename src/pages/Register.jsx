import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { postAuthJson } from "../utils/authFetch.js";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await postAuthJson("/api/auth/register", {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      if (!data.token || !data.user) {
        throw new Error("Unexpected response from server.");
      }
      login(data.token, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="Join Glowelle"
      title="Create an account"
      subtitle="Shop the catalog, save your cart, and checkout securely."
      footer={
        <>
          <p className="small text-muted mb-2">
            Already registered? <Link to="/login">Sign in</Link>
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
        <Form.Group className="mb-3" controlId="regName">
          <Form.Label>Full name</Form.Label>
          <Form.Control
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="Your name"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="regEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </Form.Group>
        <Form.Group className="mb-4" controlId="regPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            required
          />
          <Form.Text className="text-muted">Minimum 8 characters.</Form.Text>
        </Form.Group>
        <Button type="submit" className="w-100" disabled={submitting} size="lg">
          {submitting ? "Creating your account…" : "Create account"}
        </Button>
      </Form>
    </AuthPageShell>
  );
}
