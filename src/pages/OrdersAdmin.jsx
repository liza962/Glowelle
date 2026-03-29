import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Form, Spinner, Table } from "react-bootstrap";
import AdminPagination from "../components/AdminPagination.jsx";
import AdminStatusDropdown from "../components/AdminStatusDropdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ADMIN_PAGE_SIZE,
  filterBySearch,
  slicePage,
} from "../utils/adminList.js";
import { formatPriceEUR } from "../utils/formatPrice.js";
import { apiJson } from "../utils/api.js";

export default function OrdersAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listSearch, setListSearch] = useState("");
  const [listPage, setListPage] = useState(1);
  const [savingOrderId, setSavingOrderId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson("/api/admin/orders", { token });
      setOrders(data.orders ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const updateOrderStatus = async (orderId, status) => {
    setSavingOrderId(orderId);
    setError(null);
    try {
      await apiJson(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingOrderId(null);
    }
  };

  const filteredOrders = useMemo(
    () =>
      filterBySearch(orders, listSearch, (o) => {
        const lines = (o.items ?? []).flatMap((it) => [
          it.productName,
          it.quantity,
          it.lineTotal,
          formatPriceEUR(it.price),
        ]);
        return [
          o.id,
          o.fullName,
          o.email,
          o.phone,
          o.address,
          o.status,
          o.orderTotal,
          o.createdAt,
          ...lines,
        ];
      }),
    [orders, listSearch]
  );

  const orderSlice = useMemo(
    () => slicePage(filteredOrders, listPage, ADMIN_PAGE_SIZE),
    [filteredOrders, listPage]
  );

  useEffect(() => {
    setListPage(1);
  }, [listSearch]);

  useEffect(() => {
    setListPage((p) => Math.min(p, orderSlice.totalPages));
  }, [orderSlice.totalPages]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" aria-label="Loading orders" />
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 my-3">Orders</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {orders.length === 0 ? (
        <p className="text-muted mb-0">No orders yet.</p>
      ) : (
        <>
          <div className="d-flex flex-wrap justify-content-end mb-3">
            <Form.Control
              type="search"
              placeholder="Search orders…"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              style={{ maxWidth: 320 }}
              aria-label="Search orders"
            />
          </div>
          {filteredOrders.length > 0 && (
            <p className="small text-muted mb-3">
              Showing {orderSlice.startIndex + 1}–{orderSlice.endIndex} of{" "}
              {filteredOrders.length} orders
            </p>
          )}
          {filteredOrders.length === 0 ? (
            <p className="text-muted mb-0">No orders match your search.</p>
          ) : (
            orderSlice.pageItems.map((o) => (
          <section key={o.id} className="mb-4 border rounded p-3 bg-light">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <strong>Order #{o.id}</strong>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="small text-muted">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                </span>
                <AdminStatusDropdown
                  status={o.status}
                  onSelect={(next) => updateOrderStatus(o.id, next)}
                  disabled={savingOrderId === o.id}
                  ariaLabel={`Order ${o.id} status`}
                />
              </div>
            </div>
            <p className="small mb-2">
              <strong>{o.fullName}</strong> · {o.email} · {o.phone}
            </p>
            <p className="small text-muted mb-3">{o.address}</p>
            <Table size="sm" className="mb-0 bg-white" bordered>
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-end">Qty</th>
                  <th className="text-end">Unit price</th>
                  <th className="text-end">Line total</th>
                </tr>
              </thead>
              <tbody>
                {(o.items ?? []).map((it, idx) => (
                  <tr key={`${o.id}-${idx}`}>
                    <td>{it.productName}</td>
                    <td className="text-end">{it.quantity}</td>
                    <td className="text-end">{formatPriceEUR(it.price)}</td>
                    <td className="text-end fw-medium">{it.lineTotal ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-light">
                  <td colSpan={3} className="text-end fw-semibold">
                    Order total
                  </td>
                  <td className="text-end fw-semibold">{o.orderTotal ?? "—"}</td>
                </tr>
              </tfoot>
            </Table>
          </section>
            ))
          )}
          <AdminPagination
            className="mt-2"
            page={orderSlice.page}
            totalPages={orderSlice.totalPages}
            onPageChange={setListPage}
          />
        </>
      )}
    </>
  );
}
