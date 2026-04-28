import { useCallback } from 'react';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { NUser } from '@nostrify/react/login';

import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import type { NostrEvent } from '@nostrify/nostrify';

import {
  CURATION_LIST_KIND,
  buildListTags,
  serializeListContent,
  type ListType,
  type ListVisibility,
  type ListItem,
} from '@/lib/nip51';
import { computeListContentWarning } from '@/lib/nip36';

type ListVisibility = 'public' | 'premium' | 'private';

export interface CreateListInput {
  id: string;
  type: ListType;
  title: string;
  description?: string;
  image?: string;
  visibility: ListVisibility;
  lnurl?: string;
  price?: number;
  tags: string[];
  items: ListItem[];
}

export interface UpdateListInput extends CreateListInput {
  eventId: string;
}

/**
 * Hook for publishing curation list events (kind 30100).
 */
export function useListPublish(): UseMutationResult<
  NostrEvent,
  Error,
  CreateListInput | UpdateListInput
> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (
      input: CreateListInput | UpdateListInput
    ): Promise<NostrEvent> => {
      if (!user) {
        throw new Error('User is not logged in');
      }

      // Compute list-level cw from items
      const listCw = computeListContentWarning(input.items);

      // Build tags
      const tags = buildListTags({
        id: input.id,
        type: input.type,
        title: input.title,
        description: input.description,
        image: input.image,
        cw: listCw,
        visibility: input.visibility,
        lnurl: input.lnurl,
        price: input.price,
        tags: input.tags,
      });

      // Serialize items to content
      const content = serializeListContent(input.items);

      // Sign and publish event
      const event = await user.signer.signEvent({
        kind: CURATION_LIST_KIND,
        content,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      return event;
    },
    onError: (error) => {
      console.error('Failed to publish list:', error);
    },
    onSuccess: (data) => {
      console.log('List published successfully:', data.id);
    },
  });
}

/**
 * Hook for deleting a curation list by publishing an empty replacement.
 * Note: This is a soft delete - the list event is replaced with empty content.
 */
export function useListDelete(): UseMutationResult<
  NostrEvent,
  Error,
  { pubkey: string; id: string }
> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({
      pubkey,
      id,
    }: {
      pubkey: string;
      id: string;
    }): Promise<NostrEvent> => {
      if (!user) {
        throw new Error('User is not logged in');
      }

      const tags = buildListTags({
        id,
        type: 'curation:links',
        title: '[Deleted]',
        visibility: 'private',
        tags: [],
      });

      const event = await user.signer.signEvent({
        kind: CURATION_LIST_KIND,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      return event;
    },
    onError: (error) => {
      console.error('Failed to delete list:', error);
    },
  });
}

/**
 * Get relay propagation status for a list event.
 * This is informational - actual relay writes are handled by NPool.
 */
export async function checkListPropagation(
  nostr: { event(event: NostrEvent): Promise<void> },
  event: NostrEvent,
  relayUrls: string[]
): Promise<Record<string, 'success' | 'failed' | 'pending'>> {
  const results: Record<string, 'success' | 'failed' | 'pending'> = {};

  // This would ideally check EOSE from each relay
  // For now, we just track that we attempted to write
  for (const url of relayUrls) {
    results[url] = 'pending';
  }

  try {
    await nostr.event(event, { signal: AbortSignal.timeout(5000) });
    // Mark all relays as success if no error thrown
    for (const url of relayUrls) {
      results[url] = 'success';
    }
  } catch {
    // On error, mark all as failed
    for (const url of relayUrls) {
      results[url] = 'failed';
    }
  }

  return results;
}
