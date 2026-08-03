'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CredentialDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { CertificateCard } from '@/components/student/CertificateCard';
import { CertificateModal } from '@/components/student/CertificateModal';
import { CapstoneSubmissionPanel } from '@/components/student/CapstoneSubmissionPanel';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CertificatesPage() {
  const { data: credentials = [], isLoading } = useQuery<CredentialDto[]>({
    queryKey: ['credentials', 'me'],
    queryFn: () => api.get<CredentialDto[]>('/credentials/me'),
  });
  const [viewing, setViewing] = useState<CredentialDto | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">My Cryptographically Secured Certifications</h1>
        <p className="text-sm text-navy-500 mt-1">
          Each proficiency level you complete triggers a cryptographic signature and registers a verifiable hash on our public Dojo
          ledger.
        </p>
      </div>

      <CapstoneSubmissionPanel />

      {isLoading && (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}
      {!isLoading && credentials.length === 0 && (
        <div className="bg-white rounded-2xl border border-navy-200 p-10 text-center">
          <p className="text-sm text-navy-500">
            No credentials yet — submit your capstone project above to earn your first certification.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {credentials.map((c) => (
          <CertificateCard key={c.id} credential={c} onView={() => setViewing(c)} />
        ))}
      </div>

      {viewing && <CertificateModal credential={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
