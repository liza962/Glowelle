import { useCallback, useEffect, useState } from "react";
import { Card, Col, Ratio, Row, Spinner } from "react-bootstrap";
import { DEFAULT_CONTACT } from "../data/defaultContact.js";
import { apiJson } from "../utils/api.js";

export default function ContactLocation() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson("/api/contact");
      setContact(data.contact ?? null);
    } catch {
      setContact({ ...DEFAULT_CONTACT });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const c = contact ?? DEFAULT_CONTACT;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" aria-label="Loading contact" />
      </div>
    );
  }

  return (
    <Row className="g-4 my-3">
      <Col md={6}>
        <Card className="h-100">
          <Card.Body>
            <Card.Title as="h2">{c.brandTitle}</Card.Title>
            <Card.Subtitle className="mb-3 text-muted">{c.subtitle}</Card.Subtitle>
            <address className="mb-0">
              {c.addressLine1}
              <br />
              {c.addressLine2}
              <br />
              {c.region}
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
                src={c.mapEmbedUrl}
                title="Map showing Glowelle location"
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
