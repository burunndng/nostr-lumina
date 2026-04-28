import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { PlusIcon, EditIcon, TrashIcon, ListIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginArea } from '@/components/auth/LoginArea';
import { ListEditor, type ListEditorState } from '@/components/curation/ListEditor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCuratorLists } from '@/hooks/useLists';
import { useListPublish } from '@/hooks/useListPublish';
import { cn } from '@/lib/utils';
import { getListTypeLabel, type ListItem, type ListType, type ListVisibility } from '@/lib/nip51';
import { CONTENT_WARNING_LABELS, type ContentWarningLevel } from '@/lib/nip36';

export function CuratorDashboard() {
  useSeoMeta({
    title: 'My Curation Lists | NostrCurate',
    description: 'Create and manage your curation lists on Nostr',
  });

  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: lists, isLoading } = useCuratorLists(user?.pubkey);
  const { mutate: publishList, isPending: isPublishing } = useListPublish();

  const [showEditor, setShowEditor] = React.useState(false);
  const [editingList, setEditingList] = React.useState<CurationList | null>(null);

  const handleCreateNew = () => {
    setEditingList(null);
    setShowEditor(true);
  };

  const handleEditList = (list: CurationList) => {
    setEditingList(list);
    setShowEditor(true);
  };

  const handleEditorSave = (state: ListEditorState) => {
    const items: ListItem[] = state.items
      .filter((item) => item.url.trim() && item.title.trim())
      .map((item, index) => ({ ...item, pos: index }));

    publishList(
      editingList
        ? {
            ...state,
            items,
            eventId: editingList.eventId,
          }
        : {
            ...state,
            items,
          }
    );
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setEditingList(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join NostrCurate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Connect with your Nostr identity to start creating curation lists.
            </p>
            <LoginArea className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="container max-w-3xl py-8">
        <ListEditor
          initialState={
            editingList
              ? {
                  id: editingList.id,
                  type: editingList.type,
                  title: editingList.title,
                  description: editingList.description || '',
                  image: editingList.image || '',
                  visibility: editingList.visibility,
                  lnurl: editingList.lnurl || '',
                  price: editingList.price?.toString() || '',
                  tags: editingList.tags.join(', '),
                  items: editingList.items,
                }
              : undefined
          }
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
          saving={isPublishing}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Lists</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your curation lists
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <PlusIcon className="size-4 mr-2" />
          New List
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Lists</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ListGrid lists={lists} isLoading={isLoading} onEdit={handleEditList} />
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <ListGrid
            lists={lists?.filter((l) => l.visibility === 'public')}
            isLoading={isLoading}
            onEdit={handleEditList}
          />
        </TabsContent>

        <TabsContent value="premium" className="mt-6">
          <ListGrid
            lists={lists?.filter((l) => l.visibility === 'premium')}
            isLoading={isLoading}
            onEdit={handleEditList}
          />
        </TabsContent>

        <TabsContent value="private" className="mt-6">
          <ListGrid
            lists={lists?.filter((l) => l.visibility === 'private')}
            isLoading={isLoading}
            onEdit={handleEditList}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CurationList {
  id: string;
  type: ListType;
  title: string;
  description?: string;
  image?: string;
  cw: ContentWarningLevel;
  visibility: ListVisibility;
  lnurl?: string;
  price?: number;
  tags: string[];
  items: ListItem[];
  pubkey: string;
  createdAt: number;
  eventId: string;
}

interface ListGridProps {
  lists?: CurationList[];
  isLoading: boolean;
  onEdit: (list: CurationList) => void;
}

function ListGrid({ lists, isLoading, onEdit }: ListGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <ListIcon className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No lists yet. Create your first curation list to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <Card key={list.eventId} className="group">
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
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(list)}
                >
                  <EditIcon className="size-4" />
                </Button>
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
              <span className="text-muted-foreground">
                {list.items.length} items
              </span>
              {list.cw !== 'none' && (
                <Badge variant="secondary" className="text-xs">
                  {CONTENT_WARNING_LABELS[list.cw]}
                </Badge>
              )}
            </div>
            {list.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {list.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {list.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{list.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CuratorDashboard;
