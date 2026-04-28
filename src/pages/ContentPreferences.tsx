import * as React from 'react';
import { useSeoMeta } from '@unhead/react';
import { AlertTriangleIcon, CheckIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  getNsfwPreferences,
  saveNsfwPreferences,
  type NsfwPreferences,
} from '@/components/curation/NsfwOptInDialog';
import {
  NSFW_CATEGORIES,
  CONTENT_WARNING_LABELS,
  type NsfwCategory,
} from '@/lib/nip36';

export function ContentPreferences() {
  useSeoMeta({
    title: 'Content Preferences | NostrCurate',
    description: 'Manage your NSFW content visibility settings',
  });
  const [prefs, setPrefs] = React.useState<NsfwPreferences>(() => getNsfwPreferences());
  const [hasChanges, setHasChanges] = React.useState(false);

  const toggleEnabled = (checked: boolean) => {
    const newPrefs = { ...prefs, enabled: checked };
    setPrefs(newPrefs);
    saveNsfwPreferences(newPrefs);
    setHasChanges(true);
  };

  const toggleCategory = (category: NsfwCategory) => {
    const newCategories = prefs.categories.includes(category)
      ? prefs.categories.filter((c) => c !== category)
      : [...prefs.categories, category];

    const newPrefs = { ...prefs, categories: newCategories };
    setPrefs(newPrefs);
    saveNsfwPreferences(newPrefs);
    setHasChanges(true);
  };

  const resetPreferences = () => {
    const defaultPrefs = { enabled: false, categories: [] as NsfwCategory[] };
    setPrefs(defaultPrefs);
    saveNsfwPreferences(defaultPrefs);
    setHasChanges(true);
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Control what types of content you see on NostrCurate
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-amber-500" />
            <CardTitle>NSFW Content</CardTitle>
          </div>
          <CardDescription>
            Enable or disable sensitive content across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show NSFW Content</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, you'll see content flagged as nudity, sexual, or violent
              </p>
            </div>
            <Switch
              checked={prefs.enabled}
              onCheckedChange={toggleEnabled}
            />
          </div>

          {prefs.enabled && (
            <div className="pt-4 border-t">
              <Label className="mb-3 block">Content Categories</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select which types of NSFW content you want to see. Unchecked categories will be blurred.
              </p>
              <div className="grid gap-3">
                {NSFW_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-start gap-3">
                    <Checkbox
                      id={`pref-${category}`}
                      checked={prefs.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={`pref-${category}`}
                        className="font-normal cursor-pointer"
                      >
                        {CONTENT_WARNING_LABELS[category]}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryDescription(category)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">NSFW enabled:</span>
              <Badge variant={prefs.enabled ? 'default' : 'secondary'}>
                {prefs.enabled ? (
                  <>
                    <CheckIcon className="size-3 mr-1" /> Enabled
                  </>
                ) : (
                  <>
                    <XIcon className="size-3 mr-1" /> Disabled
                  </>
                )}
              </Badge>
            </div>
            {prefs.categories.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Visible categories:</span>
                <div className="flex flex-wrap gap-1">
                  {prefs.categories.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">
                      {CONTENT_WARNING_LABELS[c]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={resetPreferences}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getCategoryDescription(category: NsfwCategory): string {
  const descriptions: Record<NsfwCategory, string> = {
    'nudity': 'Non-sexual nudity including art, medical, and educational content',
    'sexual-explicit': 'Explicit sexual content and adult imagery',
    'sexual-educational': 'Sexual content with educational or informational context',
    'violence': 'Violent content including conflict and aggression',
    'gore': 'Graphic depictions of injury, blood, or bodily harm',
    'drugs': 'Drug use, paraphernalia, or related content',
    'politics': 'Political opinions, commentary, and partisan content',
    'spoilers': 'Plot details that may ruin media experiences',
  };
  return descriptions[category] || '';
}

export default ContentPreferences;
