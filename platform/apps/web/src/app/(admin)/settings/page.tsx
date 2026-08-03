'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { CategoryDto, LevelDto } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Categories &amp; Certification Levels</h1>
        <p className="text-sm text-navy-500 mt-1">Manage course categories and the certification ladder.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoriesPanel />
        <LevelsPanel />
      </div>
    </div>
  );
}

function CategoriesPanel() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery<CategoryDto[]>({ queryKey: ['categories'], queryFn: () => api.get<CategoryDto[]>('/categories') });
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.post('/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to create category.'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Failed to delete category.'),
  });

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-navy-950">Course Categories</h3>
      {error && <p className="text-xs text-crimson-600">{error}</p>}
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          aria-label="New category name"
          className="input flex-1"
        />
        <Button
          size="sm"
          aria-label="Add category"
          disabled={!name.trim()}
          loading={create.isPending}
          onClick={() => {
            setError(null);
            create.mutate();
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-navy-50 rounded-lg px-3 py-2">
            <span className="text-sm text-navy-950 font-medium">
              {c.name} {c.isDefault && <span className="text-[10px] text-navy-400 ml-1">(default)</span>}
            </span>
            {!c.isDefault && (
              <button onClick={() => remove.mutate(c.id)} aria-label={`Delete category "${c.name}"`} className="text-navy-400 hover:text-crimson-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function LevelsPanel() {
  const queryClient = useQueryClient();
  const { data: levels = [] } = useQuery<LevelDto[]>({ queryKey: ['levels'], queryFn: () => api.get<LevelDto[]>('/levels') });
  const [editing, setEditing] = useState<LevelDto | null>(null);

  const update = useMutation({
    mutationFn: (level: LevelDto) => api.patch(`/levels/${level.id}`, { passingScore: level.passingScore }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      setEditing(null);
    },
  });

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-navy-950">Certification Ladder</h3>
      <p className="text-xs text-navy-500">
        Students advance to the next level once a supervisor approves their capstone project for their current level.
      </p>
      <div className="space-y-2">
        {[...levels]
          .sort((a, b) => a.order - b.order)
          .map((level) => (
            <div key={level.id} className="bg-navy-50 rounded-lg px-3 py-2.5">
              {editing?.id === level.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-navy-950 w-24 shrink-0">{level.name}</span>
                  <input
                    type="number"
                    value={editing.passingScore}
                    onChange={(e) => setEditing({ ...editing, passingScore: parseInt(e.target.value, 10) || 0 })}
                    aria-label={`Passing score for ${level.name}`}
                    className="input w-16"
                  />
                  <Button size="sm" loading={update.isPending} onClick={() => update.mutate(editing)}>
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-navy-950">{level.name}</span>
                    <span className="text-xs text-navy-500 ml-2">{level.passingScore}% pass score</span>
                  </div>
                  <button onClick={() => setEditing(level)} aria-label={`Edit ${level.name} level`} className="text-navy-400 hover:text-crimson-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </Card>
  );
}
