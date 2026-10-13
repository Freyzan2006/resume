#!/usr/bin/env bash
# One-off: the state bucket and the values CI needs. Run from the repo root
# with the variables below exported; see infra/README.md.
set -euo pipefail

: "${CLOUDFLARE_ACCOUNT_ID:?}" "${CLOUDFLARE_API_TOKEN:?}" "${TF_GITHUB_TOKEN:?}"
: "${R2_ACCESS_KEY_ID:?}" "${R2_SECRET_ACCESS_KEY:?}"

BUCKET=resume-tfstate
API="https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/r2/buckets"

status=$(curl -sS -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "$API/$BUCKET")
if [ "$status" = 200 ]; then
  echo "R2 bucket $BUCKET already exists"
else
  curl -fsS -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" -d "{\"name\":\"$BUCKET\"}" "$API" >/dev/null
  echo "R2 bucket $BUCKET created"
fi

gh variable set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID"
gh secret set CLOUDFLARE_API_TOKEN --body "$CLOUDFLARE_API_TOKEN"
gh secret set TF_GITHUB_TOKEN --body "$TF_GITHUB_TOKEN"
gh secret set R2_ACCESS_KEY_ID --body "$R2_ACCESS_KEY_ID"
gh secret set R2_SECRET_ACCESS_KEY --body "$R2_SECRET_ACCESS_KEY"
