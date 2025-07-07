variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "allowed_security_group_ids" {
  type = list(string)
}

variable "db_name" {
  type    = string
  default = "wtp"
}

variable "instance_class" {
  type    = string
  default = "db.t4g.micro"
}

resource "aws_security_group" "rds" {
  name        = "${var.name}-rds"
  description = "RDS Postgres access from ECS"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-db-subnets"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "this" {
  identifier             = "${var.name}-postgres"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = var.instance_class
  allocated_storage      = 20
  db_name                = var.db_name
  username               = "wtp_admin"
  manage_master_user_password = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.this.name
  skip_final_snapshot    = true
  publicly_accessible    = false
  storage_encrypted      = true
}

output "endpoint" {
  value = aws_db_instance.this.endpoint
}

output "database_name" {
  value = var.db_name
}

output "security_group_id" {
  value = aws_security_group.rds.id
}
