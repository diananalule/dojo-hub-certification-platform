'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import DojoHubLogo from '@/components/DojoHubLogo';
import { Skeleton } from '@/components/ui/Skeleton';

interface VerifyResult {
  valid: boolean;
  integrityOk?: boolean;
  status?: string;
  reason?: string;
  credential?: {
    studentName: string;
    level: { name: string };
    issuedAt: string;
    hash: string;
    status: string;
  };
}

export function VerifyCredentialView({ credentialId }: { credentialId: string }) {
  const { data, isLoading } = useQuery<VerifyResult>({
    queryKey: ['verify', credentialId],
    queryFn: () => api.get<VerifyResult>(`/credentials/verify/${credentialId}`),
  });

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <DojoHubLogo size={56} />
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-14 w-14 rounded-full mx-auto" />
            <Skeleton className="h-5 w-48 mx-auto" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        )}

        {!isLoading && data && (
          <>
            {data.valid ? (
              <div className="space-y-4">
                <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
                <h1 className="text-xl font-extrabold text-navy-950">Credential Verified</h1>
                <div className="bg-navy-50 rounded-xl p-5 text-left space-y-2">
                  <Row label="Recipient" value={data.credential!.studentName} />
                  <Row label="Level" value={data.credential!.level.name} />
                  <Row label="Issued" value={new Date(data.credential!.issuedAt).toLocaleDateString()} />
                  <Row label="Hash" value={data.credential!.hash} mono />
                </div>
                <p className="flex items-center justify-center gap-1.5 text-xs text-green-700">
                  <ShieldCheck className="w-4 h-4" /> Cryptographic integrity confirmed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <XCircle className="w-14 h-14 text-crimson-600 mx-auto" />
                <h1 className="text-xl font-extrabold text-navy-950">Not Verified</h1>
                <p className="text-sm text-navy-500">
                  {data.reason ?? (data.status === 'REVOKED' ? 'This credential has been revoked.' : 'This credential could not be verified.')}
                </p>
              </div>
            )}
          </>
        )}

        <p className="text-[10px] text-navy-400">Dojo Hub (SMC) • Official Verification Registry</p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[10px] uppercase text-navy-400 font-mono shrink-0">{label}</span>
      <span className={`text-xs text-navy-950 text-right ${mono ? 'font-mono break-all' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}
