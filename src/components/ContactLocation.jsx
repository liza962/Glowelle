import { Card, Col, Ratio, Row } from "react-bootstrap";

const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=42.6629,21.1655&hl=en&z=16&output=embed";

export default function ContactLocation() {
  return (
    <Row className="g-4">
      <Col md={6}>
        <Card className="h-100">
          <Card.Body>
            <Card.Title as="h2">Glowelle</Card.Title>
            <Card.Subtitle className="mb-3 text-muted">Visit us</Card.Subtitle>
            <address className="mb-0">
              Rruga Mother Teresa
              <br />
              Prishtina 10000
              <br />
              Kosovo
            </address>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="h-100">
          <Card.Body>
            <Card.Title as="h3" className="h5">
              Location
            </Card.Title>
            <Ratio aspectRatio="16x9" className="mt-2">
              <iframe
                src={MAP_EMBED_SRC}
                title="Map showing Glowelle in Prishtina"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            </Ratio>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
