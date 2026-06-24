#!/usr/bin/env bash
#
# deploy.sh — One-step deploy: validate → build → S3 sync → CloudFront invalidate → git push.
#
# Usage:
#   bash scripts/deploy.sh ["commit message"]
#
# Flags (any order, combinable with a commit message):
#   --no-git   skip git commit/push
#   --no-cf    skip CloudFront invalidation
#   --no-s3    skip S3 sync (build + git only)
#   --dry-run  show what would happen; make no remote changes
#
# Config (override via environment variables):
#   BUCKET           default: learnings.varasrinivas.com
#   PREFIX           default: python-java-course
#   DISTRIBUTION_ID  default: ESC8HMAS41DRF   (CloudFront, not a secret)
#
# Requires: node, aws (configured), git.
set -euo pipefail

# ── Config ─────────────────────────────────────────────────────────────
BUCKET="${BUCKET:-learnings.varasrinivas.com}"
PREFIX="${PREFIX:-python-java-course}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-ESC8HMAS41DRF}"

# ── Args ───────────────────────────────────────────────────────────────
DO_GIT=1; DO_CF=1; DO_S3=1; DRY=0; COMMIT_MSG=""
for arg in "$@"; do
  case "$arg" in
    --no-git)  DO_GIT=0 ;;
    --no-cf)   DO_CF=0 ;;
    --no-s3)   DO_S3=0 ;;
    --dry-run) DRY=1 ;;
    -h|--help) sed -n '2,30p' "$0"; exit 0 ;;
    *)         COMMIT_MSG="$arg" ;;
  esac
done

run() { if [ "$DRY" -eq 1 ]; then echo "   [dry-run] $*"; else eval "$@"; fi; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── 1. Validate + build ────────────────────────────────────────────────
echo "▶ Validating modules…"
node scripts/validate.js

echo "▶ Building (landing + desktop + mobile)…"
node scripts/build.js >/dev/null
echo "  built → output/"

# ── 2. S3 sync ─────────────────────────────────────────────────────────
if [ "$DO_S3" -eq 1 ]; then
  echo "▶ Syncing → s3://$BUCKET/$PREFIX (--delete)…"
  run aws s3 sync output "\"s3://$BUCKET/$PREFIX\"" --delete

  # ── 3. CloudFront invalidation (non-fatal) ───────────────────────────
  if [ "$DO_CF" -eq 1 ] && [ -n "$DISTRIBUTION_ID" ]; then
    echo "▶ Invalidating CloudFront $DISTRIBUTION_ID  /$PREFIX/* …"
    if [ "$DRY" -eq 1 ]; then
      echo "   [dry-run] aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths /$PREFIX/*"
    elif aws cloudfront create-invalidation \
           --distribution-id "$DISTRIBUTION_ID" \
           --paths "/$PREFIX/*" \
           --query "Invalidation.{Id:Id,Status:Status}" --output text; then
      echo "  invalidation requested"
    else
      echo "  ⚠ invalidation failed (missing cloudfront:CreateInvalidation?) — S3 is updated; CDN cache will expire via TTL."
    fi
  fi
fi

# ── 4. Git commit + push ───────────────────────────────────────────────
if [ "$DO_GIT" -eq 1 ]; then
  echo "▶ Git…"
  run git add -A
  if [ "$DRY" -eq 1 ]; then
    echo "   [dry-run] git commit + push"
  elif ! git diff --cached --quiet; then
    MSG="${COMMIT_MSG:-Deploy: update course ($(date -u +%Y-%m-%dT%H:%MZ))}"
    git commit -q -m "$MSG"
    echo "  committed: $MSG"
    git push
    echo "  pushed → $(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo origin)"
  else
    echo "  no changes to commit"
    if [ -n "$(git log @{u}..HEAD --oneline 2>/dev/null || true)" ]; then
      git push && echo "  pushed pending local commits"
    fi
  fi
fi

echo ""
echo "✅ Deploy complete."
echo "   Landing : https://$BUCKET/$PREFIX/"
echo "   Desktop : https://$BUCKET/$PREFIX/desktop/"
echo "   Mobile  : https://$BUCKET/$PREFIX/mobile/"
echo "   Repo    : https://github.com/varasrinivas/python-java-course"
