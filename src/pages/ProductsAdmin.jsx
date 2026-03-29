import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";
import AdminPagination from "../components/AdminPagination.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ADMIN_PAGE_SIZE,
  filterBySearch,
  slicePage,
} from "../utils/adminList.js";
import { formatPriceEUR, priceForNumberInput } from "../utils/formatPrice.js";
import { apiJson } from "../utils/api.js";

export default function ProductsAdmin() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [catName, setCatName] = useState("");
  const [editCat, setEditCat] = useState(null);

  const [prodForm, setProdForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [editProd, setEditProd] = useState(null);

  /** `{ kind: 'category'|'product', id, name }` */
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [prodSearch, setProdSearch] = useState("");
  const [prodPage, setProdPage] = useState(1);
  const [catSearch, setCatSearch] = useState("");
  const [catPage, setCatPage] = useState(1);

  const loadAll = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        apiJson("/api/product-categories"),
        apiJson("/api/products"),
      ]);
      setCategories(cRes.categories ?? []);
      setProducts(pRes.products ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (categories.length > 0) {
      setProdForm((f) =>
        f.categoryId ? f : { ...f, categoryId: String(categories[0].id) }
      );
    }
  }, [categories]);

  const filteredProducts = useMemo(
    () =>
      filterBySearch(products, prodSearch, (p) => [
        p.id,
        p.name,
        p.category,
        p.description,
        formatPriceEUR(p.price),
      ]),
    [products, prodSearch]
  );

  const prodSlice = useMemo(
    () => slicePage(filteredProducts, prodPage, ADMIN_PAGE_SIZE),
    [filteredProducts, prodPage]
  );

  const filteredCategories = useMemo(
    () =>
      filterBySearch(categories, catSearch, (c) => [c.id, c.name]),
    [categories, catSearch]
  );

  const catSlice = useMemo(
    () => slicePage(filteredCategories, catPage, ADMIN_PAGE_SIZE),
    [filteredCategories, catPage]
  );

  useEffect(() => {
    setProdPage(1);
  }, [prodSearch]);

  useEffect(() => {
    setProdPage((p) => Math.min(p, prodSlice.totalPages));
  }, [prodSlice.totalPages]);

  useEffect(() => {
    setCatPage(1);
  }, [catSearch]);

  useEffect(() => {
    setCatPage((p) => Math.min(p, catSlice.totalPages));
  }, [catSlice.totalPages]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = catName.trim();
    if (!name) return;
    try {
      await apiJson("/api/product-categories", {
        method: "POST",
        token,
        body: JSON.stringify({ name }),
      });
      setCatName("");
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSaveEditCategory = async (e) => {
    e.preventDefault();
    if (!editCat) return;
    const name = editCat.name.trim();
    if (!name) return;
    try {
      await apiJson(`/api/product-categories/${editCat.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ name }),
      });
      setEditCat(null);
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  };

  const executeDeleteCategory = async () => {
    if (!confirmDelete || confirmDelete.kind !== "category") return;
    try {
      await apiJson(`/api/product-categories/${confirmDelete.id}`, {
        method: "DELETE",
        token,
      });
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  };

  const executeDeleteProduct = async () => {
    if (!confirmDelete || confirmDelete.kind !== "product") return;
    try {
      await apiJson(`/api/products/${confirmDelete.id}`, {
        method: "DELETE",
        token,
      });
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const categoryId = Number(prodForm.categoryId);
    try {
      await apiJson("/api/products", {
        method: "POST",
        token,
        body: JSON.stringify({
          categoryId,
          name: prodForm.name.trim(),
          description: prodForm.description.trim(),
          price: Number(prodForm.price),
          image: prodForm.image.trim(),
        }),
      });
      setProdForm((f) => ({
        ...f,
        name: "",
        description: "",
        price: "",
        image: "",
      }));
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  };

  const openEditProduct = (p) => {
    setEditProd({
      id: p.id,
      categoryId: String(p.categoryId),
      name: p.name,
      description: p.description,
      price: priceForNumberInput(p.price),
      image: p.image,
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editProd) return;
    try {
      await apiJson(`/api/products/${editProd.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          categoryId: Number(editProd.categoryId),
          name: editProd.name.trim(),
          description: editProd.description.trim(),
          price: Number(editProd.price),
          image: editProd.image.trim(),
        }),
      });
      setEditProd(null);
      await loadAll();
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
      <h1 className="h3 my-3">Product catalog (admin)</h1>
      <p className="text-muted small mb-4">
        Images are stored as URLs only.
      </p>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs defaultActiveKey="products" className="mb-3">
        <Tab eventKey="products" title="Products">
            <section className="mb-4">
              <h2 className="h5 mb-3">Add product</h2>
              <Form onSubmit={handleAddProduct}>
                <Row className="g-2 mb-2">
                  <Col md={3}>
                    <Form.Select
                      value={prodForm.categoryId}
                      onChange={(e) =>
                        setProdForm((f) => ({ ...f, categoryId: e.target.value }))
                      }
                      required
                      aria-label="Category"
                    >
                      {categories.length === 0 ? (
                        <option value="">Add a category first</option>
                      ) : (
                        categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      placeholder="Name"
                      value={prodForm.name}
                      onChange={(e) =>
                        setProdForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </Col>
                  <Col md={2}>
                    {/* <Form.Label className="small text-muted d-block mb-1">
                      Price (EUR)
                    </Form.Label> */}
                    <Form.Control
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      placeholder="22.00"
                      value={prodForm.price}
                      onChange={(e) =>
                        setProdForm((f) => ({ ...f, price: e.target.value }))
                      }
                      required
                    />
                  </Col>
                </Row>
                <Form.Control
                  className="mb-2"
                  placeholder="Description"
                  as="textarea"
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) =>
                    setProdForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                />
                <Form.Control
                  className="mb-2"
                  type="url"
                  placeholder="Image URL (https://…)"
                  value={prodForm.image}
                  onChange={(e) =>
                    setProdForm((f) => ({ ...f, image: e.target.value }))
                  }
                  required
                />
                <Button type="submit" disabled={categories.length === 0}>
                  Add product
                </Button>
              </Form>
            </section>

            <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
              <h2 className="h5 mb-0">All products</h2>
              <Form.Control
                type="search"
                placeholder="Search products…"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                style={{ maxWidth: 280 }}
                aria-label="Search products"
              />
            </div>
            {filteredProducts.length > 0 && (
              <p className="small text-muted mb-2">
                Showing {prodSlice.startIndex + 1}–{prodSlice.endIndex} of{" "}
                {filteredProducts.length}
              </p>
            )}
            <div className="table-responsive">
              <Table striped bordered hover size="sm" className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 72 }}>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th style={{ width: 140 }} />
                  </tr>
                </thead>
                <tbody>
                  {prodSlice.pageItems.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.image}
                          alt=""
                          width={56}
                          height={40}
                          className="rounded object-fit-cover"
                          style={{ objectFit: "cover" }}
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{formatPriceEUR(p.price)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          onClick={() => openEditProduct(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() =>
                            setConfirmDelete({
                              kind: "product",
                              id: p.id,
                              name: p.name,
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
              page={prodSlice.page}
              totalPages={prodSlice.totalPages}
              onPageChange={setProdPage}
            />
            {products.length === 0 && (
              <p className="text-muted small mb-0">
                No products yet. Run <code>npm run db:init</code> to seed from the
                default catalog, or add rows above.
              </p>
            )}
            {products.length > 0 && filteredProducts.length === 0 && (
              <p className="text-muted small mb-0">No products match your search.</p>
            )}
        </Tab>

        <Tab eventKey="categories" title="Categories">
            <section className="mb-4">
              <h2 className="h5 mb-3">Add category</h2>
              <Form className="d-flex flex-wrap gap-2" onSubmit={handleAddCategory}>
                <Form.Control
                  style={{ maxWidth: 280 }}
                  placeholder="Category name"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
                <Button type="submit">Add</Button>
              </Form>
            </section>

            <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
              <h2 className="h5 mb-0">All categories</h2>
              <Form.Control
                type="search"
                placeholder="Search categories…"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                style={{ maxWidth: 280 }}
                aria-label="Search categories"
              />
            </div>
            {filteredCategories.length > 0 && (
              <p className="small text-muted mb-2">
                Showing {catSlice.startIndex + 1}–{catSlice.endIndex} of{" "}
                {filteredCategories.length}
              </p>
            )}
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th style={{ width: 160 }} />
                </tr>
              </thead>
              <tbody>
                {catSlice.pageItems.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => setEditCat({ ...c })}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          setConfirmDelete({
                            kind: "category",
                            id: c.id,
                            name: c.name,
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
            <AdminPagination
              className="mt-3"
              page={catSlice.page}
              totalPages={catSlice.totalPages}
              onPageChange={setCatPage}
            />
            {categories.length === 0 && (
              <p className="text-muted small mb-0">No categories yet. Add one above.</p>
            )}
            {categories.length > 0 && filteredCategories.length === 0 && (
              <p className="text-muted small mb-0">No categories match your search.</p>
            )}
        </Tab>
      </Tabs>

      <ConfirmModal
        show={!!confirmDelete}
        onHide={() => setConfirmDelete(null)}
        title={
          confirmDelete?.kind === "category"
            ? "Delete category?"
            : "Delete product?"
        }
        confirmLabel={
          confirmDelete?.kind === "category"
            ? "Delete category"
            : "Delete product"
        }
        onConfirm={async () => {
          if (confirmDelete?.kind === "category") {
            await executeDeleteCategory();
          } else if (confirmDelete?.kind === "product") {
            await executeDeleteProduct();
          }
        }}
      >
        {confirmDelete?.kind === "category" && (
          <p className="mb-0">
            Are you sure you want to delete the category{" "}
            <strong>&quot;{confirmDelete.name}&quot;</strong>? Products using it must be
            moved or removed first.
          </p>
        )}
        {confirmDelete?.kind === "product" && (
          <p className="mb-0">
            Are you sure you want to delete the product{" "}
            <strong>&quot;{confirmDelete.name}&quot;</strong>? This cannot be undone.
          </p>
        )}
      </ConfirmModal>

      <Modal show={!!editCat} onHide={() => setEditCat(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEditCategory}>
          <Modal.Body>
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={editCat?.name ?? ""}
              onChange={(e) =>
                setEditCat((c) => (c ? { ...c, name: e.target.value } : c))
              }
              required
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={() => setEditCat(null)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={!!editProd} onHide={() => setEditProd(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit product</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProduct}>
          <Modal.Body>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editProd?.categoryId ?? ""}
                  onChange={(e) =>
                    setEditProd((p) =>
                      p ? { ...p, categoryId: e.target.value } : p
                    )
                  }
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Price (EUR)</Form.Label>
                <Form.Control
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={editProd?.price ?? ""}
                  onChange={(e) =>
                    setEditProd((p) =>
                      p ? { ...p, price: e.target.value } : p
                    )
                  }
                  required
                />
                <Form.Text className="text-muted">
                  Enter amount in euros; € is shown on the storefront.
                </Form.Text>
              </Col>
            </Row>
            <Form.Label>Name</Form.Label>
            <Form.Control
              className="mb-2"
              value={editProd?.name ?? ""}
              onChange={(e) =>
                setEditProd((p) => (p ? { ...p, name: e.target.value } : p))
              }
              required
            />
            <Form.Label>Description</Form.Label>
            <Form.Control
              className="mb-2"
              as="textarea"
              rows={3}
              value={editProd?.description ?? ""}
              onChange={(e) =>
                setEditProd((p) =>
                  p ? { ...p, description: e.target.value } : p
                )
              }
              required
            />
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              value={editProd?.image ?? ""}
              onChange={(e) =>
                setEditProd((p) => (p ? { ...p, image: e.target.value } : p))
              }
              required
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={() => setEditProd(null)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
