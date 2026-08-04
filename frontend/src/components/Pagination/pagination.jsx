import { ChevronLeft, ChevronRight } from 'lucide-react';
import './pagination.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= 7 || Math.abs(i - page) <= 1 || i === 1 || i === totalPages) {
      pages.push(i);
    }
  }

  const uniquePages = [...new Set(pages)];

  return (
    <div className="pagination-bar">
      <button
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      {uniquePages.map((p, idx) => (
        <span key={p} className="pagination-segment">
          {idx > 0 && p - uniquePages[idx - 1] > 1 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button
            className={`pagination-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        className="pagination-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
