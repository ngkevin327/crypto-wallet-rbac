terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project" {
  type    = string
  default = "wtp-production"
}

module "vpc" {
  source = "../../modules/vpc"
  name   = var.project
}

resource "aws_security_group" "app_placeholder" {
  name   = "${var.project}-app-placeholder"
  vpc_id = module.vpc.vpc_id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "rds" {
  source                     = "../../modules/rds"
  name                       = var.project
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_security_group_ids = [aws_security_group.app_placeholder.id]
  instance_class             = "db.t4g.small"
}

module "elasticache" {
  source                     = "../../modules/elasticache"
  name                       = var.project
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_security_group_ids = [aws_security_group.app_placeholder.id]
}

output "database_url" {
  value     = "postgresql://wtp_admin@${module.rds.endpoint}/${module.rds.database_name}"
  sensitive = true
}

output "redis_url" {
  value     = module.elasticache.redis_url
  sensitive = true
}

module "ecs_sg" {
  source = "../../modules/ecs-security-groups"
  name   = var.project
  vpc_id = module.vpc.vpc_id
}

module "ecs" {
  source             = "../../modules/ecs"
  name               = var.project
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  api_sg_id          = module.ecs_sg.api_security_group_id
  worker_sg_id       = module.ecs_sg.worker_security_group_id
}

module "alb" {
  source            = "../../modules/alb"
  name              = var.project
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  domain_name       = var.domain_name
  target_group_arn  = module.ecs.target_group_arn
}

module "dns" {
  source      = "../../modules/dns"
  domain_name = var.domain_name
  alb_dns     = module.alb.dns_name
  alb_zone_id = module.alb.zone_id
}

variable "domain_name" {
  type    = string
  default = "api.wtp.example.com"
}
