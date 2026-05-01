import * as React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { SearchIcon, FilterIcon, ListIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListItemCard } from '@/components/curation/ListItemCard';
import { useLists } from '@/hooks/useLists';
import { useAppContext } from '@/hooks/useAppContext';
import { cn } from '@/lib/utils';
import { getListTypeLabel, type ListType } from '@/lib/nip51';
import { CONTENT_WARNING_LABELS } from '@/lib/nip36';
import { sortListsByTrust } from '@/lib/trustRanking';

const CATEGORY_OPTIONS: { value: ListType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'curation:articles', label: 'Articles' },
  { value: 'curation:books', label: 'Books' },
  { value: 'curation:links', label: 'Links' },
  { value: 'curation:media', label: 'Media' },
  { value: 'curation:people', label: 'People' },
  { value: 'curation:podcasts', label: 'Podcasts' },
  { value: 'curation:videos', label: 'Videos' },
  { value: 'curation:research', label: 'Research' },
  { value: 'curation:tools', label: 'Tools' },
  { value: 'curation:nsfw:adult', label: 'Adult' },
];

const POPULAR_TAGS = [
  'bitcoin',
  'lightning',
  'development',
  'research',
  'security',
  'privacy',
  'nostr',
  'curation',
];

export function BrowseLists() {
  useSeoMeta({
    title: 'Browse Lists | KUR4TEK',
    description: 'Discover curated content lists on Nostr',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { config } = useAppContext();

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  // Fetch lists from relay — filter by type and tag at the relay level
  const { data: lists, isLoading, error } = useLists({
    type: category === 'all' ? undefined : (category as ListType),
    tags: tag ? [tag] : undefined,
    includeNsfw: category === 'curation:nsfw:adult',
    limit: 50,
  });

  // Client-side search filter (title, description, tags)
  const filteredLists = React.useMemo(() => {
    if (!lists) return [];
    if (!search.trim()) return lists;

    const q = search.toLowerCase().trim();
    return lists.filter((list) => {
      const titleMatch = list.title.toLowerCase().includes(q);
      const descMatch = list.description?.toLowerCase().includes(q) ?? false;
      const tagMatch = list.tags.some((t) => t.toLowerCase().includes(q));
      const authorMatch = list.pubkey.toLowerCase().includes(q);
      return titleMatch || descMatch || tagMatch || authorMatch;
    });
  }, [lists, search]);

  // Sort
  const sortedLists = React.useMemo(() => {
    if (!filteredLists) return [];
    switch (sortBy) {
      case 'oldest':
        return [...filteredLists].sort((a, b) => a.createdAt - b.createdAt);
      case 'newest':
        return [...filteredLists].sort((a, b) => b.createdAt - a.createdAt);
      case 'items':
        return [...filteredLists].sort((a, b) => b.items.length - a.items.length);
      case 'trust':
      default: {
        const statsMap = new Map();
        filteredLists.forEach((list) => {
          statsMap.set(list.pubkey, { followers: 0, postCount: 0, zapAmount: 0 });
        });
        return sortListsByTrust(filteredLists, statsMap);
      }
    }
  }, [filteredLists, sortBy]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = category !== 'all' || search || tag || sortBy !== 'newest';

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Lists</h1>
        <p className="text-muted-foreground mt-1">
          Discover curated content from Nostr curators
        </p>
      </div>

      {/* ── Filter bar ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search lists by title, description, tag..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => updateParam('sort', v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="items">Most Items</SelectItem>
              <SelectItem value="trust">Trust Score</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <FilterIcon className="size-3" />
            Category:
          </span>
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('category', opt.value === 'all' ? '' : opt.value)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full transition-colors border',
                category === opt.value || (opt.value === 'all' && category === 'all')
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Popular tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Tags:</span>
          {POPULAR_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => updateParam('tag', tag === t ? '' : t)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full transition-colors',
                tag === t
                  ? 'bg-amber-600/90 text-white'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              )}
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Active:</span>
            {category !== 'all' && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                {getListTypeLabel(category as ListType)}
                <XIcon className="size-3 cursor-pointer hover:text-destructive" onClick={() => updateParam('category', '')} />
              </Badge>
            )}
            {tag && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                #{tag}
                <XIcon className="size-3 cursor-pointer hover:text-destructive" onClick={() => updateParam('tag', '')} />
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                "{search}"
                <XIcon className="size-3 cursor-pointer hover:text-destructive" onClick={() => updateParam('search', '')} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
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
      ) : error ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Failed to load lists. Check your relay connections.
            </p>
          </CardContent>
        </Card>
      ) : sortedLists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ListIcon className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {lists && lists.length === 0
                ? 'No lists found on your relays yet.'
                : 'No lists match your current filters.'}
            </p>
            <p className="text-sm text-muted-foreground">
              {lists && lists.length === 0
                ? 'Be the first to curate a list, or try adding more relays.'
                : 'Try broadening your search or clearing some filters.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {sortedLists.length} list{sortedLists.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {sortedLists.map((list) => (
              <ListCard key={list.eventId} list={list} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── List Card ─────────────────────────────────────────────── */

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
          {list.items.length > 0 && (
            <div className="space-y-2">
              {list.items.slice(0, 2).map((item, i) => (
                <ListItemCard
                  key={i}
                  item={item as any}
                  index={i}
                  showContentWarning={false}
                  className="px-0 hover:bg-transparent"
                />
              ))}
              {list.items.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{list.items.length - 2} more items
                </p>
              )}
            </div>
          )}

          {list.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {list.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {list.tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{list.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default BrowseLists;
