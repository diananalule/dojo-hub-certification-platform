import { UserRole } from '@dojo-hub/shared';
import { RequireRole } from '@/lib/require-role';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role={UserRole.STUDENT}>
      <DashboardShell role={UserRole.STUDENT}>{children}</DashboardShell>
    </RequireRole>
  );
}
