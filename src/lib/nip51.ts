/**
 * NIP-51: Curation Lists
 * Addressable replaceable events (kind 30100) for curating external content.
 */

import type { ContentWarningLevel } from './nip36';
import { CONTENT_WARNING_LEVELS } from './nip36';

/**
 * List type vocabulary.
 * Curators SHOULD use established type prefixes where applicable.
 */
export const LIST_TYPES = [
  'curation:articles',
  'curation:books',
  'curation:links',
  'curation:media',
  'curation:people',
  'curation:podcasts',
  'curation:videos',
  'curation:research',
  'curation:tools',
  'curation:nsfw:adult',
  'curation:nsfw:adult-images',
  'curation:nsfw:adult-videos',
] as const;

export type ListType = typeof LIST_TYPES[number] | `custom:${string}`;

/**
 * List visibility modes.
 */
export const LIST_VISIBILITY = ['public', 'premium', 'private'] as const;
export type ListVisibility = typeof LIST_VISIBILITY[number];

/**
 * The kind number for curation lists.
 */
export const CURATION_LIST_KIND = 30100;

/**
 * A single item in a curation list.
 */
export interface ListItem {
  /** The URL or NIP-19 identifier being curated */
  url: string;
  /** Display title for this item */
  title: string;
  /** Curator's personal notes about this item */
  notes?: string;
  /** Content warning level (NIP-36) */
  cw: ContentWarningLevel;
  /** Display position (lower = earlier). Defaults to order in list */
  pos?: number;
}

/**
 * Parsed curation list event data.
 */
export interface CurationList {
  /** The unique identifier (d tag) */
  id: string;
  /** List type */
  type: ListType;
  /** Human-readable title */
  title: string;
  /** Longer description or curator notes */
  description?: string;
  /** Cover image URL */
  image?: string;
  /** List-level content warning (computed from highest item flag) */
  cw: ContentWarningLevel;
  /** Visibility mode */
  visibility: ListVisibility;
  /** LNURL for premium list payments */
  lnurl?: string;
  /** One-time price in sats for premium list access */
  price?: number;
  /** Category tags for discovery */
  tags: string[];
  /** The curated items */
  items: ListItem[];
  /** Author pubkey (hex) */
  pubkey: string;
  /** Event created_at timestamp */
  createdAt: number;
  /** Event ID (hex) */
  eventId: string;
}

/**
 * Raw list item as stored in content (JSONL format).
 */
interface RawListItem {
  url: string;
  title: string;
  notes?: string;
  cw?: string;
  pos?: number;
}

/**
 * Parse the content JSONL into list items.
 */
export function parseListContent(content: string): ListItem[] {
  if (!content.trim()) return [];

  const items: ListItem[] = [];
  const lines = content.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    try {
      const raw = JSON.parse(line) as RawListItem;
      const item: ListItem = {
        url: raw.url,
        title: raw.title,
        notes: raw.notes,
        cw: CONTENT_WARNING_LEVELS.includes(raw.cw as ContentWarningLevel)
          ? (raw.cw as ContentWarningLevel)
          : 'none',
        pos: raw.pos,
      };
      items.push(item);
    } catch {
      // Skip malformed lines (non-JSON content from other kind 30100 events)
    }
  }

  return items;
}

/**
 * Serialize list items to JSONL content.
 */
export function serializeListContent(items: ListItem[]): string {
  return items
    .map((item) =>
      JSON.stringify({
        url: item.url,
        title: item.title,
        notes: item.notes || undefined,
        cw: item.cw,
        pos: item.pos,
      })
    )
    .join('\n');
}

/**
 * Extract list metadata from event tags.
 */
export function parseListTags(tags: string[][]): {
  id: string;
  type: ListType;
  title: string;
  description?: string;
  image?: string;
  cw?: ContentWarningLevel;
  visibility: ListVisibility;
  lnurl?: string;
  price?: number;
  tags: string[];
} {
  const getTag = (name: string) => tags.find(([n]) => n === name)?.[1];
  const getTags = (name: string) =>
    tags.filter(([n]) => n === name).map(([, v]) => v);

  const typeValue = getTag('type') || 'curation:links';
  const visibilityValue = getTag('visibility') || 'public';
  const cwValue = getTag('cw');

  return {
    id: getTag('d') || '',
    type: typeValue as ListType,
    title: getTag('title') || 'Untitled',
    description: getTag('description'),
    image: getTag('image'),
    cw: cwValue ? (cwValue as ContentWarningLevel) : undefined,
    visibility: LIST_VISIBILITY.includes(visibilityValue as ListVisibility)
      ? (visibilityValue as ListVisibility)
      : 'public',
    lnurl: getTag('lnurl'),
    price: getTag('price') ? parseInt(getTag('price')!, 10) : undefined,
    tags: getTags('t'),
  };
}

/**
 * Build event tags from list metadata.
 */
export function buildListTags(list: {
  id: string;
  type: ListType;
  title: string;
  description?: string;
  image?: string;
  cw?: ContentWarningLevel;
  visibility: ListVisibility;
  lnurl?: string;
  price?: number;
  tags: string[];
}): string[][] {
  const tags: string[][] = [
    ['d', list.id],
    ['type', list.type],
    ['title', list.title],
    ['visibility', list.visibility],
  ];

  if (list.description) {
    tags.push(['description', list.description]);
  }
  if (list.image) {
    tags.push(['image', list.image]);
  }
  if (list.cw && list.cw !== 'none') {
    tags.push(['cw', list.cw]);
  }
  if (list.lnurl) {
    tags.push(['lnurl', list.lnurl]);
  }
  if (list.price) {
    tags.push(['price', list.price.toString()]);
  }
  for (const tag of list.tags) {
    tags.push(['t', tag]);
  }

  return tags;
}

/**
 * Get the NIP-19 naddr for a list.
 */
export function getListNaddr(pubkey: string, kind: number, identifier: string): string {
  // This would use nostr-tools nip19 module
  // Returning placeholder - actual implementation uses nostr_encode tool
  return `naddr1${pubkey.slice(0, 8)}...`;
}

/**
 * Validate a list type.
 */
export function isValidListType(type: string): boolean {
  return (
    LIST_TYPES.includes(type as ListType) ||
    type.startsWith('custom:')
  );
}

/**
 * Get display label for a list type.
 */
export function getListTypeLabel(type: ListType): string {
  const labels: Record<string, string> = {
    'curation:articles': 'Articles',
    'curation:books': 'Books',
    'curation:links': 'Links',
    'curation:media': 'Media',
    'curation:people': 'People',
    'curation:podcasts': 'Podcasts',
    'curation:videos': 'Videos',
    'curation:research': 'Research',
    'curation:tools': 'Tools',
    'curation:nsfw:adult': 'Adult',
    'curation:nsfw:adult-images': 'Adult Images',
    'curation:nsfw:adult-videos': 'Adult Videos',
  };

  if (type.startsWith('custom:')) {
    return type.replace('custom:', '').replace(/-/g, ' ');
  }

  return labels[type] || type;
}
