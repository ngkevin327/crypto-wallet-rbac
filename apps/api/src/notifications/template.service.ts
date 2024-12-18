import { Injectable } from "@nestjs/common";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

@Injectable()
export class TemplateService {
  private readonly templateDir = existsSync(join(__dirname, "templates"))
    ? join(__dirname, "templates")
    : join(process.cwd(), "src", "notifications", "templates");

  render(templateName: string, vars: Record<string, string>): string {
    const path = join(this.templateDir, `${templateName}.txt`);
    let content = readFileSync(path, "utf-8");
    for (const [key, value] of Object.entries(vars)) {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return content;
  }
}
