#!/usr/bin/env bash
# GitHub Pages settings in full: a request without "cname" removes the custom
# domain, so every request carries it. Needs GITHUB_TOKEN (Pages: write).
set -euo pipefail

PAGES="https://api.github.com/repos/$REPOSITORY/pages"
AUTH=(-H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json")

put() {
  curl -fsS -X PUT "${AUTH[@]}" "$PAGES" -d "$1"
}

# A new repository (a fork) has no Pages site yet: create one built by Actions.
if [ "$(curl -sS -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$PAGES")" = 404 ]; then
  curl -fsS -X POST "${AUTH[@]}" "$PAGES" -d '{"build_type": "workflow"}' >/dev/null
fi

if [ -z "$CNAME" ]; then
  put '{"cname": null, "build_type": "workflow"}'
  exit 0
fi

put "{\"cname\": \"$CNAME\", \"build_type\": \"workflow\"}"
[ "$HTTPS_ENFORCED" = true ] || exit 0

# Setting the domain may restart the certificate: wait for it up to 15 minutes.
for _ in $(seq 30); do
  if put "{\"cname\": \"$CNAME\", \"https_enforced\": true}" 2>/dev/null; then
    exit 0
  fi
  sleep 30
done
echo "GitHub has not issued the certificate yet: run the Infra workflow again later" >&2
exit 1
