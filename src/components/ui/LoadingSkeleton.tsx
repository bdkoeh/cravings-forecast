export function LoadingSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div class="ws4000-table-wrapper">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} class="skeleton-row" style={{ animationDelay: `${i * 0.1}s` }}>
          <div class="skeleton-row__bar skeleton-row__bar--icon" />
          <div class="skeleton-row__bar skeleton-row__bar--name" />
          <div class="skeleton-row__bar skeleton-row__bar--hood" />
          <div class="skeleton-row__bar skeleton-row__bar--cuisine" />
        </div>
      ))}
    </div>
  );
}
