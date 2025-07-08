variable "domain_name" {
  type = string
}

variable "alb_dns" {
  type = string
}

variable "alb_zone_id" {
  type = string
}

resource "aws_acm_certificate" "api" {
  domain_name       = var.domain_name
  validation_method = "DNS"
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.alb_dns
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

data "aws_route53_zone" "primary" {
  name         = replace(var.domain_name, "/^[^.]+\\./", "")
  private_zone = false
}

output "certificate_arn" {
  value = aws_acm_certificate.api.arn
}
