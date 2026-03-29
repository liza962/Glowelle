import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import AdminPagination from "../components/AdminPagination.jsx";
import AdminStatusDropdown from "../components/AdminStatusDropdown.jsx";
import { OFFER_PACKAGES } from "../data/offerPackages.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ADMIN_PAGE_SIZE,
  filterBySearch,
  slicePage,
} from "../utils/adminList.js";
import { apiJson } from "../utils/api.js";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function BookingsAdmin() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listSearch, setListSearch] = useState("");
  const [listPage, setListPage] = useState(1);
  const [savingBookingId, setSavingBookingId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson("/api/admin/bookings", { token });
      setBookings(data.bookings ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const updateBookingStatus = async (bookingId, status) => {
    setSavingBookingId(bookingId);
    setError(null);
    try {
      await apiJson(`/api/admin/bookings/${bookingId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingBookingId(null);
    }
  };

  const filtered = useMemo(
    () =>
      filterBySearch(bookings, listSearch, (b) => [
        b.id,
        b.packageName,
        b.fullName,
        b.email,
        b.phone,
        b.address,
        b.status,
        b.createdAt,
      ]),
    [bookings, listSearch]
  );

  const pageSlice = useMemo(
    () => slicePage(filtered, listPage, ADMIN_PAGE_SIZE),
    [filtered, listPage]
  );

  useEffect(() => {
    setListPage(1);
  }, [listSearch]);

  useEffect(() => {
    setListPage((p) => Math.min(p, pageSlice.totalPages));
  }, [pageSlice.totalPages]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" aria-label="Loading bookings" />
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 my-3">Offer requests</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <section className="mb-5">
        <h2 className="h5 mb-3">Consultation packages (on Offers)</h2>
        <p className="small text-muted mb-3">
          Packages shown on the public Offers page. The table below lists which
          package each person selected when they submitted the form.
        </p>
        <Row className="g-3">
          {OFFER_PACKAGES.map((pkg) => (
            <Col key={pkg.name} md={6} xl={4}>
              <Card className="h-100 border shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <Card.Title as="h3" className="h6 mb-0">
                      {pkg.name}
                    </Card.Title>
                    {pkg.badge && (
                      <Badge bg="primary" className="text-uppercase" style={{ fontSize: "0.65rem" }}>
                        {pkg.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="small text-muted mb-2">{pkg.tagline}</p>
                  <p className="mb-0 mt-auto">
                    <span className="fs-5 fw-semibold">{pkg.price}</span>
                    <span className="text-muted small ms-1">{pkg.priceNote}</span>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <h2 className="h5 mb-0">Form submissions</h2>
          <Form.Control
            type="search"
            placeholder="Search bookings…"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            style={{ maxWidth: 280 }}
            aria-label="Search bookings"
          />
        </div>

        {filtered.length > 0 && (
          <p className="small text-muted mb-2">
            Showing {pageSlice.startIndex + 1}–{pageSlice.endIndex} of {filtered.length}
          </p>
        )}

        {bookings.length === 0 ? (
          <p className="text-muted mb-0">No bookings yet.</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted mb-0">No bookings match your search.</p>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover size="sm" className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 72 }}>ID</th>
                    <th>Package</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th style={{ width: 150 }}>Status</th>
                    <th style={{ width: 180 }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.pageItems.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td className="fw-medium">{b.packageName}</td>
                      <td>{b.fullName}</td>
                      <td className="small">{b.email}</td>
                      <td className="small text-nowrap">{b.phone}</td>
                      <td className="small" style={{ maxWidth: 220 }}>
                        <span className="d-inline-block text-break">{b.address}</span>
                      </td>
                      <td>
                        <AdminStatusDropdown
                          status={b.status}
                          onSelect={(next) => updateBookingStatus(b.id, next)}
                          disabled={savingBookingId === b.id}
                          ariaLabel={`Request ${b.id} status`}
                        />
                      </td>
                      <td className="small text-muted text-nowrap">
                        {formatDate(b.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <AdminPagination
              className="mt-3"
              page={pageSlice.page}
              totalPages={pageSlice.totalPages}
              onPageChange={setListPage}
            />
          </>
        )}
      </section>
    </>
  );
}
