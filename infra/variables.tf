variable "domain" {
  description = "The site's domain, registered at aHost, DNS on Cloudflare."
  type        = string
  default     = "timurtukfatullin.uz"
}

variable "github_owner" {
  type    = string
  default = "Freyzan2006"
}

variable "repository" {
  description = "The repository GitHub Pages serves the site from."
  type        = string
  default     = "resume"
}

variable "cloudflare_account_id" {
  type = string
}

variable "serve_from_domain" {
  description = "Point GitHub Pages at the domain. Turn on only once the domain resolves to GitHub: from then on the github.io address redirects to it."
  type        = bool
  default     = true
}

variable "enforce_https" {
  description = "Redirect http to https. Needs the certificate GitHub issues for the domain (minutes to a day after DNS works)."
  type        = bool
  default     = true
}

variable "github_pages_challenge" {
  description = "Value of the TXT record GitHub asks for to verify the domain (Settings → Pages → Verified domains). Optional."
  type        = string
  default     = null
}
