import { EmptyState } from '@/components/ui';

export default function AnalyticsPage() {
  return (
    <div className="animate-in">
      <h1 className="text-[19px] font-semibold tracking-tight">Analytics</h1>
      <div className="mt-6">
        <EmptyState
          title="Coming in phase 6"
          description="Scan collection lands in phase 5; the dashboard that reads it lands in phase 6."
        />
      </div>
    </div>
  );
}
