import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  CONTENT_WARNING_LEVELS,
  CONTENT_WARNING_LABELS,
  type ContentWarningLevel,
} from '@/lib/nip36';

interface ContentWarningSelectProps {
  value: ContentWarningLevel;
  onValueChange: (value: ContentWarningLevel) => void;
  className?: string;
}

export function ContentWarningSelect({
  value,
  onValueChange,
  className,
}: ContentWarningSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Select content warning" />
      </SelectTrigger>
      <SelectContent>
        {CONTENT_WARNING_LEVELS.map((level) => (
          <SelectItem key={level} value={level}>
            <span className="flex items-center gap-2">
              {level !== 'none' && (
                <span className="text-muted-foreground">
                  {CONTENT_WARNING_LABELS[level]}
                </span>
              )}
              {level === 'none' ? 'No Warning' : CONTENT_WARNING_LABELS[level]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
