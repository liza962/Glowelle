import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { apiJson } from "../utils/api.js";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="news-loading">
        <Spinner animation="border" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="page-news my-3">
      <section className="news-hero mb-4 mb-lg-5" aria-labelledby="news-title">
        <div className="news-hero-inner">
          <p className="news-hero-eyebrow text-uppercase mb-2 mb-md-3">Journal</p>
          <h1 id="news-title" className="news-hero-title display-5 fw-semibold mb-3">
            News &amp; tips
          </h1>
          <p className="news-hero-lead lead text-muted mb-0">
            Short reads on routines, sun care, and skin barrier basics—written to
            fit real life, not hype.
          </p>
        </div>
      </section>

      {error && (
        <p className="text-danger small mb-4" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 && !error ? (
        <div className="news-empty">
          <p className="mb-0">
            No articles yet. <span className="text-body-secondary">Check back soon.</span>
          </p>
        </div>
      ) : (
        <div className="news-list">
          {items.map((n) => (
            <article key={n.id}>
              <Link
                to={`/news/${n.id}`}
                className="news-article-card d-block text-decoration-none text-reset"
              >
                <div className="news-article-card-inner">
                  <time className="news-article-card-date" dateTime={n.createdAt ?? ""}>
                    {formatDate(n.createdAt)}
                  </time>
                  <h2 className="news-article-card-title">{n.title}</h2>
                  <span className="news-article-card-cta">Read →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
