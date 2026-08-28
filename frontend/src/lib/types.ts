/**
 * Re-export of the canonical types from the Worker (architecture.md §13).
 *
 * The backend owns the shapes because it owns the database contract. A shared
 * workspace package would be tidier, but not worth the tooling overhead at this
 * size — and a relative import makes the direction of ownership obvious.
 */
export type {
  CachedLink,
  CreateLinkBody,
  DeviceType,
  Domain,
  Link,
  NetworkType,
  Profile,
  QrCode,
  QrStyle,
  SafeBrowsingStatus,
  UpdateLinkBody,
  VerificationStatus,
} from '../../../backend/src/types';

export { DEVICE_TYPES, NETWORK_TYPES, SAFE_BROWSING_STATUSES } from '../../../backend/src/types';

/** A link joined with the hostname it lives on — the shape the list view needs. */
export interface LinkWithDomain {
  id: string;
  user_id: string;
  domain_id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  is_active: boolean;
  expires_at: string | null;
  safe_browsing_status: 'unchecked' | 'clean' | 'flagged';
  created_at: string;
  updated_at: string;
  domains: { hostname: string; is_custom: boolean } | null;
}
