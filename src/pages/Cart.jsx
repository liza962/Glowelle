import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPriceEUR } from "../utils/formatPrice.js";
import { apiJson } from "../utils/api.js";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function CartInner() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson("/api/cart", { token });
      setItems(data.items ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const updateQty = async (productId, quantity) => {
    try {
      await apiJson(`/api/cart/${productId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ quantity }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeLine = async (productId) => {
    try {
      await apiJson(`/api/cart/${productId}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    setSubmitting(true);
    try {
      await apiJson("/api/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }),
      });
      setFullName("");
      setPhone("");
      setAddress("");
      await load();
      window.dispatchEvent(new Event("glowelle-cart"));
      alert("Order placed. Thank you!");
    } catch (e) {
      setCheckoutError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" aria-label="Loading cart" />
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 mb-3">Cart</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {items.length === 0 ? (
        <p className="text-muted">
          Your cart is empty.{" "}
          <Link to="/">Browse products</Link>
        </p>
      ) : (
        <>
          <div className="table-responsive mb-4">
            <Table striped bordered hover size="sm" className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: 72 }} />
                  <th>Product</th>
                  <th>Price</th>
                  <th style={{ width: 120 }}>Qty</th>
                  <th style={{ width: 100 }} />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.productId}>
                    <td>
                      <img
                        src={row.image}
                        alt=""
                        width={56}
                        height={40}
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                    </td>
                    <td>
                      <div className="fw-medium">{row.name}</div>
                      <div className="small text-muted">{row.category}</div>
                    </td>
                    <td>{formatPriceEUR(row.price)}</td>
                    <td>
                      <Form.Control
                        type="number"
                        min={1}
                        size="sm"
                        value={row.quantity}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          if (Number.isInteger(q) && q >= 1) {
                            updateQty(row.productId, q);
                          }
                        }}
                        aria-label={`Quantity for ${row.name}`}
                      />
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => removeLine(row.productId)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <h2 className="h5 mb-3">Shipping &amp; checkout</h2>
          <p className="small text-muted mb-3">
            We store your order with these details. Your account email is used for
            confirmation (from your profile).
          </p>
          {checkoutError && (
            <Alert variant="danger" dismissible onClose={() => setCheckoutError(null)}>
              {checkoutError}
            </Alert>
          )}
          <Form onSubmit={handleCheckout} style={{ maxWidth: 480 }}>
            <Form.Group className="mb-2">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Shipping address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Placing order…" : "Place order"}
            </Button>
          </Form>
        </>
      )}
    </>
  );
}

export default function Cart() {
  return (
    <ProtectedRoute role="user">
      <CartInner />
    </ProtectedRoute>
  );
}
