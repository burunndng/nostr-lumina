import type { CurationList } from '@/lib/nip51';

/**
 * Trust weight scoring for list discovery.
 *
 * Higher scores rank lists higher in discovery feeds.
 * Score is a function of:
 * - NIP-85 follower count (log scale)
 * - Zap amount received (direct signal)
 * - Post count consistency (active curators)
 */
export interface TrustScore {
  score: number;
  breakdown: {
    followerScore: number;
    zapScore: number;
    activityScore: number;
  };
}

/**
 * Calculate trust weight for a curator based on NIP-85 stats.
 */
export function calculateTrustScore(options: {
  followers: number;
  postCount: number;
  zapAmount: number;
}): TrustScore {
  const { followers, postCount, zapAmount } = options;

  // Log-scale follower score (diminishing returns)
  const followerScore = Math.log2(Math.max(1, followers + 1)) * 10;

  // Direct zap signal (linear, but scaled down)
  const zapScore = zapAmount / 1000;

  // Activity score (consistent posting matters)
  const activityScore = Math.log2(Math.max(1, postCount + 1)) * 5;

  const score = followerScore + zapScore + activityScore;

  return {
    score: Math.round(score * 100) / 100,
    breakdown: {
      followerScore: Math.round(followerScore * 100) / 100,
      zapScore: Math.round(zapScore * 100) / 100,
      activityScore: Math.round(activityScore * 100) / 100,
    },
  };
}

/**
 * Sort lists by trust score (descending).
 * Lists from curators with more followers, zaps, and activity rank higher.
 */
export function sortListsByTrust(
  lists: CurationList[],
  stats: Map<string, { followers: number; postCount: number; zapAmount: number }>
): CurationList[] {
  return [...lists].sort((a, b) => {
    const statsA = stats.get(a.pubkey);
    const statsB = stats.get(b.pubkey);

    const scoreA = statsA ? calculateTrustScore(statsA).score : 0;
    const scoreB = statsB ? calculateTrustScore(statsB).score : 0;

    return scoreB - scoreA;
  });
}

/**
 * Check if a list has significant NSFW content (>25% items flagged).
 * Used for discovery filtering.
 */
export function hasSignificantNsfwContent(
  items: Array<{ cw?: string }>,
  threshold = 0.25
): boolean {
  if (items.length === 0) return false;
  const flaggedCount = items.filter((item) => item.cw && item.cw !== 'none').length;
  return flaggedCount / items.length >= threshold;
}
