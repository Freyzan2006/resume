# The Pages site already exists: adopt it instead of creating one.
import {
  to = github_repository_pages.site
  id = var.repository
}

resource "github_repository_pages" "site" {
  repository     = var.repository
  build_type     = "workflow"
  cname          = var.serve_from_domain ? var.domain : null
  https_enforced = var.enforce_https

  # GitHub checks the domain's DNS when the custom domain is set.
  depends_on = [cloudflare_dns_record.apex, cloudflare_dns_record.www]
}
