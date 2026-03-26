import { Button, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const PACKAGES = [
  {
    name: "Glow Starter",
    tagline: "Perfect for first-time clients",
    price: "€45",
    priceNote: "one-time",
    features: [
      "60-minute skin consultation",
      "Personalized home-care routine",
      "Product recommendations for your skin type",
    ],
    highlighted: false,
  },
  {
    name: "Radiance Bundle",
    tagline: "Consult + guided follow-up",
    price: "€120",
    priceNote: "package",
    badge: "Popular",
    features: [
      "Initial consultation & skin analysis",
      "Two 30-minute follow-up visits",
      "Adjusted routine as your skin responds",
      "Email support between visits",
    ],
    highlighted: true,
  },
  {
    name: "Complete Care",
    tagline: "Ongoing support & coaching",
    price: "€220",
    priceNote: "3 months",
    features: [
      "Full consultation & treatment plan",
      "Monthly check-in sessions (×3)",
      "Priority booking for add-on treatments",
      "Seasonal routine refresh",
    ],
    highlighted: false,
  },
];

export default function OfferPackages() {
  return (
    <Row className="g-4">
      {PACKAGES.map((pkg) => (
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
                as={Link}
                to="/contact"
                variant={pkg.highlighted ? "primary" : "outline-primary"}
                className="w-100"
              >
                Book this offer
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
