import React from 'react';

/**
 * Skeleton primitives.
 *
 * Every skeleton here is built from theme tokens (`surface-container-*`) rather
 * than hardcoded greys, so the shimmer reads correctly in both light and dark
 * mode. The shape of each skeleton deliberately mirrors the real component it
 * stands in for — same heights, same radii, same grid — so content swapping in
 * causes no layout shift.
 */

// ── Base block ───────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '', style, rounded = 'rounded-lg', ...rest }) => (
  <div
    aria-hidden="true"
    className={`skeleton ${rounded} ${className}`}
    style={style}
    {...rest}
  />
);

export const SkeletonCircle = ({ size = 40, className = '' }) => (
  <Skeleton
    rounded="rounded-full"
    className={`flex-shrink-0 ${className}`}
    style={{ width: size, height: size }}
  />
);

/** Multi-line text block. The last line is short, the way real text wraps. */
export const SkeletonText = ({ lines = 3, className = '', lineClassName = 'h-3.5' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        rounded="rounded"
        className={lineClassName}
        style={{ width: i === lines - 1 ? '55%' : '100%' }}
      />
    ))}
  </div>
);

// ── Wrapper that fades a whole skeleton group in ──────────────────────────────
const Group = ({ className = '', children }) => (
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className={`animate-in fade-in duration-300 ${className}`}
  >
    <span className="sr-only">Loading…</span>
    {children}
  </div>
);

// ── Restaurant card ──────────────────────────────────────────────────────────
export const RestaurantCardSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
    <Skeleton rounded="rounded-none" className="h-52 w-full" />
    <div className="p-stack_md">
      <div className="flex justify-between items-start mb-3 gap-3">
        <Skeleton rounded="rounded" className="h-6 w-1/2" />
        <Skeleton rounded="rounded-lg" className="h-6 w-14" />
      </div>
      <Skeleton rounded="rounded" className="h-4 w-3/4 mb-4" />
      <div className="flex items-center gap-4 border-t border-outline-variant pt-4">
        <Skeleton rounded="rounded" className="h-3.5 w-20" />
        <Skeleton rounded="rounded" className="h-3.5 w-24" />
      </div>
    </div>
  </div>
);

export const RestaurantGridSkeleton = ({ count = 3 }) => (
  <Group className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
    {Array.from({ length: count }).map((_, i) => (
      <RestaurantCardSkeleton key={i} />
    ))}
  </Group>
);

// ── Trending / horizontal carousel card ──────────────────────────────────────
export const TrendingCardSkeleton = () => (
  <div className="min-w-[280px] bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden flex flex-col">
    <Skeleton rounded="rounded-none" className="h-48 w-full" />
    <div className="p-stack_md flex flex-col gap-3 flex-grow">
      <Skeleton rounded="rounded" className="h-5 w-3/4" />
      <Skeleton rounded="rounded" className="h-3.5 w-1/2" />
      <Skeleton rounded="rounded-xl" className="h-10 w-full mt-auto" />
    </div>
  </div>
);

// ── Menu item (FoodCard) ─────────────────────────────────────────────────────
export const FoodCardSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-16 border border-surface-variant overflow-hidden flex flex-col sm:flex-row">
    <Skeleton
      rounded="rounded-none"
      className="w-full sm:w-[140px] h-[200px] sm:h-auto sm:min-h-[150px] flex-shrink-0"
    />
    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-3">
          <Skeleton rounded="rounded" className="h-6 w-1/2" />
          <Skeleton rounded="rounded" className="h-5 w-14" />
        </div>
        <SkeletonText lines={2} lineClassName="h-3" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton rounded="rounded-full" className="h-6 w-16" />
        <Skeleton rounded="rounded-12" className="h-10 w-20" />
      </div>
    </div>
  </div>
);

/** Full menu placeholder: category heading + a two-column grid of dishes. */
export const MenuSectionSkeleton = ({ sections = 2, itemsPerSection = 4 }) => (
  <Group className="flex flex-col gap-stack_lg">
    {Array.from({ length: sections }).map((_, s) => (
      <div key={s}>
        <Skeleton rounded="rounded" className="h-7 w-44 mb-stack_md" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack_md">
          {Array.from({ length: itemsPerSection }).map((_, i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      </div>
    ))}
  </Group>
);

// ── Offer card ───────────────────────────────────────────────────────────────
export const OfferCardSkeleton = () => (
  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-16 overflow-hidden flex flex-col">
    <Skeleton rounded="rounded-none" className="h-48 w-full" />
    <div className="p-4 flex flex-col gap-3 flex-grow">
      <div className="flex items-center gap-2">
        <SkeletonCircle size={32} />
        <Skeleton rounded="rounded" className="h-3.5 w-24" />
      </div>
      <Skeleton rounded="rounded" className="h-5 w-3/4" />
      <SkeletonText lines={2} lineClassName="h-3" />
      <div className="flex gap-2 mt-auto pt-2">
        <Skeleton rounded="rounded-xl" className="h-12 flex-1" />
        <Skeleton rounded="rounded-xl" className="h-12 w-14" />
      </div>
    </div>
  </div>
);

export const OfferGridSkeleton = ({ count = 4 }) => (
  <Group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
    {Array.from({ length: count }).map((_, i) => (
      <OfferCardSkeleton key={i} />
    ))}
  </Group>
);

// ── Stat card ────────────────────────────────────────────────────────────────
export const StatCardSkeleton = () => (
  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20">
    <div className="flex justify-between items-start mb-4">
      <Skeleton rounded="rounded-xl" className="h-12 w-12" />
      <Skeleton rounded="rounded" className="h-4 w-12" />
    </div>
    <Skeleton rounded="rounded" className="h-3 w-24 mb-2" />
    <Skeleton rounded="rounded" className="h-8 w-28" />
  </div>
);

export const StatGridSkeleton = ({ count = 4 }) => (
  <Group className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
    {Array.from({ length: count }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </Group>
);

// ── Table ────────────────────────────────────────────────────────────────────
/**
 * Renders skeleton <tr> rows for an existing table body, so the real header and
 * column widths stay in place while data loads.
 *
 * `columns` accepts either a count or an array of width classes for finer
 * control over how each cell reads.
 */
export const TableRowsSkeleton = ({ rows = 6, columns = 5, firstColAvatar = true }) => {
  const widths = Array.isArray(columns)
    ? columns
    : Array.from({ length: columns }, (_, i) => (i === 0 ? 'w-28' : 'w-20'));

  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="border-b border-outline-variant/30 last:border-0">
      {widths.map((w, c) => (
        <td key={c} className="px-6 py-4">
          {c === 0 && firstColAvatar ? (
            <div className="flex items-center gap-3">
              <Skeleton rounded="rounded-lg" className="h-10 w-10 flex-shrink-0" />
              <Skeleton rounded="rounded" className={`h-4 ${w}`} />
            </div>
          ) : (
            <Skeleton rounded="rounded" className={`h-4 ${w}`} />
          )}
        </td>
      ))}
    </tr>
  ));
};

/** Standalone table placeholder including a header strip. */
export const TableSkeleton = ({ rows = 6, columns = 5, className = '' }) => (
  <Group className={`bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden ${className}`}>
    <div className="bg-surface-variant/30 px-6 py-4 flex gap-6 border-b border-outline-variant/50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} rounded="rounded" className="h-3 flex-1" />
      ))}
    </div>
    <table className="w-full">
      <tbody>
        <TableRowsSkeleton rows={rows} columns={columns} />
      </tbody>
    </table>
  </Group>
);

// ── Order history row ────────────────────────────────────────────────────────
export const OrderCardSkeleton = () => (
  <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div className="flex-grow w-full">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton rounded="rounded" className="h-6 w-32" />
        <Skeleton rounded="rounded-full" className="h-6 w-20" />
      </div>
      <Skeleton rounded="rounded" className="h-3.5 w-40 mb-3" />
      <Skeleton rounded="rounded" className="h-4 w-2/3" />
    </div>
    <div className="flex flex-col items-end gap-3 min-w-[120px] w-full md:w-auto">
      <Skeleton rounded="rounded" className="h-7 w-20" />
      <Skeleton rounded="rounded-full" className="h-10 w-full md:w-28" />
    </div>
  </div>
);

export const OrderListSkeleton = ({ count = 4 }) => (
  <Group className="grid gap-stack_md">
    {Array.from({ length: count }).map((_, i) => (
      <OrderCardSkeleton key={i} />
    ))}
  </Group>
);

// ── Generic card grid (categories, products as cards, etc.) ──────────────────
export const CardGridSkeleton = ({ count = 6, className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter' }) => (
  <Group className={className}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton rounded="rounded-xl" className="h-12 w-12" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton rounded="rounded" className="h-4 w-2/3" />
            <Skeleton rounded="rounded" className="h-3 w-1/3" />
          </div>
        </div>
        <SkeletonText lines={2} lineClassName="h-3" />
      </div>
    ))}
  </Group>
);

// ── Chart panel ──────────────────────────────────────────────────────────────
export const ChartSkeleton = ({ height = 360 }) => (
  <Group className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20">
    <div className="flex items-center justify-between mb-stack_lg gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton rounded="rounded" className="h-6 w-48" />
        <Skeleton rounded="rounded" className="h-3 w-64" />
      </div>
      <Skeleton rounded="rounded-lg" className="h-10 w-56" />
    </div>
    {/* Bars of varying height read as a chart rather than a grey slab */}
    <div className="flex items-end gap-2" style={{ height }}>
      {[45, 70, 35, 85, 55, 95, 60, 75, 40, 88, 65, 50].map((h, i) => (
        <Skeleton key={i} rounded="rounded-t-lg" className="flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  </Group>
);

// ── Rider dashboard shell ────────────────────────────────────────────────────
/**
 * The rider screens previously showed a lone spinning icon on an empty
 * viewport, which looked nothing like the skeletons used everywhere else and
 * gave no hint of the layout about to appear.
 */
export const RiderPageSkeleton = () => (
  <Group className="px-4 pt-4 pb-24 lg:pb-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonCircle size={56} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton rounded="rounded" className="h-6 w-48" />
          <Skeleton rounded="rounded" className="h-3.5 w-32" />
        </div>
      </div>
      <Skeleton rounded="rounded-2xl" className="h-40 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} rounded="rounded-2xl" className="h-28 w-full" />
        ))}
      </div>
      <Skeleton rounded="rounded-2xl" className="h-64 w-full" />
    </div>
  </Group>
);

// ── Full admin page shell (header + stats + table) ───────────────────────────
export const AdminPageSkeleton = ({ withStats = false, rows = 6, columns = 5 }) => (
  <div className="p-margin_desktop">
    <div className="flex justify-between items-center mb-stack_lg gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton rounded="rounded" className="h-8 w-56" />
        <Skeleton rounded="rounded" className="h-4 w-72" />
      </div>
      <Skeleton rounded="rounded-xl" className="h-11 w-11" />
    </div>
    {withStats && (
      <div className="mb-stack_lg">
        <StatGridSkeleton />
      </div>
    )}
    <div className="flex justify-end mb-6">
      <Skeleton rounded="rounded-xl" className="h-10 w-36" />
    </div>
    <TableSkeleton rows={rows} columns={columns} />
  </div>
);

export default Skeleton;
