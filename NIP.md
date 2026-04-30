# KUR4TEK NIPs

This document describes the custom Nostr event kinds and tag conventions used by NostrCurate.

## NIP-51: Curation Lists

**Kind**: 30100 (Addressable Replaceable Event)

Curation lists are addressable events identified by `(author, kind, d-tag)` triple. A curator publishes updates to their list and the latest event supersedes previous ones, while historical references remain valid.

### Base Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | Yes | Unique identifier for this list (arbitrary string chosen by curator) |
| `type` | Yes | List type from vocabulary below |
| `title` | Yes | Human-readable title |
| `description` | No | Longer description or curator notes |
| `image` | No | Cover image URL (NIP-94 compliant, implies `imeta` tag) |
| `cw` | No | List-level content warning. Inherits highest item flag on publish. Values: `nudity`, `sexual-explicit`, `sexual-educational`, `violence`, `gore`, `drugs`, `politics`, `spoilers`, `none` |
| `visibility` | Yes | `public` (anyone can read), `premium` (decryption key required), `private` (only curator sees) |
| `lnurl` | No | LNURL for premium list payments |
| `price` | No | One-time price in sats for premium list access |
| `t` | No | Category tags for discovery (e.g., `t` = `bitcoin`, `t` = `linux`) |

### Type Vocabulary

Curators SHOULD use established type prefixes where applicable:

| Type | Description |
|------|-------------|
| `curation:articles` | Curated article/link collection |
| `curation:books` | Book recommendations |
| `curation:links` | General link curation |
| `curation:media` | Audio/video/image curation |
| `curation:people` | People/pubic keys of interest |
| `curation:podcasts` | Podcast episode curation |
| `curation:videos` | Video curation |
| `curation:research` | Academic/research links |
| `curation:tools` | Software tool recommendations |
| `curation:nsfw:adult` | Adult content (18+ only, see NIP-36) |
| `curation:nsfw:adult-images` | Explicit images |
| `curation:nsfw:adult-videos` | Explicit videos |
| `custom:*` | Custom types allowed; registry encouraged |

### List Item Format

Items are encoded in `content` as newline-separated JSON lines (JSONL):

```json
{"url":"https://example.com/article","title":"Example Article","notes":"My thoughts on this","cw":"none"}
{"url":"https://example.com/video","title":"Example Video","notes":"Skip to 5:30","cw":"sexual-explicit"}
```

#### Item Fields

| Field | Required | Description |
|-------|----------|-------------|
| `url` | Yes | The URL or NIP-19 identifier being curated |
| `title` | Yes | Display title for this item |
| `notes` | No | Curator's personal notes about this item |
| `cw` | Yes | NIP-36 content warning level (see below) |
| `pos` | No | Display position (lower = earlier). Defaults to order in list |

### Example Event

```
{
  "kind": 30100,
  "pubkey": "<curator-hex-pubkey>",
  "tags": [
    ["d", "bitcoin-dev-resources"],
    ["type", "curation:links"],
    ["title", "Bitcoin & Lightning Development Resources"],
    ["description", "A curated collection of the best resources for Bitcoin and Lightning developers"],
    ["visibility", "public"],
    ["t", "bitcoin"],
    ["t", "lightning"],
    ["t", "development"]
  ],
  "content": "{\"url\":\"https://github.com/bitcoinbook/bitcoinbook\",\"title\":\"Mastering Bitcoin\",\"notes\":\"Essential reading\",\"cw\":\"none\"}\n{\"url\":\"https://lightning.engineering/\",\"title\":\"Lightning Engineering Blog\",\"notes\":\"\",\"cw\":\"none\"}"
}
```

## NIP-36: Content Warning Vocabulary

**Warning Levels** (mutually exclusive per item):

| Level | Description |
|-------|-------------|
| `none` | No content warning needed |
| `nudity` | Non-sexual nudity (art, medical, etc.) |
| `sexual-educational` | Sexual content with educational context |
| `sexual-explicit` | Explicit sexual content |
| `violence` | Violent content |
| `gore` | Graphic gore or injury |
| `drugs` | Drug use or paraphernalia |
| `politics` | Political content |
| `spoilers` | Plot spoilers for media |

### Per-Item vs List-Level Flags

- **Item flags** are authoritative. Each item in a list carries its own `cw` value.
- **List-level `cw`** is computed on publish as the highest item flag. It enables discovery-level filtering without inspecting every item.
- **Mixed-content lists**: Items with `cw` flags are individually gated in the reader UI. The list surfaces in NSFW discovery if a "substantial fraction" (>25%) of items are flagged.

### Discovery Filtering

When a reader queries lists:

```
# SFW-default: only lists without significant NSFW
createEvent({
  kinds: [30100],
  '#t': ['bitcoin'],
  // Filter out lists where list.cw != 'none'
})

# NSFW-enabled: all lists
createEvent({
  kinds: [30100],
  '#t': ['bitcoin'],
  // Include all, let reader UI handle per-item gates
})
```

## Premium Lists (NIP-44 Encryption)

Premium lists use NIP-44 for payload encryption:

1. Curator creates list with `visibility: "premium"`
2. Reader pays LNURL invoice
3. On verified zap receipt, curator sends gift-wrapped DM (kind 22?) containing:
   - The decryption key
   - The list `d` tag identifier
4. Reader decrypts list content locally

**Note**: Key delivery mechanism is still TBD. Gift-wrapped DM approach is the current candidate.

## Web-of-Trust Ranking (Future)

Trust scoring for list discovery:

```
trust_weight = f(follow_distance, follow_recency, zap_flow)
```

- **Follow distance**: 1st-degree follows score higher than 2nd-degree
- **Follow recency**: Recently-followed curators get temporary boost
- **Zap flow**: Curators who receive zaps from people you trust rank higher

This is a Phase 2+ feature and NOT part of the initial schema.

---

## Changelog

- 2026-04-28: Initial draft