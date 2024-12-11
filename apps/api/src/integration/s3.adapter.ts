import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createReadStream, createWriteStream, mkdirSync } from "fs";
import { dirname, join } from "path";
import { pipeline } from "stream/promises";
import type { Readable } from "stream";

/** Stub S3 adapter — writes to local `tmp/audit-exports` and returns file URLs. */
@Injectable()
export class S3Adapter {
  private readonly logger = new Logger(S3Adapter.name);
  private readonly bucket: string;
  private readonly region: string;
  private readonly localRoot: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>("s3.bucket") ?? process.env.S3_BUCKET ?? "wtp-audit-exports";
    this.region = config.get<string>("s3.region") ?? process.env.AWS_REGION ?? "us-east-1";
    this.localRoot = join(process.cwd(), "tmp", "audit-exports");
  }

  buildAuditExportKey(orgId: string, jobId: string): string {
    return `audit-exports/${orgId}/${jobId}.csv`;
  }

  async uploadStream(key: string, stream: Readable): Promise<void> {
    const target = join(this.localRoot, key);
    mkdirSync(dirname(target), { recursive: true });
    await pipeline(stream, createWriteStream(target));
    this.logger.log(`Stub S3 upload s3://${this.bucket}/${key} (local: ${target})`);
  }

  async getPresignedDownloadUrl(key: string, ttlSeconds = 7 * 24 * 3600): Promise<string> {
    const base = process.env.API_PUBLIC_URL ?? "http://localhost:3001/v1";
    void ttlSeconds;
    return `${base}/internal/stub-s3/${encodeURIComponent(key)}?region=${this.region}`;
  }

  createReadStream(key: string): Readable {
    return createReadStream(join(this.localRoot, key));
  }
}
