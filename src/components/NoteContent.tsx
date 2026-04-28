import { sanitizeUrl } from '@/lib/sanitize';

interface NoteContentProps {
  content: string;
  className?: string;
}

/**
 * Simple content renderer for Nostr note text.
 * Renders plain text with linkified URLs.
 */
export function NoteContent({ content, className }: NoteContentProps) {
  // Handle undefined or null content gracefully
  if (content === undefined || content === null) {
    return <span className={className} />;
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (urlRegex.test(part)) {
          const displayUrl = sanitizeUrl(part);
          if (!displayUrl) return <span key={i}>{part}</span>;
          return (
            <a
              key={i}
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
