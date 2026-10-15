#!/usr/bin/env bash
# Carry the workshop's shared page files into every project, from this one source.
#
#   ./sync.sh "what changed"    copy, rebuild each page, commit and push where it changed
#   ./sync.sh --check           fail if any project's copy differs from this one
#
# The four files every project page shares (build.py, ecosystem.css,
# ecosystem.js, ecosystem.json) were kept byte-identical across eight
# repositories by hand. They live here now; a project's docs/ holds a copy, so
# its page still works on its own, offline and without reaching another site,
# but the copy is an artifact of this repository, never edited where it lands.
# A change is made here and synced: every project that ecosystem.json lists
# and that is checked out beside this one gets the files, its page rebuilt
# (docs/build.py from its docs/page.py, or a hand-written page's own
# docs/sync.py, which rewrites just the shared regions) and checked, and a
# commit pushed. A project whose docs/ has uncommitted changes is skipped and
# named, so nobody's work in progress is swept into a sync.
set -euo pipefail
cd "$(dirname "$0")"
HERE="$(pwd)"
ROOT="$(dirname "$HERE")"
FILES=(build.py ecosystem.css ecosystem.js ecosystem.json)
CHECK=false; MESSAGE="${1:-}"
[ "$MESSAGE" = "--check" ] && CHECK=true
$CHECK || [ -n "$MESSAGE" ] || { echo "usage: ./sync.sh \"what changed\" | --check" >&2; exit 2; }

slugs=$(python3 -c "import json; print('\n'.join(p['slug'] for p in json.load(open('ecosystem.json'))['projects']))")
drift=(); skipped=(); updated=()
for slug in $slugs; do
  docs="$ROOT/$slug/docs"
  [ -d "$ROOT/$slug" ] || { echo "-- $slug: not checked out beside site-core"; continue; }
  [ -d "$docs" ] || continue  # listed in the network, but has no page of its own
  same=true
  for f in "${FILES[@]}"; do cmp -s "$f" "$docs/$f" || same=false; done
  if [ -f "$docs/page.py" ]; then page=(python3 docs/build.py)
  elif [ -f "$docs/sync.py" ]; then page=(python3 docs/sync.py)
  else page=(); fi
  current=true
  if $same && [ ${#page[@]} -gt 0 ]; then
    (cd "$ROOT/$slug" && "${page[@]}" --check >/dev/null 2>&1) || current=false
  fi
  if $CHECK; then { $same && $current; } || drift+=("$slug"); continue; fi
  { $same && $current; } && { echo "   $slug: already current"; continue; }
  if [ -n "$(git -C "$ROOT/$slug" status --porcelain -- docs)" ]; then
    skipped+=("$slug"); echo "!! $slug: docs/ has uncommitted changes, skipped"; continue
  fi
  # GitHub Actions commits here too (workshop-pages.yml): start from its latest.
  git -C "$ROOT/$slug" pull -q --ff-only || { skipped+=("$slug"); echo "!! $slug: could not fast-forward, skipped"; continue; }
  for f in "${FILES[@]}"; do cp "$f" "$docs/$f"; done
  if [ ${#page[@]} -gt 0 ]; then
    (cd "$ROOT/$slug" && "${page[@]}" >/dev/null && "${page[@]}" --check >/dev/null)
  fi
  (cd "$ROOT/$slug" && git add docs && git commit -q -m "Workshop pages: $MESSAGE (from site-core)" \
    && git push -q origin HEAD)
  updated+=("$slug"); echo "== $slug: synced and pushed"
done
if $CHECK; then
  [ ${#drift[@]} -eq 0 ] && { echo "every project's shared page files match site-core"; exit 0; }
  echo "differ from site-core: ${drift[*]}" >&2; exit 1
fi
echo "updated: ${updated[*]:-none}${skipped[*]:+; skipped: ${skipped[*]}}"
