'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryDto, EnrollmentDto, TrackSummaryDto } from '@dojo-hub/shared';
import { api } from './api-client';
import { useAuth } from './auth-context';

export function useTracks() {
  return useQuery<TrackSummaryDto[]>({ queryKey: ['tracks'], queryFn: () => api.get<TrackSummaryDto[]>('/tracks') });
}

export function useCategories() {
  return useQuery<CategoryDto[]>({ queryKey: ['categories'], queryFn: () => api.get<CategoryDto[]>('/categories') });
}

export function useMyEnrollments() {
  const { user } = useAuth();
  return useQuery<EnrollmentDto[]>({
    queryKey: ['enrollments', 'me'],
    queryFn: () => api.get<EnrollmentDto[]>('/enrollments/me'),
    enabled: !!user,
  });
}
