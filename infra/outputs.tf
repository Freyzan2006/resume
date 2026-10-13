output "name_servers" {
  description = "Set these as the domain's name servers at aHost."
  value       = cloudflare_zone.site.name_servers
}

output "zone_status" {
  description = "\"active\" once aHost points the domain at Cloudflare."
  value       = cloudflare_zone.site.status
}
