import * as React from 'react';
import { EyeIcon, EyeOffIcon, AlertTriangleIcon, ExternalLinkIcon, LinkIcon } from 'lucide-react';
import { nip19 } from 'nostr-tools';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ListItem as ListItemType } from '@/lib/nip51';
import {
  CONTENT_WARNING_LABELS,
  CONTENT_WARNING_ICONS,
  isNsfwLevel,
  type ContentWarningLevel,
} from '@/lib/nip36';
import { sanitizeUrl } from '@/lib/sanitize';

interface ListItemCardProps {
  item: ListItemType;
  index: number;
  showContentWarning?: boolean;
  nsfwEnabled?: boolean;
  className?: string;
}

/**
 * Extract domain from URL for display.
 */
function getUrlDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Check if a URL is a Nostr identifier (npub, note, naddr, etc.)
 */
function isNostrIdentifier(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('npub1') ||
    url.startsWith('note1') ||
    url.startsWith('nprofile1') ||
    url.startsWith('nevent1') ||
    url.startsWith('naddr1') ||
    url.startsWith('nsec1')
  );
}

/**
 * Convert Nostr identifier to a clickable route.
 */
function nostrToRoute(url: string): string | null {
  try {
    const decoded = nip19.decode(url);
    switch (decoded.type) {
      case 'npub':
        return `/profile/${url}`;
      case 'note':
        return `/${url}`;
      case 'nprofile':
      case 'nevent':
      case 'naddr':
        return `/${url}`;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function ListItemCard({
  item,
  index,
  showContentWarning = true,
  nsfwEnabled = false,
  className,
}: ListItemCardProps) {
  const [revealed, setRevealed] = React.useState(false);

  const hasWarning = item.cw !== 'none';
  const isNsfw = isNsfwLevel(item.cw);
  const shouldBlur = showContentWarning && hasWarning && !revealed;

  // Don't show NSFW content unless enabled
  if (isNsfw && !nsfwEnabled && !revealed) {
    return (
      <Card
        className={cn(
          'relative overflow-hidden bg-muted/50',
          className
        )}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">
                Sensitive Content
              </p>
              <p className="text-sm text-muted-foreground">
                {CONTENT_WARNING_LABELS[item.cw]}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevealed(true)}
          >
            <EyeIcon className="size-4 mr-1" />
            Reveal
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayUrl = item.url ? sanitizeUrl(item.url) : null;
  const isNostrId = isNostrIdentifier(item.url);
  const nostrRoute = isNostrId && item.url ? nostrToRoute(item.url) : null;

  return (
    <Card
      className={cn(
        'group relative',
        shouldBlur && 'blur-sm',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">
                {index + 1}.
              </span>
              {hasWarning && (
                <Badge variant="outline" className="text-xs">
                  {CONTENT_WARNING_ICONS[item.cw]} {CONTENT_WARNING_LABELS[item.cw]}
                </Badge>
              )}
            </div>

            <h4 className="font-medium leading-tight">{item.title}</h4>

            {item.notes && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {item.notes}
              </p>
            )}

            {/* URL display */}
            {displayUrl && (
              <div className="mt-2 flex items-center gap-2">
                <ExternalLinkIcon className="size-3 text-muted-foreground shrink-0" />
                {isNostrId ? (
                  // Nostr identifier - internal link
                  nostrRoute ? (
                    <a
                      href={nostrRoute}
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {item.url.slice(0, 20)}...
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground truncate">
                      {item.url.slice(0, 20)}...
                    </span>
                  )
                ) : (
                  // Regular URL
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate"
                  >
                    <span className="hidden sm:inline">{getUrlDomain(displayUrl)}</span>
                    <span className="sm:hidden">Link</span>
                  </a>
                )}
              </div>
            )}

            {/* Notes URL detection - linkify any URLs in notes */}
            {item.notes && (
              <LinkifiedText text={item.notes} />
            )}
          </div>

          {hasWarning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevealed(!revealed)}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              {revealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple linkify for URLs in text.
 */
function LinkifiedText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (urlRegex.test(part)) {
          const displayUrl = sanitizeUrl(part);
          if (!displayUrl) return <span key={i}>{part}</span>;
          return (
            <a
              key={i}
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {getUrlDomain(part)}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
