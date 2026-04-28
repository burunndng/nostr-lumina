import * as React from 'react';
import { GripIcon, TrashIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContentWarningSelect } from './ContentWarningSelect';
import { cn } from '@/lib/utils';
import type { ListItem } from '@/lib/nip51';
import type { ContentWarningLevel } from '@/lib/nip36';

interface ListItemEditorProps {
  item: ListItem;
  index: number;
  onUpdate: (item: ListItem) => void;
  onRemove: () => void;
  className?: string;
}

export function ListItemEditor({
  item,
  index,
  onUpdate,
  onRemove,
  className,
}: ListItemEditorProps) {
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...item, url: e.target.value });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...item, title: e.target.value });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...item, notes: e.target.value });
  };

  const handleCwChange = (value: ContentWarningLevel) => {
    onUpdate({ ...item, cw: value });
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
        >
          <GripIcon className="size-4" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          Item {index + 1}
        </span>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`url-${index}`}>URL *</Label>
          <Input
            id={`url-${index}`}
            type="url"
            value={item.url}
            onChange={handleUrlChange}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`title-${index}`}>Title *</Label>
          <Input
            id={`title-${index}`}
            value={item.title}
            onChange={handleTitleChange}
            placeholder="Item title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`notes-${index}`}>Curator Notes</Label>
        <Textarea
          id={`notes-${index}`}
          value={item.notes || ''}
          onChange={handleNotesChange}
          placeholder="Your thoughts on this item..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`cw-${index}`}>Content Warning</Label>
        <ContentWarningSelect
          id={`cw-${index}`}
          value={item.cw}
          onValueChange={handleCwChange}
        />
      </div>
    </div>
  );
}
