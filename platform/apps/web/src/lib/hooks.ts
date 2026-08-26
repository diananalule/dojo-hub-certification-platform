'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryDto, EnrollmentDto, TrackSummaryDto } from '@dojo-hub/shared';
import { api } from './api-client';
import { useAuth } from './auth-context';

// `initialData` lets a server-rendered page seed the cache, so the list is painted on
// first load and survives the client fetch being refused during a cold start.
export function useTracks(initialData?: TrackSummaryDto[]) {
  return useQuery<TrackSummaryDto[]>({
    queryKey: ['tracks'],
    queryFn: () => api.get<TrackSummaryDto[]>('/tracks'),
    initialData,
  });
}

export function useCategories(initialData?: CategoryDto[]) {
  return useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<CategoryDto[]>('/categories'),
    initialData,
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
