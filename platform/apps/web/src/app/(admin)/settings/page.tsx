'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.post('/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to create category.'),
  });
  // Renaming is allowed on every category, including defaults — only delete is blocked.
  const rename = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => api.patch(`/categories/${id}`, { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Course rows and filters read the category name, so refresh those too.
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setEditingId(null);
      setError(null);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to rename category.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setError(null);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to delete category.'),
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
          <div key={c.id} className="flex items-center justify-between gap-2 bg-navy-50 rounded-lg px-3 py-2">
            {editingId === c.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editingName.trim().length >= 2) rename.mutate({ id: c.id, newName: editingName.trim() });
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  aria-label={`Rename category "${c.name}"`}
                  autoFocus
                  className="input flex-1 py-1.5"
                />
                <Button
                  size="sm"
                  disabled={editingName.trim().length < 2}
                  loading={rename.isPending}
                  onClick={() => rename.mutate({ id: c.id, newName: editingName.trim() })}
                >
                  Save
                </Button>
                <button onClick={() => setEditingId(null)} aria-label="Cancel renaming category" className="text-navy-400 hover:text-navy-800">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-navy-950 font-medium min-w-0 truncate">
                  {c.name}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditingName(c.name);
                      setError(null);
                    }}
                    aria-label={`Rename category "${c.name}"`}
                    className="text-navy-400 hover:text-navy-800"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove.mutate(c.id)}
                    aria-label={`Delete category "${c.name}"`}
                    className="text-navy-400 hover:text-crimson-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Rungs are renameable, addable and removable. There is deliberately no pass-score
 * field: advancement is driven solely by an evaluator approving the student's capstone
 * (see UsersService.advanceToNextLevel), never by a threshold.
 */
function LevelsPanel() {
  const queryClient = useQueryClient();
  const { data: levels = [] } = useQuery<LevelDto[]>({ queryKey: ['levels'], queryFn: () => api.get<LevelDto[]>('/levels') });
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const ordered = [...levels].sort((a, b) => a.order - b.order);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['levels'] });

  const create = useMutation({
    // New rungs append to the bottom of the ladder.
    mutationFn: () => api.post('/levels', { name: newName.trim(), order: (ordered.at(-1)?.order ?? -1) + 1 }),
    onSuccess: () => {
      refresh();
      setNewName('');
      setError(null);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to add level.'),
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch(`/levels/${id}`, { name }),
    onSuccess: () => {
      refresh();
      setEditingId(null);
      setError(null);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to rename level.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/levels/${id}`),
    onSuccess: () => {
      refresh();
      setError(null);
    },
    // The API refuses to delete a level students are on or hold credentials for.
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to delete level.'),
  });

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-navy-950">Certification Ladder</h3>
      <p className="text-xs text-navy-500">
        Students advance to the next level once a supervisor approves their capstone project for their current level.
        There is no score threshold — a student is never blocked from the next course by a percentage.
      </p>

      {error && <p className="text-xs text-crimson-600">{error}</p>}

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newName.trim().length >= 2 && !create.isPending) create.mutate();
          }}
          placeholder="New level name"
          aria-label="New level name"
          className="input flex-1"
        />
        <Button
          size="sm"
          aria-label="Add level"
          disabled={newName.trim().length < 2}
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
        {ordered.map((level, index) => (
          <div key={level.id} className="flex items-center gap-3 bg-navy-50 rounded-lg px-3 py-2.5">
            <span className="w-6 h-6 shrink-0 rounded-full bg-navy-950 text-white text-[12px] font-bold flex items-center justify-center">
              {index + 1}
            </span>

            {editingId === level.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editingName.trim().length >= 2) rename.mutate({ id: level.id, name: editingName.trim() });
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  aria-label={`Rename level "${level.name}"`}
                  autoFocus
                  className="input flex-1 py-1.5"
                />
                <Button
                  size="sm"
                  disabled={editingName.trim().length < 2}
                  loading={rename.isPending}
                  onClick={() => rename.mutate({ id: level.id, name: editingName.trim() })}
                >
                  Save
                </Button>
                <button onClick={() => setEditingId(null)} aria-label="Cancel renaming" className="text-navy-400 hover:text-navy-800">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-navy-950 flex-1">{level.name}</span>
                <button
                  onClick={() => {
                    setEditingId(level.id);
                    setEditingName(level.name);
                    setError(null);
                  }}
                  aria-label={`Rename level "${level.name}"`}
                  className="text-navy-400 hover:text-navy-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    remove.mutate(level.id);
                  }}
                  aria-label={`Delete level "${level.name}"`}
                  className="text-navy-400 hover:text-crimson-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
