import './ui.css';

export const Skeleton = ({ width = '100%', height = 16, style }) => (
  <div
    className="ui-skeleton"
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
);

export const SkeletonRow = ({ cols = 4 }) => (
  <div className="ui-skeleton-row">
    {Array.from({ length: cols }, (_, i) => (
      <Skeleton key={i} height={14} />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="ui-table-skeleton">
    <Skeleton height={16} style={{ maxWidth: 200, marginBottom: 12 }} />
    {Array.from({ length: rows }, (_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </div>
);

export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="ui-empty-state">
    {icon && <div className="ui-empty-icon">{icon}</div>}
    <h3>{title}</h3>
    {subtitle && <p>{subtitle}</p>}
    {action}
  </div>
);
