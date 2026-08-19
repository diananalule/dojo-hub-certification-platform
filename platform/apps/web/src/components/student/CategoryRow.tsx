'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TrackSummaryDto } from '@dojo-hub/shared';
import { TrackCard } from './TrackCard';
import { CourseCarousel } from './CourseCarousel';

/**
 * One category's courses as a titled, horizontally scrollable row. Rows are capped so
 * the dashboard stays skimmable; the rest live on the category page behind "See all".
 */
const ROW_LIMIT = 8;

export function CategoryRow({
  categoryId,
  categoryName,
  tracks,
}: {
  categoryId: string;
  categoryName: string;
  tracks: TrackSummaryDto[];
}) {
  if (tracks.length === 0) return null;

  const shown = tracks.slice(0, ROW_LIMIT);
  const hasMore = tracks.length > shown.length;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-navy-950 tracking-tight">{categoryName}</h3>
          <p className="text-xs text-navy-500">
            {tracks.length} course{tracks.length === 1 ? '' : 's'}
          </p>
        </div>
        {/* Always offered, not just when truncated — it is also how you browse a category. */}
        <Link
          href={`/learning/category/${categoryId}`}
          className="flex items-center gap-1 text-xs font-bold text-crimson-600 hover:text-crimson-700 whitespace-nowrap"
        >
          See all{hasMore ? ` (${tracks.length})` : ''}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <CourseCarousel>
        {shown.map((t) => (
          <div key={t.id} className="w-[15rem] sm:w-[16rem] shrink-0">
            <TrackCard track={t} />
          </div>
        ))}
      </CourseCarousel>
    </section>
  );
}
