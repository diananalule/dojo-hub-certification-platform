'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { CategoryDto, TrackDifficulty, TrackSummaryDto } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CurriculumProgramsPage() {
  const queryClient = useQueryClient();
  const { data: tracks = [], isLoading } = useQuery<TrackSummaryDto[]>({
    queryKey: ['tracks', 'admin'],
    queryFn: () => api.get<TrackSummaryDto[]>('/tracks/admin'),
  });
  const { data: categories = [] } = useQuery<CategoryDto[]>({ queryKey: ['categories'], queryFn: () => api.get<CategoryDto[]>('/categories') });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<TrackDifficulty>('BEGINNER');
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [icon, setIcon] = useState('📘');
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.post('/tracks', { title, description, icon, categoryId, difficulty, durationWeeks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setTitle('');
      setDescription('');
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to create program.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/tracks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracks'] }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 animate-fadeIn items-start">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-navy-950">+ New Program</h3>
        <p className="text-xs text-navy-500">Define a new on-chain certification program pathway.</p>
        {error && <p className="text-xs text-crimson-600">{error}</p>}
        <Field label="Program Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Cybersecurity Specialist Track" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Weeks Duration">
            <input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10) || 1)} className="input" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Difficulty">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as TrackDifficulty)} className="input">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </Field>
          <Field label="Launcher Emoji">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="input" />
          </Field>
        </div>
        <Field label="Syllabus Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" placeholder="Objectives and requirements scope of the program..." />
        </Field>
        <Button
          className="w-full"
          loading={create.isPending}
          disabled={!title || !categoryId || description.length < 10}
          onClick={() => {
            setError(null);
            create.mutate();
          }}
        >
          Deploy Program Path
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-navy-950 mb-1">Active Certification Programs ({tracks.length})</h3>
        <p className="text-xs text-navy-500 mb-4">Manage high-level details and configure program parameters.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          {tracks.map((t) => (
            <div key={t.id} className="border border-navy-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{t.icon}</span>
                <div className="flex gap-1.5">
                  <Badge tone={t.status === 'PUBLISHED' ? 'green' : 'amber'}>{t.status === 'PUBLISHED' ? 'Live' : 'Draft'}</Badge>
                  <Badge tone="navy">{t.category.name}</Badge>
                </div>
              </div>
              <h4 className="font-bold text-sm text-navy-950">{t.title}</h4>
              <p className="text-xs text-navy-500 line-clamp-2">{t.description}</p>
              <p className="text-[10px] text-navy-400">
                {t.durationWeeks} Weeks duration • {t.difficulty}
              </p>
              <div className="flex gap-2 pt-1">
                <Link href={`/curriculum/${t.id}`} className="flex-1">
                  <Button size="sm" variant="dark" className="w-full">
                    Manage Courses
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  aria-label={`Delete program "${t.title}"`}
                  onClick={() => {
                    if (confirm(`Delete "${t.title}" and all its content? This cannot be undone.`)) remove.mutate(t.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-navy-500 block">{label}</label>
      {children}
    </div>
  );
}
