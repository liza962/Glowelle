import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

export default function BookingModal({ show, onHide, packageName }) {
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (show) {
      setValidated(false);
      setSubmitted(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
    }
  }, [show, packageName]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    // No backend yet — booking details would be sent here (e.g. API or email).
    setSubmitted(true);
    setValidated(false);
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
            <Form.Group className="mb-3" controlId="bookingFullName">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                required
                type="text"
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
              />
              <Form.Control.Feedback type="invalid">
                Please enter the address where we should send your order.
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" type="button" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="booking-offer-form">
              Submit booking
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );
}
