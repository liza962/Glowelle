import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.jsx";
import { DEFAULT_CONTACT } from "../data/defaultContact.js";
import { apiJson } from "../utils/api.js";

const emptyForm = () => ({
  brandTitle: "",
  subtitle: "",
  addressLine1: "",
  addressLine2: "",
  region: "",
  mapEmbedUrl: "",
});

export default function ContactAdmin() {
  const { token } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson("/api/contact");
      const c = data.contact;
      if (c) {
        setForm({
          brandTitle: c.brandTitle ?? "",
          subtitle: c.subtitle ?? "",
          addressLine1: c.addressLine1 ?? "",
          addressLine2: c.addressLine2 ?? "",
          region: c.region ?? "",
          mapEmbedUrl: c.mapEmbedUrl ?? "",
        });
        setUpdatedAt(c.updatedAt ?? null);
      } else {
        setForm({ ...DEFAULT_CONTACT });
      }
    } catch (e) {
      setError(e.message);
      setForm({ ...DEFAULT_CONTACT });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = await apiJson("/api/admin/contact", {
        method: "PUT",
        token,
        body: JSON.stringify({
          brandTitle: form.brandTitle.trim(),
          subtitle: form.subtitle.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          region: form.region.trim(),
          mapEmbedUrl: form.mapEmbedUrl.trim(),
        }),
      });
      if (data.contact?.updatedAt) {
        setUpdatedAt(data.contact.updatedAt);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 my-3">Contact page</h1>
      {updatedAt && (
        <p className="small text-muted mb-3">
          Last saved:{" "}
          {new Date(updatedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Row className="g-3 mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Brand / heading</Form.Label>
              <Form.Control
                value={form.brandTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brandTitle: e.target.value }))
                }
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                value={form.subtitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtitle: e.target.value }))
                }
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Address line 1</Form.Label>
              <Form.Control
                value={form.addressLine1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, addressLine1: e.target.value }))
                }
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Address line 2</Form.Label>
              <Form.Control
                value={form.addressLine2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, addressLine2: e.target.value }))
                }
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Country / region</Form.Label>
              <Form.Control
                value={form.region}
                onChange={(e) =>
                  setForm((f) => ({ ...f, region: e.target.value }))
                }
                required
              />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Map embed URL</Form.Label>
              <Form.Control
                type="url"
                value={form.mapEmbedUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mapEmbedUrl: e.target.value }))
                }
                placeholder="https://www.google.com/maps?..."
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save contact page"}
        </Button>
      </Form>
    </>
  );
}
