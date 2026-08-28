import { EmptyState } from '@/components/ui';

export default function DomainsPage() {
  return (
    <div className="animate-in">
      <h1 className="text-[19px] font-semibold tracking-tight">Domains</h1>
      <div className="mt-6">
        <EmptyState
          title="Coming in phases 7 and 8"
          description="Custom domains need a registered domain on Cloudflare before the CNAME and certificate flow can be built or tested."
        />
      </div>
    </div>
  );
}
