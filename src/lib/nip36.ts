/**
 * NIP-36: Content Warning Vocabulary
 * Per-item content warning flags for discovery filtering and reader gating.
 */

/**
 * Content warning levels - mutually exclusive per item.
 * Higher numeric value = more severe for aggregation purposes.
 */
export const CONTENT_WARNING_LEVELS = [
  'none',
  'nudity',
  'sexual-educational',
  'sexual-explicit',
  'violence',
  'gore',
  'drugs',
  'politics',
  'spoilers',
] as const;

export type ContentWarningLevel = typeof CONTENT_WARNING_LEVELS[number];

/**
 * NSFW category flags - these indicate the TYPE of sensitive content.
 * Used for granular reader preferences (e.g., "show educational but not explicit").
 */
export const NSFW_CATEGORIES = [
  'nudity',
  'sexual-explicit',
  'sexual-educational',
  'violence',
  'gore',
  'drugs',
  'politics',
  'spoilers',
] as const;

export type NsfwCategory = typeof NSFW_CATEGORIES[number];

/**
 * Severity ranking for content warnings.
 * Used to compute list-level cw tag (highest item flag).
 */
export const CONTENT_WARNING_SEVERITY: Record<ContentWarningLevel, number> = {
  'none': 0,
  'nudity': 1,
  'sexual-educational': 2,
  'sexual-explicit': 3,
  'violence': 3,
  'gore': 4,
  'drugs': 2,
  'politics': 1,
  'spoilers': 1,
};

/**
 * Human-readable labels for content warning levels.
 */
export const CONTENT_WARNING_LABELS: Record<ContentWarningLevel, string> = {
  'none': 'None',
  'nudity': 'Nudity',
  'sexual-educational': 'Sexual (Educational)',
  'sexual-explicit': 'Sexual (Explicit)',
  'violence': 'Violence',
  'gore': 'Gore',
  'drugs': 'Drugs',
  'politics': 'Politics',
  'spoilers': 'Spoilers',
};

/**
 * Emoji icons for content warning levels.
 */
export const CONTENT_WARNING_ICONS: Record<ContentWarningLevel, string> = {
  'none': '',
  'nudity': '🔴',
  'sexual-educational': '🟡',
  'sexual-explicit': '🔴',
  'violence': '🟡',
  'gore': '🔴',
  'drugs': '🟡',
  'politics': '🟡',
  'spoilers': '⚠️',
};

/**
 * Check if a content warning level is NSFW (requires opt-in).
 */
export function isNsfwLevel(level: ContentWarningLevel): boolean {
  return level !== 'none' && level !== 'spoilers' && level !== 'politics';
}

/**
 * Check if a content warning level is adult content (strictest gate).
 */
export function isAdultLevel(level: ContentWarningLevel): boolean {
  return level === 'sexual-explicit' || level === 'gore';
}

/**
 * Compute the highest severity level from an array of items.
 */
export function computeListContentWarning(
  items: Array<{ cw?: ContentWarningLevel }>
): ContentWarningLevel {
  let highest: ContentWarningLevel = 'none';
  let highestSeverity = 0;

  for (const item of items) {
    const level = item.cw ?? 'none';
    const severity = CONTENT_WARNING_SEVERITY[level];
    if (severity > highestSeverity) {
      highest = level;
      highestSeverity = severity;
    }
  }

  return highest;
}

/**
 * Check if a substantial fraction of items are flagged (>25%).
 */
export function hasSignificantNsfwContent(
  items: Array<{ cw?: ContentWarningLevel }>,
  threshold = 0.25
): boolean {
  if (items.length === 0) return false;
  const flaggedCount = items.filter((item) => item.cw && item.cw !== 'none').length;
  return flaggedCount / items.length >= threshold;
}

/**
 * Map NSFW category to its content warning level.
 */
export function categoryToLevel(category: NsfwCategory): ContentWarningLevel {
  return category;
}

/**
 * Map content warning level to its NSFW category (for preferences).
 */
export function levelToCategory(level: ContentWarningLevel): NsfwCategory | null {
  if (level === 'none' || level === 'spoilers' || level === 'politics') {
    return null;
  }
  return level;
}
