import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";

async function postBooking(payload) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Server did not return JSON. Is the API running (npm run server) on the same port Vite proxies to?"
    );
  }

  if (!res.ok) {
    const msg =
      typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (data.ok !== true || data.id == null) {
    throw new Error(
      data.error ||
        "Booking was not confirmed by the server. Check the API terminal for errors."
    );
  }

  return data;
}

export default function BookingModal({ show, onHide, packageName }) {
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (show) {
      setValidated(false);
      setSubmitted(false);
      setSubmitting(false);
      setSubmitError(null);
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
    }
  }, [show, packageName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      await postBooking({
        packageName,
        fullName,
        email,
        phone,
        address,
      });
      setSubmitted(true);
      setValidated(false);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Book offer: {packageName}</Modal.Title>
      </Modal.Header>
      {submitted ? (
        <>
          <Modal.Body>
            <Alert variant="success" className="mb-0">
              Thank you, {fullName}! Your order for <strong>{packageName}</strong>{" "}
              will be sent to the address you provided. We&apos;ll email you at{" "}
              <strong>{email}</strong> to confirm.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={onHide}>
              Close
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <Form id="booking-offer-form" noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <p className="text-muted small mb-3">
              Enter your details so we can ship your order and reach you about your
              booking.
            </p>
            {submitError && (
              <Alert variant="danger" className="py-2 small">
                {submitError}
              </Alert>
            )}
            <Form.Group className="mb-3" controlId="bookingFullName">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                required
                type="text"
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
              />
              <Form.Control.Feedback type="invalid">
                Please enter your full name.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="bookingEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email address.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="bookingPhone">
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                required
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+383 …"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
              />
              <Form.Control.Feedback type="invalid">
                Please enter your phone number.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-0" controlId="bookingAddress">
              <Form.Label>Delivery address</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                name="address"
                autoComplete="street-address"
                placeholder="Street, city, postal code, country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={submitting}
              />
              <Form.Control.Feedback type="invalid">
                Please enter the address where we should send your order.
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              type="button"
              onClick={onHide}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="booking-offer-form" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving…
                </>
              ) : (
                "Submit booking"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );
}
