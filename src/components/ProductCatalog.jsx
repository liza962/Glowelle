import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Form,
  InputGroup,
  Pagination,
  Row,
} from "react-bootstrap";
import { PRODUCT_CATEGORIES, PRODUCTS } from "../data/products.js";

const PER_PAGE = 6;

export default function ProductCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const categoryOk = category === "all" || p.category === category;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return categoryOk && searchOk;
    });
  }, [search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const paginationItems = useMemo(() => {
    const items = [];
    const maxShown = 5;
    let start = Math.max(1, page - Math.floor(maxShown / 2));
    let end = start + maxShown - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxShown + 1);
    }
    for (let i = start; i <= end; i += 1) {
      items.push(i);
    }
    return items;
  }, [page, totalPages]);

  return (
    <section aria-labelledby="products-heading">
      <h2 id="products-heading" className="h4 mb-3">
        Skincare products
      </h2>
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Form.Group controlId="productSearch">
            <Form.Label className="small text-muted">Search</Form.Label>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search by name or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                aria-label="Search products"
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="productCategory">
            <Form.Label className="small text-muted">Category</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {filtered.length === 0 ? (
        <p className="text-muted mb-0">
          No products match your search and category. Try clearing the search or
          choosing &quot;All categories&quot;.
        </p>
      ) : (
        <>
          <p className="small text-muted mb-3">
            Showing {pageItems.length} of {filtered.length} product
            {filtered.length !== 1 ? "s" : ""}
            {category !== "all" && ` in ${category}`}
            {search.trim() && ` matching “${search.trim()}”`}
          </p>
          <Row className="g-4 mb-4">
            {pageItems.map((product) => (
              <Col key={product.id} sm={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Img
                    variant="top"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    style={{ objectFit: "cover", height: "180px" }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <span className="small text-muted text-uppercase mb-1">
                      {product.category}
                    </span>
                    <Card.Title as="h3" className="h6">
                      {product.name}
                    </Card.Title>
                    <Card.Text className="small text-muted flex-grow-1">
                      {product.description}
                    </Card.Text>
                    <p className="fw-semibold mb-0 text-primary">
                      {product.price}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <nav aria-label="Product list pages">
              <Pagination className="justify-content-center flex-wrap mb-0">
                <Pagination.Prev
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
                {paginationItems[0] > 1 && (
                  <>
                    <Pagination.Item onClick={() => setPage(1)}>1</Pagination.Item>
                    {paginationItems[0] > 2 && <Pagination.Ellipsis disabled />}
                  </>
                )}
                {paginationItems.map((n) => (
                  <Pagination.Item
                    key={n}
                    active={n === page}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Pagination.Item>
                ))}
                {paginationItems[paginationItems.length - 1] < totalPages && (
                  <>
                    {paginationItems[paginationItems.length - 1] <
                      totalPages - 1 && <Pagination.Ellipsis disabled />}
                    <Pagination.Item onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </Pagination.Item>
                  </>
                )}
                <Pagination.Next
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </Pagination>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
