import { Injectable, Logger } from "@nestjs/common";

export interface MetricDatum {
  name: string;
  value: number;
  unit: "Count" | "Milliseconds";
  dimensions?: Record<string, string>;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  emit(datum: MetricDatum): void {
    const dims = datum.dimensions
      ? Object.entries(datum.dimensions)
          .map(([k, v]) => `${k}=${v}`)
          .join(",")
      : "";
    this.logger.log(
      `metric ${datum.name}=${datum.value} unit=${datum.unit}${dims ? ` ${dims}` : ""}`
    );
    if (process.env.CLOUDWATCH_METRICS === "true") {
      this.publishEmbedded(datum);
    }
  }

  timing(name: string, ms: number, dimensions?: Record<string, string>): void {
    this.emit({ name, value: ms, unit: "Milliseconds", dimensions });
  }

  count(name: string, value = 1, dimensions?: Record<string, string>): void {
    this.emit({ name, value, unit: "Count", dimensions });
  }

  private publishEmbedded(datum: MetricDatum): void {
    const payload = {
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: "WTP",
            Dimensions: [Object.keys(datum.dimensions ?? {})],
            Metrics: [{ Name: datum.name, Unit: datum.unit }],
          },
        ],
      },
      [datum.name]: datum.value,
      ...(datum.dimensions ?? {}),
    };
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  }
}
