#!/usr/bin/env bash
# Compile la vitrine Flutter et la place dans le site (apps/web/public/preview).
# Utilisation, depuis la racine du projet :  bash scripts/build-preview.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Compilation de la vitrine Flutter (peut prendre quelques minutes)…"
cd "$ROOT/apps/preview"
flutter build web --release --base-href /preview/

echo "→ Copie dans le site…"
rm -rf "$ROOT/apps/web/public/preview"
mkdir -p "$ROOT/apps/web/public"
cp -r "$ROOT/apps/preview/build/web" "$ROOT/apps/web/public/preview"

echo "✓ Vitrine prête dans apps/web/public/preview"
