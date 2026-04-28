import * as React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { SearchIcon, FilterIcon, ListIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListItemCard } from '@/components/curation/ListItemCard';
import { useLists } from '@/hooks/useLists';
import { useAppContext } from '@/hooks/useAppContext';
import { cn } from '@/lib/utils';
import { getListTypeLabel, type ListType } from '@/lib/nip51';
import { CONTENT_WARNING_LABELS } from '@/lib/nip36';

const CATEGORY_OPTIONS: { value: ListType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'curation:articles', label: 'Articles' },
  { value: 'curation:books', label: 'Books' },
  { value: 'curation:links', label: 'Links' },
  { value: 'curation:media', label: 'Media' },
  { value: 'curation:people', label: 'People' },
  { value: 'curation:podcasts', label: 'Podcasts' },
  { value: 'curation:videos', label: 'Videos' },
  { value: 'curation:nsfw:adult', label: 'Adult' },
];

export function BrowseLists() {
  useSeoMeta({
    title: 'Browse Lists | NostrCurate',
    description: 'Discover curated content lists on Nostr',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { config } = useAppContext();

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';

  const { data: lists, isLoading } = useLists({
    type: category === 'all' ? undefined : (category as ListType),
    tags: tag ? [tag] : undefined,
    includeNsfw: config.relayMetadata?.relays.some((r) =>
      r.url.includes('nsfw') || r.url.includes('adult')
    ) ?? false,
    limit: 30,
  });

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Lists</h1>
        <p className="text-muted-foreground mt-1">
          Discover curated content from Nostr curators
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search lists..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => updateParam('tag', prompt('Enter tag:') || '')}
        >
          <FilterIcon className="size-4 mr-2" />
          Filter by Tag
        </Button>
      </div>

      <Tabs value={category} onValueChange={(v) => updateParam('category', v)}>
        <TabsList className="flex flex-wrap h-auto">
          {CATEGORY_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value}>
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={category} className="mt-6">
          {tag && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tag:</span>
              <Badge>#{tag}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateParam('tag', '')}
              >
                Clear
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !lists || lists.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <ListIcon className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No lists found. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {lists.map((list) => (
                <ListCard key={list.eventId} list={list} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ListCardProps {
  list: {
    id: string;
    type: ListType;
    title: string;
    description?: string;
    cw: string;
    visibility: string;
    tags: string[];
    items: Array<{
      url: string;
      title: string;
      notes?: string;
      cw: string;
    }>;
    pubkey: string;
  };
}

function ListCard({ list }: ListCardProps) {
  return (
    <Link to={`/list/${list.pubkey}/${list.id}`} className="block">
      <Card className="group hover:border-primary transition-colors h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="mb-2">
                {getListTypeLabel(list.type)}
              </Badge>
              <CardTitle className="text-lg line-clamp-1">
                {list.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {list.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">
              {list.items.length} items
            </span>
            {list.cw !== 'none' && (
              <Badge variant="secondary" className="text-xs">
                {CONTENT_WARNING_LABELS[list.cw as keyof typeof CONTENT_WARNING_LABELS]}
              </Badge>
            )}
          </div>

          {/* Preview first 2 items */}
          <div className="space-y-2">
            {list.items.slice(0, 2).map((item, i) => (
              <ListItemCard
                key={i}
                item={item as any}
                index={i}
                showContentWarning={false}
                className="border-0 shadow-none bg-transparent"
              />
            ))}
            {list.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{list.items.length - 2} more items
              </p>
            )}
          </div>

          {list.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {list.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default BrowseLists;
