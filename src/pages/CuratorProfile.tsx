import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ListIcon, ZapIcon, UsersIcon, FileTextIcon, ExternalLinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCuratorLists } from '@/hooks/useLists';
import { useAuthor } from '@/hooks/useAuthor';
import { useNip85UserStats } from '@/hooks/useNip85Stats';
import { genUserName } from '@/lib/genUserName';
import { getListTypeLabel } from '@/lib/nip51';
import { sanitizeUrl } from '@/lib/sanitize';
import { CONTENT_WARNING_LABELS } from '@/lib/nip36';
import { nip19 } from 'nostr-tools';

export function CuratorProfile() {
  const { npub } = useParams<{ npub: string }>();

  // Decode npub to hex pubkey
  const pubkey = React.useMemo(() => {
    if (!npub) return undefined;
    try {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') {
        return decoded.data;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, [npub]);

  const { data: author, isLoading: loadingAuthor } = useAuthor(pubkey);
  const { data: lists, isLoading: loadingLists } = useCuratorLists(pubkey);
  const { data: stats } = useNip85UserStats(pubkey);

  const metadata = author?.data?.metadata;

  useSeoMeta({
    title: metadata?.name
      ? `${metadata.name} | NostrCurate`
      : `Curator Profile | NostrCurate`,
    description: metadata?.about || 'Curator profile on NostrCurate',
  });

  if (loadingAuthor || loadingLists) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!pubkey) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <Card className="border-dashed">
          <CardContent className="py-12">
            <p className="text-muted-foreground">
              Invalid curator profile URL.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar size="lg">
              {metadata?.picture && (
                <AvatarImage
                  src={sanitizeUrl(metadata.picture) || undefined}
                  alt={metadata?.name || 'Profile'}
                />
              )}
              <AvatarFallback>
                {metadata?.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">
                  {metadata?.name || genUserName(pubkey)}
                </h1>
                {metadata?.nip05 && (
                  <Badge variant="outline" className="text-xs">
                    {metadata.nip05.split('@')[0]}
                  </Badge>
                )}
              </div>
              {metadata?.display_name && (
                <p className="text-muted-foreground">{metadata.display_name}</p>
              )}
              {metadata?.about && (
                <p className="text-muted-foreground mt-2">{metadata.about}</p>
              )}
              {metadata?.website && (
                <a
                  href={sanitizeUrl(metadata.website) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                >
                  {metadata.website}
                  <ExternalLinkIcon className="size-3" />
                </a>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm">
            {stats && (
              <>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <UsersIcon className="size-4" />
                  <strong className="text-foreground">{stats.followers}</strong> followers
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <FileTextIcon className="size-4" />
                  <strong className="text-foreground">{stats.postCount}</strong> posts
                </span>
              </>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <ListIcon className="size-4" />
              <strong className="text-foreground">{lists?.length || 0}</strong> lists
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lists */}
      <h2 className="text-xl font-bold mb-4">Curated Lists</h2>

      {loadingLists ? (
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
            <ListIcon className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              This curator hasn't published any lists yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((list) => (
            <ProfileListCard key={list.eventId} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProfileListCardProps {
  list: {
    eventId: string;
    id: string;
    title: string;
    description?: string;
    type: string;
    cw: string;
    items: Array<{ cw?: string }>;
    tags: string[];
    pubkey: string;
  };
}

function ProfileListCard({ list }: ProfileListCardProps) {
  return (
    <Link to={`/list/${list.pubkey}/${list.id}`} className="block">
      <Card className="group hover:border-primary transition-colors h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="mb-2 text-xs">
                {getListTypeLabel(list.type as any)}
              </Badge>
              <CardTitle className="text-lg">{list.title}</CardTitle>
            </div>
            {list.cw !== 'none' && (
              <Badge variant="secondary" className="text-xs">
                {CONTENT_WARNING_LABELS[list.cw as keyof typeof CONTENT_WARNING_LABELS]}
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
    </Link>
  );
}

export default CuratorProfile;
