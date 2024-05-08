import { RoleTemplateType } from "@prisma/client";

export interface RoleTemplateSeed {
  templateType: RoleTemplateType;
  name: string;
}

export const DEFAULT_ROLE_TEMPLATES: RoleTemplateSeed[] = [
  { templateType: RoleTemplateType.founder, name: "Founder" },
  { templateType: RoleTemplateType.finance, name: "Finance" },
  { templateType: RoleTemplateType.marketing, name: "Marketing" },
  { templateType: RoleTemplateType.engineering, name: "Engineering" },
  { templateType: RoleTemplateType.operations, name: "Operations" },
  { templateType: RoleTemplateType.viewer, name: "Viewer" },
];
