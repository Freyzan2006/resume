# integrations/github 6.13.0 drops the custom domain on any Pages update that
# leaves `cname` unchanged: go-github sends "cname": null, and GitHub reads that
# as "remove the domain". Pages is set through the API instead, the domain in
# every request (pages.sh).
removed {
  from = github_repository_pages.site

  lifecycle {
    destroy = false
  }
}

locals {
  pages = {
    repository     = "${var.github_owner}/${var.repository}"
    cname          = var.serve_from_domain ? var.domain : ""
    https_enforced = var.enforce_https
  }
}

resource "terraform_data" "pages" {
  triggers_replace = local.pages

  provisioner "local-exec" {
    command = "${path.module}/pages.sh"
    environment = {
      REPOSITORY     = local.pages.repository
      CNAME          = local.pages.cname
      HTTPS_ENFORCED = tostring(local.pages.https_enforced)
    }
  }

  # GitHub checks the domain's DNS when the custom domain is set.
  depends_on = [cloudflare_dns_record.apex, cloudflare_dns_record.www]
}
