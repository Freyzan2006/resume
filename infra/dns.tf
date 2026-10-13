# https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
locals {
  github_pages = {
    A    = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"]
    AAAA = ["2606:50c0:8000::153", "2606:50c0:8001::153", "2606:50c0:8002::153", "2606:50c0:8003::153"]
  }

  apex_records = merge([
    for type, addresses in local.github_pages : {
      for address in addresses : "${type} ${address}" => { type = type, content = address }
    }
  ]...)
}

resource "cloudflare_zone" "site" {
  account = { id = var.cloudflare_account_id }
  name    = var.domain
  type    = "full"
}

resource "cloudflare_dns_record" "apex" {
  for_each = local.apex_records

  zone_id = cloudflare_zone.site.id
  name    = "@"
  type    = each.value.type
  content = each.value.content
  ttl     = 1
  proxied = false
  comment = "GitHub Pages"
}

resource "cloudflare_dns_record" "www" {
  zone_id = cloudflare_zone.site.id
  name    = "www"
  type    = "CNAME"
  content = "${lower(var.github_owner)}.github.io"
  ttl     = 1
  proxied = false
  comment = "GitHub Pages"
}

resource "cloudflare_dns_record" "github_pages_challenge" {
  count = var.github_pages_challenge == null ? 0 : 1

  zone_id = cloudflare_zone.site.id
  name    = "_github-pages-challenge-${lower(var.github_owner)}"
  type    = "TXT"
  content = "\"${var.github_pages_challenge}\""
  ttl     = 1
  comment = "GitHub Pages domain verification"
}
