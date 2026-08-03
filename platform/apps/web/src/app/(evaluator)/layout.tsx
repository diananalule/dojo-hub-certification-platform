import { UserRole } from '@dojo-hub/shared';
import { RequireRole } from '@/lib/require-role';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function EvaluatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role={UserRole.EVALUATOR}>
      <DashboardShell role={UserRole.EVALUATOR}>{children}</DashboardShell>
    </RequireRole>
  );
}
