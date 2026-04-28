import * as React from 'react';
import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { UserIcon, ListIcon, ClockIcon, ZapIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFollowingLists } from '@/hooks/useFollowingLists';
import { useNip85UserStats } from '@/hooks/useNip85Stats';
import { getListTypeLabel } from '@/lib/nip51';
import { CONTENT_WARNING_LABELS } from '@/lib/nip36';
import { cn } from '@/lib/utils';

useSeoMeta({
  title: 'Following Feed | NostrCurate',
  description: 'Lists from curators you follow',
});

export function FollowingFeed() {
  const { user } = useCurrentUser();
  const { lists, isLoading, hasFollowing } = useFollowingLists({
    userPubkey: user?.pubkey,
    limit: 30,
  });

  if (!user) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Connect to See Your Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Login with Nostr to see lists from curators you follow.
            </p>
            <LoginArea className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasFollowing) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <Card className="border-dashed">
          <CardContent className="py-12">
            <UserIcon className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Following Yet</h2>
            <p className="text-muted-foreground mb-4">
              Start following curators to see their lists in your feed.
            </p>
            <Button asChild>
              <Link to="/lists">Browse Lists</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Following</h1>
        <p className="text-muted-foreground">
          Lists from curators you follow
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ListIcon className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No new lists from followed curators yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <FeedListCard key={list.eventId} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FeedListCardProps {
  list: {
    eventId: string;
    title: string;
    description?: string;
    type: string;
    cw: string;
    items: Array<{ cw?: string }>;
    pubkey: string;
    createdAt: number;
    tags: string[];
  };
}

function FeedListCard({ list }: FeedListCardProps) {
  const { data: stats } = useNip85UserStats(list.pubkey);

  return (
    <Link to={`/list/${list.pubkey}/${list.id}`} className="block">
      <Card className="group hover:border-primary transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {getListTypeLabel(list.type as any)}
                </Badge>
                {list.cw !== 'none' && (
                  <Badge variant="secondary" className="text-xs">
                    {CONTENT_WARNING_LABELS[list.cw as keyof typeof CONTENT_WARNING_LABELS]}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{list.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {list.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <ListIcon className="size-3" />
                {list.items.length} items
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                {new Date(list.createdAt * 1000).toLocaleDateString()}
              </span>
              {stats && stats.followers > 0 && (
                <span className="flex items-center gap-1">
                  <ZapIcon className="size-3" />
                  {stats.followers} followers
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default FollowingFeed;
