import type { NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

import { CURATION_LIST_KIND, type CurationList } from '@/lib/nip51';
import { parseCurationListEvent } from './useLists';

/**
 * Fetch lists from authors in the user's NIP-02 contact list.
 * This is the "following feed" — chronological lists from curators you follow.
 */
export function useFollowingLists(options: {
  /** Current user's pubkey */
  userPubkey: string | undefined;
  /** Limit per query */
  limit?: number;
}) {
  const { nostr } = useNostr();
  const { userPubkey, limit = 30 } = options;

  // First, fetch the user's contact list (kind 2)
  const { data: contactList, isLoading: loadingContacts } = useQuery<NostrEvent | null>({
    queryKey: ['nostr', 'contacts', userPubkey],
    queryFn: async ({ signal }) => {
      if (!userPubkey) return null;

      const [event] = await nostr.query(
        [{ kinds: [2], authors: [userPubkey], limit: 1 }],
        { signal: AbortSignal.timeout(1500) },
      );

      return event ?? null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!userPubkey,
  });

  // Extract followed pubkeys from contact list
  const followedPubkeys = contactList
    ? contactList.tags
        .filter(([t]) => t === 'p')
        .map(([, pubkey]) => pubkey)
    : [];

  // Fetch lists from followed authors
  const { data: lists, isLoading: loadingLists } = useQuery<CurationList[]>({
    queryKey: ['nostr', 'lists', 'following', followedPubkeys, limit],
    queryFn: async ({ signal }) => {
      if (followedPubkeys.length === 0) return [];

      const events = await nostr.query(
        [
          {
            kinds: [CURATION_LIST_KIND],
            authors: followedPubkeys,
            limit,
          },
        ],
        { signal: AbortSignal.timeout(2000) },
      );

      return events.map(parseCurationListEvent);
    },
    staleTime: 60 * 1000,
    enabled: followedPubkeys.length > 0,
  });

  return {
    lists: lists ?? [],
    isLoading: loadingContacts || loadingLists,
    followedPubkeys,
    hasFollowing: followedPubkeys.length > 0,
  };
}
