import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { OFFER_PACKAGES } from "../data/offerPackages.js";
import BookingModal from "./BookingModal.jsx";

export default function OfferPackages() {
  const [bookingPackageName, setBookingPackageName] = useState(null);

  return (
    <>
      <Row className="g-4 my-3">
        {OFFER_PACKAGES.map((pkg) => (
          <Col key={pkg.name} md={6} lg={4}>
            <Card
              className="h-100 shadow-sm"
              border={pkg.highlighted ? "primary" : undefined}
            >
              {pkg.badge && (
                <div className="bg-primary text-white text-center py-2 small fw-semibold">
                  {pkg.badge}
                </div>
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title as="h2" className="h4">
                  {pkg.name}
                </Card.Title>
                <Card.Subtitle className="text-muted mb-3">
                  {pkg.tagline}
                </Card.Subtitle>
                <p className="mb-1">
                  <span className="display-6 fw-semibold">{pkg.price}</span>
                  <span className="text-muted ms-2 small">{pkg.priceNote}</span>
                </p>
                <hr />
                <ul className="flex-grow-1 small mb-4 ps-3">
                  {pkg.features.map((line) => (
                    <li key={line} className="mb-2">
                      {line}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={pkg.highlighted ? "primary" : "outline-primary"}
                  className="w-100"
                  onClick={() => setBookingPackageName(pkg.name)}
                >
                  Book this offer
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <BookingModal
        show={bookingPackageName !== null}
        packageName={bookingPackageName ?? ""}
        onHide={() => setBookingPackageName(null)}
      />
    </>
  );
}
