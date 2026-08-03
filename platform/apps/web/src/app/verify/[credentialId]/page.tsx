import { VerifyCredentialView } from '@/components/verify/VerifyCredentialView';

export default async function VerifyCredentialPage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = await params;
  return <VerifyCredentialView credentialId={credentialId} />;
}
