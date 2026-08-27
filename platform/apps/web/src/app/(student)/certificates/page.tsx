'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Award } from 'lucide-react';
import { CredentialDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { CertificateCard } from '@/components/student/CertificateCard';
import { CertificateModal } from '@/components/student/CertificateModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// Capstone submission — hidden for now. Certificates are earned by completing a course,
// not by an approved capstone, so leading this page with a capstone form contradicted
// how the platform actually works. The panel and its API remain in place; re-import
// CapstoneSubmissionPanel and render it here to bring the ladder back.

export default function CertificatesPage() {
  const { data: credentials = [], isLoading } = useQuery<CredentialDto[]>({
    queryKey: ['credentials', 'me'],
    queryFn: () => api.get<CredentialDto[]>('/credentials/me'),
  });
  const [viewing, setViewing] = useState<CredentialDto | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">My Certificates</h1>
        <p className="text-sm text-navy-500 mt-1">
          Every course you finish earns a certificate. Each one carries a QR code and a signed
          reference that anyone — an employer, a university — can check without needing an account.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && credentials.length === 0 && (
        <div className="bg-white rounded-2xl border border-navy-200 p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-navy-50 border border-navy-200 flex items-center justify-center">
            <Award className="w-5 h-5 text-navy-400" />
          </div>
          <p className="mt-4 font-bold text-navy-950">No certificates yet</p>
          <p className="mt-1 text-sm text-navy-500 max-w-sm mx-auto">
            Finish a course and claim your certificate from the course page. It appears here
            straight away, ready to download or share.
          </p>
          <Link href="/learning" className="inline-block mt-5">
            <Button>Go to my courses</Button>
          </Link>
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
