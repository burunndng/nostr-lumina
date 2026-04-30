import * as React from 'react';
import { ExternalLinkIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon, MessageSquareIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

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
  listPubkey?: string;
  listId?: string;
  commentCount?: number;
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
        return `/${url}`;
      case 'note':
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
  listPubkey,
  listId,
  commentCount,
}: ListItemCardProps) {
  const [revealed, setRevealed] = React.useState(false);

  const hasWarning = item.cw !== 'none';
  const isNsfw = isNsfwLevel(item.cw);
  const shouldBlur = showContentWarning && hasWarning && !revealed;

  // Don't show NSFW content unless enabled
  if (isNsfw && !nsfwEnabled && !revealed) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/30',
          className
        )}
      >
        <span className="text-sm font-medium text-muted-foreground w-5 text-right shrink-0">
          {index + 1}.
        </span>
        <AlertTriangleIcon className="size-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">
          Sensitive Content · {CONTENT_WARNING_LABELS[item.cw]}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRevealed(true)}
          className="h-7 text-xs shrink-0"
        >
          <EyeIcon className="size-3.5 mr-1" />
          Show
        </Button>
      </div>
    );
  }

  const displayUrl = item.url ? sanitizeUrl(item.url) : null;
  const isNostrId = isNostrIdentifier(item.url);
  const nostrRoute = isNostrId && item.url ? nostrToRoute(item.url) : null;
  const domain = displayUrl && !isNostrId ? getUrlDomain(displayUrl) : null;

  // Build the title link — external URL, internal Nostr route, or plain text
  const titleContent = (
    <span className="font-medium text-foreground hover:text-primary transition-colors leading-snug">
      {item.title}
    </span>
  );

  return (
    <div
      className={cn(
        'group flex gap-3 px-3 py-2.5 rounded-md hover:bg-muted/40 transition-colors',
        shouldBlur && 'blur-sm',
        className
      )}
    >
      {/* Rank number */}
      <span className="text-sm font-medium text-muted-foreground/60 w-5 text-right shrink-0 leading-relaxed">
        {index + 1}.
      </span>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Title line */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {displayUrl && !isNostrId ? (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              {titleContent}
              {domain && (
                <span className="text-xs text-muted-foreground font-normal">
                  ({domain})
                </span>
              )}
              <ExternalLinkIcon className="size-3 text-muted-foreground/50 shrink-0" />
            </a>
          ) : isNostrId && nostrRoute ? (
            <Link
              to={nostrRoute}
              className="inline-flex items-center gap-1.5"
            >
              {titleContent}
            </Link>
          ) : (
            titleContent
          )}

          {/* CW Badge inline */}
          {hasWarning && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal">
              {CONTENT_WARNING_ICONS[item.cw]} {CONTENT_WARNING_LABELS[item.cw]}
            </Badge>
          )}
        </div>

        {/* Notes - compact */}
        {item.notes && (
          <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-1 leading-relaxed">
            {item.notes}
          </p>
        )}

        {/* Metadata line */}
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/50">
          {listPubkey && listId && (
            <span>
              in{' '}
              <Link
                to={`/list/${listPubkey}/${listId}`}
                className="hover:text-muted-foreground transition-colors"
              >
                list
              </Link>
            </span>
          )}
          {commentCount !== undefined && commentCount > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquareIcon className="size-3" />
              {commentCount}
            </span>
          )}
        </div>
      </div>

      {/* Reveal button for warned content */}
      {hasWarning && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRevealed(!revealed)}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 shrink-0"
        >
          {revealed ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
        </Button>
      )}
    </div>
  );
}
