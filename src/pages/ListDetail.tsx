import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ExternalLinkIcon, LockIcon, CopyIcon, CheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListItemCard } from '@/components/curation/ListItemCard';
import { ZapButton } from '@/components/ZapButton';
import { useLists } from '@/hooks/useLists';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { sanitizeUrl } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import { getListTypeLabel } from '@/lib/nip51';
import { CONTENT_WARNING_LABELS, type ContentWarningLevel } from '@/lib/nip36';

export function ListDetail() {
  const { pubkey, id } = useParams<{ pubkey: string; id: string }>();
  const { data: list, isLoading } = useListData(pubkey, id);
  const author = useAuthor(pubkey);

  // NSFW content warning state
  const [nsfwEnabled, setNsfwEnabled] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  useSeoMeta({
    title: list ? `${list.title} | Kur4tex` : 'Loading... | Kur4tex',
    description: list?.description || 'View this curation list on Kur4tex',
  });

  const handleCopyLink = () => {
    const url = `${window.location.origin}/list/${pubkey}/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  if (!list) {
    return (
      <div className="container max-w-3xl py-8">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              List not found. It may have been deleted or is not visible to you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const listCw = list.cw as ContentWarningLevel;
  const hasNsfw = listCw !== 'none';

  return (
    <div className="container max-w-3xl py-8">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                {getListTypeLabel(list.type as any)}
              </Badge>
              <CardTitle className="text-2xl">{list.title}</CardTitle>
              {list.description && (
                <p className="text-muted-foreground mt-2">{list.description}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? (
                <CheckIcon className="size-4 mr-1" />
              ) : (
                <CopyIcon className="size-4 mr-1" />
              )}
              {copied ? 'Copied!' : 'Share'}
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Link to={`/profile/${pubkey}`} className="flex items-center gap-2 hover:opacity-80">
              <Avatar size="sm">
                {author.data?.metadata?.picture && (
                  <AvatarImage src={sanitizeUrl(author.data.metadata.picture) || undefined} />
                )}
                <AvatarFallback>
                  {author.data?.metadata?.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {author.data?.metadata?.name || genUserName(pubkey || '')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {list.items.length} items •{' '}
                  {new Date(list.createdAt * 1000).toLocaleDateString()}
                </p>
              </div>
            </Link>

            {list.visibility === 'premium' && (
              <Badge variant="secondary" className="ml-auto">
                <LockIcon className="size-3 mr-1" />
                Premium
              </Badge>
            )}

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

          {hasNsfw && (
            <div className="mt-4 p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive" className="text-xs">
                  {CONTENT_WARNING_LABELS[listCw]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  This list contains sensitive content
                </span>
              </div>
              {!nsfwEnabled ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground flex-1">
                    Enable NSFW content to view this list
                  </p>
                  <Button size="sm" onClick={() => setNsfwEnabled(true)}>
                    Show Content
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  NSFW content visible
                </p>
              )}
            </div>
          )}

          {list.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {list.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
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
            nsfwEnabled={nsfwEnabled}
          />
        ))}
      </div>
    </div>
  );
}

// useListData is the same as useLists
function useListData(pubkey?: string, id?: string) {
  const { data, isLoading } = useLists({
    author: pubkey,
    id: id,
    limit: 1,
  });

  return {
    data: data?.[0],
    isLoading,
  };
}

export default ListDetail;
