import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import AdminPagination from "../components/AdminPagination.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
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

export default function NewsAdmin() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [listSearch, setListSearch] = useState("");
  const [listPage, setListPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", body: "" });

  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson("/api/news");
      setItems(data.news ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      filterBySearch(items, listSearch, (n) => [
        n.id,
        n.title,
        n.createdAt,
      ]),
    [items, listSearch]
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiJson("/api/news", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: createForm.title.trim(),
          body: createForm.body.trim(),
        }),
      });
      setCreateForm({ title: "", body: "" });
      setShowCreate(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const openEdit = async (row) => {
    setError(null);
    try {
      const data = await apiJson(`/api/news/${row.id}`);
      const it = data.item;
      setEditItem({
        id: it.id,
        title: it.title,
        body: it.body,
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await apiJson(`/api/news/${editItem.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          title: editItem.title.trim(),
          body: editItem.body.trim(),
        }),
      });
      setEditItem(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiJson(`/api/news/${confirmDelete.id}`, {
        method: "DELETE",
        token,
      });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(e.message);
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
      <h1 className="h3 my-3">News</h1>
      <p className="text-muted small mb-4">
        Create and edit articles. No images—title and body only.
      </p>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Button className="mb-4" onClick={() => setShowCreate(true)}>
        New article
      </Button>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h5 mb-0">All articles</h2>
        <Form.Control
          type="search"
          placeholder="Search…"
          value={listSearch}
          onChange={(e) => setListSearch(e.target.value)}
          style={{ maxWidth: 280 }}
          aria-label="Search articles"
        />
      </div>

      {filtered.length > 0 && (
        <p className="small text-muted mb-2">
          Showing {pageSlice.startIndex + 1}–{pageSlice.endIndex} of{" "}
          {filtered.length}
        </p>
      )}

      <div className="table-responsive">
        <Table striped bordered hover size="sm" className="align-middle">
          <thead>
            <tr>
              <th style={{ width: 72 }}>ID</th>
              <th>Title</th>
              <th style={{ width: 200 }}>Published</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {pageSlice.pageItems.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.title}</td>
                <td className="small text-muted">{formatDate(n.createdAt)}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-1"
                    onClick={() => openEdit(n)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() =>
                      setConfirmDelete({ id: n.id, title: n.title })
                    }
                  >
                    Delete
                  </Button>
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

      {items.length === 0 && (
        <p className="text-muted small mb-0">No articles yet. Add one above.</p>
      )}
      {items.length > 0 && filtered.length === 0 && (
        <p className="text-muted small mb-0">No articles match your search.</p>
      )}

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New article</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Body</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={createForm.body}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, body: e.target.value }))
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={!!editItem} onHide={() => setEditItem(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit article</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={editItem?.title ?? ""}
                onChange={(e) =>
                  setEditItem((it) =>
                    it ? { ...it, title: e.target.value } : it
                  )
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Body</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={editItem?.body ?? ""}
                onChange={(e) =>
                  setEditItem((it) =>
                    it ? { ...it, body: e.target.value } : it
                  )
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={!!confirmDelete}
        onHide={() => setConfirmDelete(null)}
        title="Delete article?"
        confirmLabel="Delete"
        onConfirm={executeDelete}
      >
        <p className="mb-0">
          Delete <strong>&quot;{confirmDelete?.title ?? ""}&quot;</strong>? This cannot be
          undone.
        </p>
      </ConfirmModal>
    </>
  );
}
