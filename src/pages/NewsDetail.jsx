import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { apiJson } from "../utils/api.js";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson(`/api/news/${id}`);
      setItem(data.item ?? null);
    } catch (e) {
      setError(e.message);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    <div className="page-news-detail my-3">
      <nav className="mb-4" aria-label="Breadcrumb">
        <Link to="/news" className="news-back-link">
          ← All articles
        </Link>
      </nav>

      {error && (
        <p className="text-danger mb-4" role="alert">
          {error}
        </p>
      )}

      {item && !error && (
        <article className="news-article-page">
          <header className="news-article-page-header border-bottom">
            <time
              className="news-article-page-date"
              dateTime={item.createdAt ?? ""}
            >
              {formatDate(item.createdAt)}
            </time>
            <h1 className="news-article-page-title">{item.title}</h1>
          </header>
          <div className="news-article-page-body">{item.body}</div>
        </article>
      )}
    </div>
  );
}
