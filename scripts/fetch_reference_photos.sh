#!/usr/bin/env bash
set -euo pipefail
# Run only in an environment with network access after reviewing assets/SOURCES.md.
# Do not put these stock car photos into production vehicle listings.
DEST="${1:-public/images/reference}"
mkdir -p "$DEST"
fetch() { local name="$1" url="$2"; echo "Fetching demo photo: $name"; curl --fail --location --retry 2 --connect-timeout 15 --max-time 60 "$url" --output "$DEST/$name"; }
fetch 'hero-greece-delphi-road.jpg' 'https://images.unsplash.com/photo-1704922230180-71d7eff708d1?auto=format&fit=crop&w=2000&q=82'
fetch 'hero-greece-crete-coast.jpg' 'https://images.unsplash.com/photo-1720261289352-28a7a4d4ccbd?auto=format&fit=crop&w=2000&q=82'
fetch 'vehicle-interior-placeholder.jpg' 'https://images.unsplash.com/photo-1636763086312-3e0c99e8761e?auto=format&fit=crop&w=1200&q=82'
fetch 'vehicle-suv-placeholder.jpg' 'https://images.unsplash.com/photo-1547559418-8d7437f53b5b?auto=format&fit=crop&w=1200&q=82'
echo "Done. Before publication, verify rights and never claim demo photos are actual client inventory."
