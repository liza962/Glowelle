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

const emptyForm = {
  email: "",
  password: "",
  fullName: "",
  role: "user",
};

export default function UsersAdmin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);

  const [editUser, setEditUser] = useState(null);

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const [listSearch, setListSearch] = useState("");
  const [listPage, setListPage] = useState(1);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson("/api/admin/users", { token });
      setUsers(data.users ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(
    () =>
      filterBySearch(users, listSearch, (u) => [
        u.id,
        u.email,
        u.fullName,
        u.role,
        u.createdAt,
      ]),
    [users, listSearch]
  );

  const userSlice = useMemo(
    () => slicePage(filteredUsers, listPage, ADMIN_PAGE_SIZE),
    [filteredUsers, listPage]
  );

  useEffect(() => {
    setListPage(1);
  }, [listSearch]);

  useEffect(() => {
    setListPage((p) => Math.min(p, userSlice.totalPages));
  }, [userSlice.totalPages]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiJson("/api/admin/users", {
        method: "POST",
        token,
        body: JSON.stringify({
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          fullName: createForm.fullName.trim(),
          role: createForm.role,
        }),
      });
      setCreateForm(emptyForm);
      setShowCreate(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const body = {
        email: editUser.email.trim().toLowerCase(),
        fullName: editUser.fullName.trim(),
        role: editUser.role,
      };
      if (editUser.password?.trim()) {
        body.password = editUser.password;
      }
      await apiJson(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify(body),
      });
      setEditUser(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const executeDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    try {
      await apiJson(`/api/admin/users/${confirmDeleteUser.id}`, {
        method: "DELETE",
        token,
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" aria-label="Loading users" />
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 mb-3">Users</h1>
      <p className="text-muted small mb-4">
        Create and manage accounts. Passwords are stored hashed.
      </p>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <Button onClick={() => setShowCreate(true)}>Add user</Button>
        <Form.Control
          type="search"
          placeholder="Search users…"
          value={listSearch}
          onChange={(e) => setListSearch(e.target.value)}
          style={{ maxWidth: 280 }}
          aria-label="Search users"
        />
      </div>

      {filteredUsers.length > 0 && (
        <p className="small text-muted mb-2">
          Showing {userSlice.startIndex + 1}–{userSlice.endIndex} of{" "}
          {filteredUsers.length}
        </p>
      )}

      <div className="table-responsive">
        <Table striped bordered hover size="sm" className="align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Created</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {userSlice.pageItems.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.fullName}</td>
                <td>{u.role}</td>
                <td className="small text-muted">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString()
                    : "—"}
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-1"
                    onClick={() =>
                      setEditUser({
                        id: u.id,
                        email: u.email,
                        fullName: u.fullName,
                        role: u.role,
                        password: "",
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() =>
                      setConfirmDeleteUser({
                        id: u.id,
                        label: u.fullName || u.email,
                      })
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
        page={userSlice.page}
        totalPages={userSlice.totalPages}
        onPageChange={setListPage}
      />

      {users.length > 0 && filteredUsers.length === 0 && (
        <p className="text-muted small mb-0">No users match your search.</p>
      )}

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add user</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, fullName: e.target.value }))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
                minLength={8}
                required
              />
              <Form.Text className="text-muted">At least 8 characters.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option value="user">User (shop)</option>
                <option value="admin">Admin</option>
              </Form.Select>
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

      <ConfirmModal
        show={!!confirmDeleteUser}
        onHide={() => setConfirmDeleteUser(null)}
        title="Delete user?"
        confirmLabel="Delete user"
        onConfirm={executeDeleteUser}
      >
        <p className="mb-0">
          Are you sure you want to delete{" "}
          <strong>&quot;{confirmDeleteUser?.label ?? ""}&quot;</strong>? This cannot be
          undone.
        </p>
      </ConfirmModal>

      <Modal show={!!editUser} onHide={() => setEditUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit user</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editUser?.email ?? ""}
                onChange={(e) =>
                  setEditUser((u) => (u ? { ...u, email: e.target.value } : u))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                value={editUser?.fullName ?? ""}
                onChange={(e) =>
                  setEditUser((u) => (u ? { ...u, fullName: e.target.value } : u))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>New password (optional)</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={editUser?.password ?? ""}
                onChange={(e) =>
                  setEditUser((u) => (u ? { ...u, password: e.target.value } : u))
                }
                placeholder="Leave blank to keep current password"
              />
              <Form.Text className="text-muted">
                Only fill to change password (min. 8 characters).
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={editUser?.role ?? "user"}
                onChange={(e) =>
                  setEditUser((u) => (u ? { ...u, role: e.target.value } : u))
                }
              >
                <option value="user">User (shop)</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
