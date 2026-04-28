import * as React from 'react';
import { EyeIcon, EyeOffIcon, AlertTriangleIcon } from 'lucide-react';

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

  const displayUrl = sanitizeUrl(item.url);

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

            <h4 className="font-medium leading-tight truncate">
              {item.title}
            </h4>

            {item.notes && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {item.notes}
              </p>
            )}

            {displayUrl && (
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-primary hover:underline truncate"
              >
                {item.url}
              </a>
            )}
          </div>

          {hasWarning && !revealed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevealed(false)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <EyeOffIcon className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
