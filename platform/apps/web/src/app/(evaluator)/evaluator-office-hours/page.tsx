'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Users } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonRow } from '@/components/ui/Skeleton';

interface MySlot {
  id: string;
  topic: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookings: { id: string; student: { name: string; email: string } }[];
}

export default function EvaluatorOfficeHoursPage() {
  const queryClient = useQueryClient();
  const { data: slots = [], isLoading } = useQuery<MySlot[]>({
    queryKey: ['office-hours', 'my-slots'],
    queryFn: () => api.get<MySlot[]>('/office-hours/my-slots'),
  });

  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.post('/office-hours/slots', { topic, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString(), capacity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      setTopic('');
      setStartTime('');
      setEndTime('');
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to publish slot.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/office-hours/slots/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['office-hours'] }),
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Publish Office Hours</h1>
        <p className="text-sm text-navy-500 mt-1">Open a slot for students to book guided support sessions with you.</p>
      </div>

      <Card className="p-6 space-y-3">
        {error && <p className="text-xs text-crimson-600">{error}</p>}
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Session topic" className="input" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} aria-label="Start time" className="input" />
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} aria-label="End time" className="input" />
          <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)} aria-label="Capacity" className="input" placeholder="Capacity" />
        </div>
        <Button size="sm" disabled={!topic || !startTime || !endTime} loading={create.isPending} onClick={() => create.mutate()}>
          <Plus className="w-4 h-4" /> Publish Slot
        </Button>
      </Card>

      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-0">
              <SkeletonRow />
            </Card>
          ))}
        {slots.map((slot) => (
          <Card key={slot.id} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-navy-950">{slot.topic}</p>
                <p className="text-xs text-navy-500">
                  {new Date(slot.startTime).toLocaleString()} — {new Date(slot.endTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-navy-500">
                  <Users className="w-3.5 h-3.5" /> {slot.bookings.length}/{slot.capacity}
                </span>
                <button onClick={() => remove.mutate(slot.id)} aria-label="Delete office hours slot" className="text-navy-400 hover:text-crimson-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {slot.bookings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-navy-100 space-y-1">
                {slot.bookings.map((b) => (
                  <p key={b.id} className="text-xs text-navy-600">
                    • {b.student.name} ({b.student.email})
                  </p>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
