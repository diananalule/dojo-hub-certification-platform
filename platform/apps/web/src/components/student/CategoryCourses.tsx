'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search } from 'lucide-react';
import { useCategories, useTracks } from '@/lib/hooks';
import { TrackCard } from './TrackCard';
import { DashboardFooter } from './DashboardFooter';
import { SkeletonCard } from '../ui/Skeleton';

/** Every course in one category, as a full grid rather than a scrolling row. */
export function CategoryCourses({ categoryId }: { categoryId: string }) {
  const { data: tracks = [], isLoading } = useTracks();
  const { data: categories = [] } = useCategories();
  const [query, setQuery] = useState('');

  const category = categories.find((c) => c.id === categoryId);

  const matches = useMemo(() => {
    const inCategory = tracks.filter((t) => t.category.id === categoryId);
    if (!query) return inCategory;
    const q = query.toLowerCase();
    return inCategory.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [tracks, categoryId, query]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <Link href="/home" className="inline-flex items-center gap-1 text-xs text-navy-500 hover:text-navy-950 font-semibold">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
            {category?.name ?? 'Courses'}
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            {isLoading ? 'Loading courses…' : `${matches.length} course${matches.length === 1 ? '' : 's'} available`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${category?.name ?? ''} courses...`}
            aria-label="Search courses in this category"
            className="input input-icon"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <p className="text-sm text-navy-400 py-10 text-center">
          {query ? 'No courses match your search.' : 'No published courses in this category yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {matches.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}
