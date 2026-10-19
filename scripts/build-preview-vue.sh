#!/usr/bin/env bash
# Compile la vitrine Vue et la place dans le site (apps/web/public/preview-vue).
# Utilisation, depuis la racine du projet :  bash scripts/build-preview-vue.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Installation des outils de la vitrine Vue (la première fois seulement)…"
cd "$ROOT/apps/preview-vue"
npm install --no-audit --no-fund

echo "→ Vérification des types et compilation…"
npm run build

echo "✓ Vitrine Vue prête dans apps/web/public/preview-vue"
