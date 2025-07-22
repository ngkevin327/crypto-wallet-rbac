resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "wtp-api-5xx-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "API 5xx elevated — see docs/runbooks/alerts.md"
  treat_missing_data  = "notBreaching"
}

resource "aws_cloudwatch_metric_alarm" "queue_depth" {
  alarm_name          = "wtp-queue-backlog"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 600
  statistic           = "Average"
  threshold           = 100
  alarm_description   = "Worker queue backlog — see docs/runbooks/stuck-intents.md"
}
