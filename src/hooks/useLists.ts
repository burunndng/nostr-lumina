import type { NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { nip19 } from 'nostr-tools';

import {
  CURATION_LIST_KIND,
  parseListContent,
  parseListTags,
  type CurationList,
  type ListType,
} from '@/lib/nip51';
import { computeListContentWarning, type ContentWarningLevel } from '@/lib/nip36';
import { useAuthor } from './useAuthor';

/**
 * Query options for fetching curation lists.
 */
export interface UseListsOptions {
  /** Filter by list type */
  type?: ListType;
  /** Filter by author pubkey */
  author?: string;
  /** Filter by d-tag identifier */
  id?: string;
  /** Filter by category tags */
  tags?: string[];
  /** Include NSFW lists (default false) */
  includeNsfw?: boolean;
  /** Limit number of results */
  limit?: number;
}

/**
 * Parse a raw Nostr event into a CurationList.
 */
export function parseCurationListEvent(event: NostrEvent): CurationList {
  const metadata = parseListTags(event.tags);
  const items = parseListContent(event.content);

  // Compute list-level cw from items if not explicitly set
  const listCw = metadata.cw ?? computeListContentWarning(items);

  return {
    id: metadata.id,
    type: metadata.type,
    title: metadata.title,
    description: metadata.description,
    image: metadata.image,
    cw: listCw,
    visibility: metadata.visibility,
    lnurl: metadata.lnurl,
    price: metadata.price,
    tags: metadata.tags,
    items,
    pubkey: event.pubkey,
    createdAt: event.created_at,
    eventId: event.id,
  };
}

/**
 * Fetch curation lists with optional filters.
 */
export function useLists(options: UseListsOptions = {}) {
  const { nostr } = useNostr();
  const {
    type,
    author,
    id,
    tags,
    includeNsfw = false,
    limit = 20,
  } = options;

  return useQuery({
    queryKey: ['nostr', 'lists', { type, author, id, tags, includeNsfw, limit }],
    queryFn: async (): Promise<CurationList[]> => {
      const filters: Parameters<typeof nostr.query>[0] = [];

      // Base filter for curation lists
      const filter: Parameters<typeof nostr.query>[0][0] = {
        kinds: [CURATION_LIST_KIND],
        limit,
      };

      // Filter by author
      if (author) {
        filter.authors = [author];
      }

      // Filter by d-tag
      if (id) {
        filter['#d'] = [id];
      }

      // Filter by type
      if (type) {
        filter['#type'] = [type];
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        filter['#t'] = tags;
      }

      filters.push(filter);

      const events = await nostr.query(filters, { signal: AbortSignal.timeout(1500) });

      const lists = events.map(parseCurationListEvent);

      // Filter out NSFW lists if not included
      if (!includeNsfw) {
        const nsfwLevels: ContentWarningLevel[] = [
          'nudity',
          'sexual-explicit',
          'sexual-educational',
          'violence',
          'gore',
          'drugs',
        ];
        return lists.filter((list) => !nsfwLevels.includes(list.cw));
      }

      return lists;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Fetch a single curation list by naddr.
 */
export function useListByNaddr(naddr: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr', 'list', naddr],
    queryFn: async (): Promise<CurationList | null> => {
      try {
        const decoded = nip19.decode(naddr);
        if (decoded.type !== 'naddr') {
          throw new Error('Invalid naddr');
        }

        const { pubkey, kind, identifier } = decoded.data;

        const [event] = await nostr.query(
          [
            {
              kinds: [kind],
              authors: [pubkey],
              '#d': [identifier],
              limit: 1,
            },
          ],
          { signal: AbortSignal.timeout(1500) },
        );

        if (!event) {
          return null;
        }

        return parseCurationListEvent(event);
      } catch (error) {
        console.error('Failed to fetch list by naddr:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: Boolean(naddr),
  });
}

/**
 * Fetch all lists by a specific curator.
 */
export function useCuratorLists(pubkey: string | undefined) {
  const { data: author } = useAuthor(pubkey);
  const lists = useLists({ author: pubkey, limit: 50 });

  return {
    ...lists,
    curatorProfile: author?.data?.metadata,
  };
}

/**
 * Fetch lists by multiple curators (for feed/discovery).
 */
export function useListsByAuthors(pubkeys: string[], options: Omit<UseListsOptions, 'author'> = {}) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr', 'lists', 'by-authors', pubkeys, options],
    queryFn: async (): Promise<CurationList[]> => {
      if (pubkeys.length === 0) {
        return [];
      }

      const filters: Parameters<typeof nostr.query>[0] = [
        {
          kinds: [CURATION_LIST_KIND],
          authors: pubkeys,
          limit: options.limit ?? 20,
        },
      ];

      if (options.type) {
        filters[0]['#type'] = [options.type];
      }

      if (options.tags && options.tags.length > 0) {
        filters[0]['#t'] = options.tags;
      }

      const events = await nostr.query(filters, { signal: AbortSignal.timeout(1500) });

      return events.map(parseCurationListEvent);
    },
    staleTime: 60 * 1000,
    retry: 2,
    enabled: pubkeys.length > 0,
  });
}
