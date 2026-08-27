'use client';

import { CredentialDto } from '@dojo-hub/shared';
import { Button } from '../ui/Button';
import { levelLine, subjectLine } from './certificate-subject';

export function CertificateCard({ credential, onView }: { credential: CredentialDto; onView: () => void }) {
  return (
    <div className="border-2 border-navy-950 rounded-2xl overflow-hidden max-w-2xl">
      <div className="bg-navy-950 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <p className="text-[12px] font-mono uppercase text-crimson-400">Official Verifiable Credential</p>
          <p className="font-extrabold tracking-tight">DOJO HUB (SMC)</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static asset, sized by CSS */}
        <img src="/dojohub-logo.png" alt="Dojo Hub logo" className="h-9 w-auto bg-white rounded-full p-1" />
      </div>
      <div className="p-8 text-center space-y-3">
        <p className="text-[12px] uppercase text-navy-400 tracking-widest">This certifies that</p>
        <h2 className="text-2xl font-extrabold text-navy-950">{credential.studentName}</h2>
        {levelLine(credential) && (
          <p className="text-xs text-navy-500">{levelLine(credential)}</p>
        )}
        <p className="text-[12px] uppercase text-navy-400 tracking-widest pt-2">Has fully achieved proficiency in</p>
        <h3 className="text-xl font-extrabold text-crimson-600">{subjectLine(credential)}</h3>
        <p className="text-xs text-navy-400">Issued on {new Date(credential.issuedAt).toLocaleDateString()}</p>

        <div className="bg-navy-50 rounded-xl p-4 flex items-center justify-between text-left mt-4">
          <div className="min-w-0">
            <p className="text-[12px] uppercase text-navy-400 font-mono">Cryptographic Hash</p>
            <p className="text-[12px] font-mono text-navy-600 truncate">{credential.hash}</p>
            <div className="flex gap-4 mt-2 text-[12px]">
              {credential.evaluatorSignatureName && (
                <span>
                  <span className="text-navy-400">Evaluator: </span>✓ {credential.evaluatorSignatureName}
                </span>
              )}
              {credential.adminSignatureName && (
                <span>
                  <span className="text-navy-400">Admin: </span>✓ {credential.adminSignatureName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`text-xs font-semibold ${credential.status === 'ACTIVE' ? 'text-green-600' : 'text-crimson-600'}`}>
            {credential.status === 'ACTIVE' ? '✓ Registry Verified' : '✕ Revoked'}
          </span>
          <Button size="sm" onClick={onView}>
            View Certificate
          </Button>
        </div>
      </div>
    </div>
  );
}
