import { UserRole } from '@dojo-hub/shared';
import { RequireRole } from '@/lib/require-role';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role={UserRole.ADMIN}>
      <DashboardShell role={UserRole.ADMIN}>{children}</DashboardShell>
    </RequireRole>
  );
}
