import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  CONTENT_WARNING_LEVELS,
  NSFW_CATEGORIES,
  CONTENT_WARNING_LABELS,
  type NsfwCategory,
} from '@/lib/nip36';

/**
 * Stored NSFW preferences in localStorage.
 */
export interface NsfwPreferences {
  enabled: boolean;
  categories: NsfwCategory[];
}

const STORAGE_KEY = 'nostrcurate:nsfw-prefs';

export function getNsfwPreferences(): NsfwPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { enabled: false, categories: [] };
}

export function saveNsfwPreferences(prefs: NsfwPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

interface NsfwOptInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  strictAdultOnly?: boolean;
}

export function NsfwOptInDialog({
  open,
  onOpenChange,
  onConfirm,
  strictAdultOnly = false,
}: NsfwOptInDialogProps) {
  const [agreed, setAgreed] = React.useState(false);
  const [selectedCategories, setSelectedCategories] = React.useState<NsfwCategory[]>(
    strictAdultOnly ? ['sexual-explicit'] : NSFW_CATEGORIES.slice()
  );

  const toggleCategory = (cat: NsfwCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleConfirm = () => {
    const prefs: NsfwPreferences = {
      enabled: true,
      categories: selectedCategories,
    };
    saveNsfwPreferences(prefs);
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setAgreed(false);
    onOpenChange(false);
  };

  // Filter categories for strict adult mode
  const displayCategories = strictAdultOnly
    ? NSFW_CATEGORIES.filter((c) =>
        ['sexual-explicit', 'nudity', 'sexual-educational'].includes(c)
      )
    : NSFW_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            Adult Content Verification
          </DialogTitle>
          <DialogDescription>
            This content has been flagged as potentially sensitive. By
            proceeding, you confirm that you are 18 years of age or older and
            understand the nature of this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <AlertTriangleIcon className="size-5 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Sexually Explicit Content</p>
              <p className="text-muted-foreground">
                This content is intended for adults only and may include nudity,
                sexual imagery, or adult themes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Content Preferences</Label>
            <p className="text-sm text-muted-foreground">
              Select which types of content you wish to see:
            </p>
            <div className="grid gap-2 pt-2">
              {displayCategories.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={`nsfw-cat-${cat}`}
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <Label
                    htmlFor={`nsfw-cat-${cat}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {CONTENT_WARNING_LABELS[cat]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <Checkbox
              id="nsfw-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(!!checked)}
            />
            <Label
              htmlFor="nsfw-agree"
              className="text-sm font-normal cursor-pointer leading-snug"
            >
              I am 18 years of age or older. I understand that viewing this
              content may be illegal in my jurisdiction. I take full
              responsibility for my actions.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!agreed}>
            I am 18+, Enter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage NSFW opt-in state throughout the app.
 */
export function useNsfwOptIn() {
  const [showDialog, setShowDialog] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(
    null
  );
  const [prefs, setPrefs] = React.useState<NsfwPreferences>(() =>
    getNsfwPreferences()
  );

  const requestNsfwAccess = React.useCallback((action: () => void) => {
    if (prefs.enabled) {
      action();
    } else {
      setPendingAction(() => action);
      setShowDialog(true);
    }
  }, [prefs.enabled]);

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const refreshPrefs = () => {
    setPrefs(getNsfwPreferences());
  };

  return {
    prefs,
    showDialog,
    setShowDialog,
    handleConfirm,
    requestNsfwAccess,
    refreshPrefs,
    NsfwOptInDialogComponent: () => (
      <NsfwOptInDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onConfirm={handleConfirm}
      />
    ),
  };
}
