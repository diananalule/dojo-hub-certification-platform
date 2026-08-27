'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryDto, EnrollmentDto, TrackSummaryDto } from '@dojo-hub/shared';
import { api } from './api-client';
import { useAuth } from './auth-context';

/*
 * Waking a hibernated API takes far longer than a normal request, and the default two
 * quick retries are all spent within the first second or two of a wake-up that can run
 * to a minute. These two queries back off instead, so a cold start resolves itself while
 * the page shows its loading state rather than dead-ending on "could not load".
 */
const COLD_START_RETRY = {
  retry: 6,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000),
} as const;

// `initialData` lets a server-rendered page seed the cache, so the list is painted on
// first load and survives the client fetch being refused during a cold start.
export function useTracks(initialData?: TrackSummaryDto[]) {
  return useQuery<TrackSummaryDto[]>({
    queryKey: ['tracks'],
    queryFn: () => api.get<TrackSummaryDto[]>('/tracks'),
    initialData,
    ...COLD_START_RETRY,
  });
}

export function useCategories(initialData?: CategoryDto[]) {
  return useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<CategoryDto[]>('/categories'),
    initialData,
    ...COLD_START_RETRY,
  });
}

export function useMyEnrollments() {
  const { user } = useAuth();
  return useQuery<EnrollmentDto[]>({
    queryKey: ['enrollments', 'me'],
    queryFn: () => api.get<EnrollmentDto[]>('/enrollments/me'),
    enabled: !!user,
  });
}
