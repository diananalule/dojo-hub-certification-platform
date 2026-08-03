'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Users } from 'lucide-react';
import { OfficeHourBookingDto, OfficeHourSlotDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentOfficeHoursPage() {
  const queryClient = useQueryClient();

  const { data: slots = [], isLoading } = useQuery<OfficeHourSlotDto[]>({
    queryKey: ['office-hours', 'slots'],
    queryFn: () => api.get<OfficeHourSlotDto[]>('/office-hours/slots'),
  });

  const { data: myBookings = [] } = useQuery<OfficeHourBookingDto[]>({
    queryKey: ['office-hours', 'my-bookings'],
    queryFn: () => api.get<OfficeHourBookingDto[]>('/office-hours/my-bookings'),
  });

  const book = useMutation({
    mutationFn: (slotId: string) => api.post(`/office-hours/slots/${slotId}/book`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
    },
  });

  const cancel = useMutation({
    mutationFn: (bookingId: string) => api.delete(`/office-hours/bookings/${bookingId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['office-hours'] }),
  });

  const bookedSlotIds = new Set(myBookings.map((b) => b.slotId));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Supervisor Office Hours</h1>
        <p className="text-sm text-navy-500 mt-1">Book live sessions with evaluators for guided support.</p>
      </div>

      {myBookings.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-navy-950 mb-3 uppercase tracking-wide">My Bookings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myBookings.map((b) => (
              <Card key={b.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy-950 truncate">{b.slot.topic}</p>
                  <p className="text-xs text-navy-500">
                    {new Date(b.slot.startTime).toLocaleString()} • with {b.slot.evaluatorName}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => cancel.mutate(b.id)} loading={cancel.isPending}>
                  Cancel
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-navy-950 mb-3 uppercase tracking-wide">Available Slots</h2>
        {!isLoading && slots.length === 0 && <p className="text-sm text-navy-400">No upcoming office hours have been published yet.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          {slots.map((slot) => {
            const isFull = slot.bookedCount >= slot.capacity;
            const alreadyBooked = bookedSlotIds.has(slot.id);
            return (
              <Card key={slot.id} className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-crimson-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-mono">{new Date(slot.startTime).toLocaleString()}</span>
                </div>
                <h3 className="font-bold text-sm text-navy-950">{slot.topic}</h3>
                <p className="text-xs text-navy-500">with {slot.evaluatorName}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="flex items-center gap-1 text-xs text-navy-500">
                    <Users className="w-3.5 h-3.5" /> {slot.bookedCount}/{slot.capacity}
                  </span>
                  <Button
                    size="sm"
                    disabled={isFull || alreadyBooked}
                    loading={book.isPending}
                    onClick={() => book.mutate(slot.id)}
                  >
                    {alreadyBooked ? 'Booked' : isFull ? 'Fully Booked' : 'Book Slot'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
