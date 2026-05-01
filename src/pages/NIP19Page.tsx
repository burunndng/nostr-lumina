import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ZapButton } from '@/components/ZapButton';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { NoteContent } from '@/components/NoteContent';
import { ListItemCard } from '@/components/curation/ListItemCard';
import { useAuthor } from '@/hooks/useAuthor';
import { useLists } from '@/hooks/useLists';
import { parseCurationListEvent } from '@/hooks/useLists';
import { genUserName } from '@/lib/genUserName';
import { sanitizeUrl } from '@/lib/sanitize';
import { getListTypeLabel, CURATION_LIST_KIND } from '@/lib/nip51';
import { CONTENT_WARNING_LABELS } from '@/lib/nip36';
import NotFound from './NotFound';
import type { NostrEvent } from '@nostrify/nostrify';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile':
      return <ProfileView pubkey={decoded.data.pubkey} />;

    case 'note':
      return <NoteView noteId={decoded.data} />;

    case 'nevent':
      return <EventView eventId={decoded.data.id} />;

    case 'naddr': {
      const { pubkey, kind, identifier: dTag } = decoded.data;
      return <AddressableEventView pubkey={pubkey} kind={kind} dTag={dTag} />;
    }

    default:
      return <NotFound />;
  }
}

/* ─── Profile View ─────────────────────────────────────────── */

function ProfileView({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const { data: lists } = useLists({ author: pubkey, limit: 50 });
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey);

  useSeoMeta({
    title: `${displayName} | KUR4TEK`,
    description: metadata?.about || `Curator profile on KUR4TEK`,
  });

  return (
    <div className="container max-w-4xl py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="h-20 w-20">
              {metadata?.picture && (
                <AvatarImage src={sanitizeUrl(metadata.picture) || undefined} alt={displayName} />
              )}
              <AvatarFallback className="text-2xl">
                {displayName.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold truncate">{displayName}</h1>
                {metadata?.nip05 && (
                  <Badge variant="outline" className="text-xs">
                    {metadata.nip05}
                  </Badge>
                )}
              </div>
              {metadata?.display_name && metadata.display_name !== displayName && (
                <p className="text-muted-foreground mt-0.5">{metadata.display_name}</p>
              )}
              {metadata?.about && (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{metadata.about}</p>
              )}
              {metadata?.website && (
                <a
                  href={sanitizeUrl(metadata.website) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                >
                  {metadata.website}
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
              {/* npub for copy */}
              <div className="mt-3 flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-mono truncate max-w-[300px]">
                  {nip19.npubEncode(pubkey)}
                </code>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <strong className="text-foreground">{lists?.length || 0}</strong> lists
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Curated Lists */}
      <h2 className="text-xl font-bold mb-4">Curated Lists</h2>

      {author.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : !lists || lists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">This curator hasn't published any lists yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((list) => (
            <Card key={list.eventId} className="group hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs">
                      {getListTypeLabel(list.type)}
                    </Badge>
                    <CardTitle className="text-lg">{list.title}</CardTitle>
                  </div>
                  {list.cw !== 'none' && (
                    <Badge variant="secondary" className="text-xs">
                      {CONTENT_WARNING_LABELS[list.cw]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {list.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {list.description}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {list.items.length} items
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Note View (kind 1) ───────────────────────────────────── */

function NoteView({ noteId }: { noteId: string }) {
  const { nostr } = useNostr();
  const { data: event, isLoading } = useQuery({
    queryKey: ['nostr', 'event', noteId],
    queryFn: async () => {
      const events = await nostr.query(
        [{ ids: [noteId], limit: 1 }],
        { signal: AbortSignal.timeout(5000) },
      );
      return events[0] || null;
    },
  });

  const author = useAuthor(event?.pubkey);

  useSeoMeta({
    title: 'Note | KUR4TEK',
    description: event?.content?.slice(0, 160) || 'View this note on KUR4TEK',
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Note not found. It may not have propagated to your relays yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(event.pubkey);

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                {metadata?.picture && (
                  <AvatarImage src={sanitizeUrl(metadata.picture) || undefined} alt={displayName} />
                )}
                <AvatarFallback>{displayName.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.created_at * 1000).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <ZapButton target={{ id: event.id, pubkey: event.pubkey, kind: event.kind, created_at: event.created_at }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            <NoteContent content={event.content} />
          </div>
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <code className="font-mono">{event.id.slice(0, 16)}...</code>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <CommentsSection
          root={event}
          emptyStateMessage="No comments yet"
          emptyStateSubtitle="Be the first to reply to this note!"
        />
      </div>
    </div>
  );
}

/* ─── Event View (nevent — any kind) ───────────────────────── */

function EventView({ eventId }: { eventId: string }) {
  const { nostr } = useNostr();
  const { data: event, isLoading } = useQuery({
    queryKey: ['nostr', 'event', 'nevent', eventId],
    queryFn: async () => {
      const events = await nostr.query(
        [{ ids: [eventId], limit: 1 }],
        { signal: AbortSignal.timeout(5000) },
      );
      return events[0] || null;
    },
  });

  const author = useAuthor(event?.pubkey);

  useSeoMeta({
    title: 'Event | KUR4TEK',
    description: event?.content?.slice(0, 160) || 'View this event on KUR4TEK',
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8 flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Event not found. It may not have propagated to your relays yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(event.pubkey);

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                {metadata?.picture && (
                  <AvatarImage src={sanitizeUrl(metadata.picture) || undefined} alt={displayName} />
                )}
                <AvatarFallback>{displayName.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  Kind {event.kind} •{' '}
                  {new Date(event.created_at * 1000).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <Badge variant="outline">Kind {event.kind}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            <NoteContent content={event.content} />
          </div>
          {event.tags.length > 0 && (
            <details className="mt-4 pt-4 border-t">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                View event tags ({event.tags.length})
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
                {JSON.stringify(event.tags, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <CommentsSection
          root={event}
          emptyStateMessage="No comments yet"
          emptyStateSubtitle="Be the first to reply!"
        />
      </div>
    </div>
  );
}

/* ─── Addressable Event View (naddr) ───────────────────────── */

function AddressableEventView({ pubkey, kind, dTag }: { pubkey: string; kind: number; dTag: string }) {
  const { nostr } = useNostr();
  const { data: event, isLoading } = useQuery({
    queryKey: ['nostr', 'naddr', pubkey, kind, dTag],
    queryFn: async () => {
      const events = await nostr.query(
        [{ kinds: [kind], authors: [pubkey], '#d': [dTag], limit: 1 }],
        { signal: AbortSignal.timeout(5000) },
      );
      return events[0] || null;
    },
  });

  // If it's a curation list, use the full ListDetail-like rendering
  const isCurationList = kind === CURATION_LIST_KIND;

  useSeoMeta({
    title: isCurationList ? 'Curation List | KUR4TEK' : 'Event | KUR4TEK',
    description: event?.content?.slice(0, 160) || 'View this on KUR4TEK',
  });

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Event not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For curation lists, render the full list detail view
  if (isCurationList) {
    const list = parseCurationListEvent(event);
    return <ListDetailEmbedded list={list} />;
  }

  // For other addressable events, render a generic event view
  return <GenericAddressableView event={event} pubkey={pubkey} dTag={dTag} />;
}

/* ─── Embedded List Detail (for naddr routing) ─────────────── */

function ListDetailEmbedded({ list }: { list: ReturnType<typeof parseCurationListEvent> }) {
  const author = useAuthor(list.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(list.pubkey);

  useSeoMeta({
    title: `${list.title} | KUR4TEK`,
    description: list.description || 'View this curation list on KUR4TEK',
  });

  return (
    <div className="container max-w-3xl py-8">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                {getListTypeLabel(list.type)}
              </Badge>
              <CardTitle className="text-2xl">{list.title}</CardTitle>
              {list.description && (
                <p className="text-muted-foreground mt-2">{list.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                {metadata?.picture && (
                  <AvatarImage src={sanitizeUrl(metadata.picture) || undefined} />
                )}
                <AvatarFallback>{displayName.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {list.items.length} items •{' '}
                  {new Date(list.createdAt * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="ml-auto">
              <ZapButton
                target={{
                  id: list.eventId,
                  pubkey: list.pubkey,
                  kind: 30100,
                  created_at: list.createdAt,
                }}
              />
            </div>
          </div>

          {list.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {list.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {list.items.map((item, index) => (
          <ListItemCard
            key={index}
            item={item}
            index={index}
            showContentWarning={true}
            nsfwEnabled={true}
          />
        ))}
      </div>

      <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(200,144,64,0.15)" }}>
        <CommentsSection
          root={{
            id: list.eventId,
            pubkey: list.pubkey,
            kind: CURATION_LIST_KIND,
            created_at: list.createdAt,
            content: '',
            tags: [['d', list.id]],
          }}
          emptyStateMessage="No discussion yet"
          emptyStateSubtitle="Be the first to share your thoughts about this list!"
        />
      </div>
    </div>
  );
}

/* ─── Generic Addressable Event View ───────────────────────── */

function GenericAddressableView({ event, pubkey, dTag }: { event: NostrEvent; pubkey: string; dTag: string }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey);

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                {metadata?.picture && (
                  <AvatarImage src={sanitizeUrl(metadata.picture) || undefined} alt={displayName} />
                )}
                <AvatarFallback>{displayName.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  Kind {event.kind} •{' '}
                  {new Date(event.created_at * 1000).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <Badge variant="outline">Kind {event.kind}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            <NoteContent content={event.content} />
          </div>
          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <span>d: {dTag}</span>
          </div>
          {event.tags.length > 0 && (
            <details className="mt-4 pt-4 border-t">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                View event tags ({event.tags.length})
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
                {JSON.stringify(event.tags, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <CommentsSection
          root={event as any}
          emptyStateMessage="No comments yet"
          emptyStateSubtitle="Be the first to reply!"
        />
      </div>
    </div>
  );
}
