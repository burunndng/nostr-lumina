import * as React from 'react';
import { PlusIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListItemEditor } from './ListItemEditor';
import { cn } from '@/lib/utils';
import type { ListItem, ListType, ListVisibility } from '@/lib/nip51';
import {
  LIST_TYPES,
  LIST_VISIBILITY,
  getListTypeLabel,
} from '@/lib/nip51';
import type { ContentWarningLevel } from '@/lib/nip36';

export interface ListEditorState {
  id: string;
  type: ListType;
  title: string;
  description: string;
  image: string;
  visibility: ListVisibility;
  lnurl: string;
  price: string;
  tags: string;
  items: ListItem[];
}

interface ListEditorProps {
  initialState?: Partial<ListEditorState>;
  onSave: (state: ListEditorState) => void;
  onCancel: () => void;
  saving?: boolean;
  className?: string;
}

function generateId(): string {
  return `list-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyItem(): ListItem {
  return {
    url: '',
    title: '',
    notes: '',
    cw: 'none',
    pos: 0,
  };
}

export function ListEditor({
  initialState,
  onSave,
  onCancel,
  saving = false,
  className,
}: ListEditorProps) {
  const [state, setState] = React.useState<ListEditorState>({
    id: initialState?.id || generateId(),
    type: initialState?.type || 'curation:links',
    title: initialState?.title || '',
    description: initialState?.description || '',
    image: initialState?.image || '',
    visibility: initialState?.visibility || 'public',
    lnurl: initialState?.lnurl || '',
    price: initialState?.price || '',
    tags: initialState?.tags || '',
    items: initialState?.items || [createEmptyItem()],
  });

  const updateState = <K extends keyof ListEditorState>(
    key: K,
    value: ListEditorState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddItem = () => {
    const newItem = createEmptyItem();
    newItem.pos = state.items.length;
    updateState('items', [...state.items, newItem]);
  };

  const handleUpdateItem = (index: number, item: ListItem) => {
    const newItems = [...state.items];
    newItems[index] = item;
    updateState('items', newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (state.items.length <= 1) {
      // Don't remove the last item, just clear it
      handleUpdateItem(index, createEmptyItem());
      return;
    }
    const newItems = state.items.filter((_, i) => i !== index);
    // Re-index positions
    newItems.forEach((item, i) => {
      item.pos = i;
    });
    updateState('items', newItems);
  };

  const handleSave = () => {
    // Validate required fields
    if (!state.id.trim()) {
      alert('List ID is required');
      return;
    }
    if (!state.title.trim()) {
      alert('Title is required');
      return;
    }
    if (state.items.length === 0) {
      alert('At least one item is required');
      return;
    }
    // Filter out empty items
    const validItems = state.items.filter((item) => item.url.trim() && item.title.trim());
    if (validItems.length === 0) {
      alert('At least one item with URL and title is required');
      return;
    }

    onSave(state);
  };

  const parseTags = (tagString: string): string[] => {
    return tagString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>List Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="list-id">List ID *</Label>
              <Input
                id="list-id"
                value={state.id}
                onChange={(e) => updateState('id', e.target.value)}
                placeholder="unique-list-identifier"
                disabled={!!initialState?.id}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier. Cannot be changed after creation.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-type">Type *</Label>
              <Select
                value={state.type}
                onValueChange={(v) => updateState('type', v as ListType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getListTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="list-title">Title *</Label>
            <Input
              id="list-title"
              value={state.title}
              onChange={(e) => updateState('title', e.target.value)}
              placeholder="My awesome list"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              value={state.description}
              onChange={(e) => updateState('description', e.target.value)}
              placeholder="What is this list about?"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="list-image">Cover Image URL</Label>
              <Input
                id="list-image"
                type="url"
                value={state.image}
                onChange={(e) => updateState('image', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-visibility">Visibility *</Label>
              <Select
                value={state.visibility}
                onValueChange={(v) =>
                  updateState('visibility', v as ListVisibility)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="premium">Premium (Paywalled)</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.visibility === 'premium' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="list-lnurl">LNURL</Label>
                <Input
                  id="list-lnurl"
                  value={state.lnurl}
                  onChange={(e) => updateState('lnurl', e.target.value)}
                  placeholder="LNURL for payments"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="list-price">Price (sats)</Label>
                <Input
                  id="list-price"
                  type="number"
                  value={state.price}
                  onChange={(e) => updateState('price', e.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="list-tags">Tags (comma-separated)</Label>
            <Input
              id="list-tags"
              value={state.tags}
              onChange={(e) => updateState('tags', e.target.value)}
              placeholder="bitcoin, lightning, development"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items ({state.items.length})</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <PlusIcon className="size-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.items.map((item, index) => (
            <ListItemEditor
              key={index}
              item={item}
              index={index}
              onUpdate={(updated) => handleUpdateItem(index, updated)}
              onRemove={() => handleRemoveItem(index)}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Publish List'}
        </Button>
      </div>
    </div>
  );
}
