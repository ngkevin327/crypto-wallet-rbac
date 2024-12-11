import { Readable } from "stream";

const CSV_HEADERS = ["timestamp", "event_type", "actor_email", "payload_summary"] as const;

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function summarizePayload(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload).slice(0, 6);
  if (!keys.length) {
    return "";
  }
  return keys.map((k) => `${k}=${String(payload[k])}`).join("; ");
}

export function createAuditCsvStream(
  rows: AsyncIterable<{
    createdAt: Date;
    eventType: string;
    actorEmail: string | null;
    payload: Record<string, unknown>;
  }>
): Readable {
  let headerSent = false;

  return Readable.from(
    (async function* () {
      yield `${CSV_HEADERS.join(",")}\n`;
      headerSent = true;
      void headerSent;

      for await (const row of rows) {
        const line = [
          row.createdAt.toISOString(),
          row.eventType,
          row.actorEmail ?? "",
          summarizePayload(row.payload),
        ]
          .map(escapeCsv)
          .join(",");
        yield `${line}\n`;
      }
    })()
  );
}
