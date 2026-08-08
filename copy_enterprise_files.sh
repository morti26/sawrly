#!/bin/bash
set -e

SRC="/mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public"
DEST="/mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public_new/sawrly-web"
BACKUP="$DEST/_backup_before_enterprise"

FILES=(
  "package.json"
  "package-lock.json"
  "lib/app_settings.ts"
  "lib/theme_engine.ts"
  "lib/theme_client.ts"
  "lib/superadmin-badge.ts"
  "app/api/config/public/route.ts"
  "app/api/admin/theme-settings/route.ts"
  "app/api/admin/icon-settings/route.ts"
  "app/admin/(dashboard)/theme-settings/page.tsx"
  "app/admin/(dashboard)/icon-settings/page.tsx"
  "app/admin/(dashboard)/app-features/page.tsx"
)

echo "=== STEG 1: SKAPA BACKUP ==="
mkdir -p "$BACKUP"
for f in "${FILES[@]}"; do
  if [ -f "$DEST/$f" ]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$DEST/$f" "$BACKUP/$f"
    echo "BACKUP: $f"
  fi
done

echo ""
echo "=== STEG 2: KOPIERA FILER ==="
for f in "${FILES[@]}"; do
  DEST_DIR="$DEST/$(dirname "$f")"
  mkdir -p "$DEST_DIR"
  cp "$SRC/$f" "$DEST/$f"
  echo "KOPIERAD: $f"
done

echo ""
echo "=== STEG 3: VERIFIERING ==="
ALL_OK=true
for f in "${FILES[@]}"; do
  if [ -f "$DEST/$f" ]; then
    echo "JA: $f"
  else
    echo "NEJ: $f"
    ALL_OK=false
  fi
done

echo ""
if [ "$ALL_OK" = true ]; then
  echo "ALLA 12 FILER KOPIERADES OCH VERIFIERADES!"
else
  echo "VARNING: VISSA FILER SAKNAS!"
fi
