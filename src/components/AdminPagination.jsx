import { Pagination } from "react-bootstrap";

const MAX_SHOWN = 5;

export default function AdminPagination({ page, totalPages, onPageChange, className = "" }) {
  if (totalPages <= 1) return null;

  const items = [];
  let start = Math.max(1, page - Math.floor(MAX_SHOWN / 2));
  let end = start + MAX_SHOWN - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - MAX_SHOWN + 1);
  }
  for (let i = start; i <= end; i += 1) items.push(i);

  return (
    <nav
      className={`d-flex justify-content-center ${className}`}
      aria-label="Pagination"
    >
      <Pagination className="mb-0 flex-wrap">
        <Pagination.Prev
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        {items[0] > 1 && (
          <>
            <Pagination.Item onClick={() => onPageChange(1)}>1</Pagination.Item>
            {items[0] > 2 && <Pagination.Ellipsis disabled />}
          </>
        )}
        {items.map((n) => (
          <Pagination.Item
            key={n}
            active={n === page}
            onClick={() => onPageChange(n)}
          >
            {n}
          </Pagination.Item>
        ))}
        {items[items.length - 1] < totalPages && (
          <>
            {items[items.length - 1] < totalPages - 1 && (
              <Pagination.Ellipsis disabled />
            )}
            <Pagination.Item onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Pagination.Item>
          </>
        )}
        <Pagination.Next
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </Pagination>
    </nav>
  );
}
