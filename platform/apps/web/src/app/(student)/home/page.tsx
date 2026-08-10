'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCategories, useMyEnrollments, useTracks } from '@/lib/hooks';
import { TrackCard } from '@/components/student/TrackCard';
import { TrackCover } from '@/components/student/TrackCover';
import { Card } from '@/components/ui/Card';
import { SlidingTabs } from '@/components/ui/SlidingTabs';
import { SkeletonCard } from '@/components/ui/Skeleton';

const ALL_CATEGORY = 'ALL';

export default function StudentHomePage() {
  const { user } = useAuth();
  const { data: tracks = [], isLoading } = useTracks();
  const { data: categories = [] } = useCategories();
  const { data: enrollments = [] } = useMyEnrollments();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);

  const inProgress = enrollments.filter((e) => e.status === 'IN_PROGRESS');

  const categoryOptions = [{ value: ALL_CATEGORY, label: 'All' }, ...categories.map((c) => ({ value: c.id, label: c.name }))];

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchesCategory = selectedCategory === ALL_CATEGORY || t.category.id === selectedCategory;
      const matchesQuery = !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [tracks, selectedCategory, query]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <Card className="relative overflow-hidden p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute -top-24 -left-16 w-64 h-64 bg-crimson-500/[0.06] blur-3xl rounded-full pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            Hello {user?.name.split(' ')[0]}
            <span className="text-crimson-600">,</span>
          </h1>
          <p className="text-navy-500 mt-1">what would you like to learn today?</p>
        </div>
        <div className="relative w-full lg:w-96">
          {/* input-icon, not pl-10 — a pl-* utility ties on specificity with `.input`
              and loses on source order, dropping the text back under the icon. */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, tools, or skills..." className="input input-icon" />
        </div>
      </Card>

      {inProgress.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-navy-950 tracking-tight">In progress</h2>
            <span className="w-6 h-6 rounded-full bg-crimson-600 text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-crimson-900/20">
              {inProgress.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgress.map((e) => (
              <Link key={e.id} href={`/learning/${e.trackId}`}>
                <Card hover className="flex overflow-hidden">
                  <div className="w-32 shrink-0">
                    <TrackCover category={e.track.category.name} icon={e.track.icon} className="h-full min-h-[7rem]" />
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <p className="text-[10px] font-mono uppercase text-crimson-600 font-bold tracking-wide">{e.track.difficulty} Level</p>
                    <h4 className="font-bold text-sm text-navy-950 truncate">{e.track.title}</h4>
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-navy-400 mb-1">
                        <span>Syllabus Progress</span>
                        <span>
                          {e.completedTopicCount}/{e.totalTopicCount} units
                        </span>
                      </div>
                      <div className="h-1.5 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-crimson-600 to-crimson-500 transition-all duration-700 ease-out"
                          style={{ width: `${e.totalTopicCount ? (e.completedTopicCount / e.totalTopicCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-navy-950 tracking-tight">Explore Learning Courses</h2>
            <p className="text-xs text-navy-500">Select a category to view curriculum units.</p>
          </div>
          <SlidingTabs options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {!isLoading && filteredTracks.length === 0 && <p className="text-sm text-navy-400">No courses match your search.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredTracks.map((t) => <TrackCard key={t.id} track={t} />)}
        </div>
      </div>
    </div>
  );
}
