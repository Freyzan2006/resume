terraform {
  required_version = ">= 1.11"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.27.0"
    }
    github = {
      source  = "integrations/github"
      version = "6.13.0"
    }
  }

  # Cloudflare R2 through the S3 API. The endpoint and keys come from the
  # environment: AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.
  backend "s3" {
    bucket = "resume-tfstate"
    key    = "resume/terraform.tfstate"
    region = "auto"

    use_lockfile                = true
    use_path_style              = true
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }
}

# CLOUDFLARE_API_TOKEN and GITHUB_TOKEN come from the environment.
provider "cloudflare" {}

provider "github" {
  owner = var.github_owner
}
