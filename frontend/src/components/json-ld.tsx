import { serialize, type JsonLdNode } from '@/lib/structured-data';

/**
 * Structured data, rendered into the server HTML. A crawler that does not run
 * JavaScript — which is most of the ones answer engines send — reads this
 * from the first response or not at all.
 */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />;
}
