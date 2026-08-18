#!/usr/bin/env bun
// Auto-generates docs/components.md from the @component comments in
// components/*.html. Run with: bun scripts/gen-component-docs.mjs
//
// Groups components by @category. Canonical categories (in output order):
//   forms, data, text, buttons, layout, 3d, content
// Components without @category fall under "other".

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const COMPONENTS_DIR = join(ROOT, "components");
const OUT_FILE = join(ROOT, "docs", "components.md");

const CATEGORY_ORDER = ["forms", "data", "text", "buttons", "layout", "3d", "content"];
const CATEGORY_LABELS = {
  forms: "Forms & inputs",
  data: "Progress & data",
  text: "Text effects",
  buttons: "Buttons & feedback",
  layout: "Layout & nav",
  "3d": "3D & images",
  content: "Content & actions",
  other: "Other",
};

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function parseComment(text) {
  const fields = {};
  const tags = ["component", "category", "description", "usage", "impl"];
  for (const tag of tags) {
    const re = new RegExp(`@${tag}\\s+([\\s\\S]*?)(?=\\n\\s*@|\\n\\s*-->|$)`);
    const m = text.match(re);
    if (m) fields[tag] = m[1].replace(/\n  /g, "\n").trim();
  }
  return fields;
}

function parseProps(html) {
  const m = html.match(/<template\s+([^>]+)>/);
  if (!m) return [];
  const attrs = m[1];
  const props = [];
  const re = /([-\w]+):(\w+)="([^"]*)"/g;
  let mm;
  while ((mm = re.exec(attrs)) !== null) {
    const [, name, type, def] = mm;
    if (name === "shadowrootmode") continue;
    props.push({ name, type, default: def });
  }
  return props;
}

async function main() {
  const files = (await readdir(COMPONENTS_DIR))
    .filter((f) => f.endsWith(".html"))
    .sort();

  const components = [];
  for (const file of files) {
    const html = await readFile(join(COMPONENTS_DIR, file), "utf8");
    const commentMatch = html.match(/<!--\s*([\s\S]*?)\s*-->/);
    if (!commentMatch) continue;
    const fields = parseComment(commentMatch[1]);
    if (!fields.component) continue;
    const props = parseProps(html);
    components.push({
      ...fields,
      category: fields.category || "other",
      props,
      file,
    });
  }

  // Group by category
  const byCategory = new Map();
  for (const c of components) {
    const cat = c.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(c);
  }

  let md = `# Menut — Component Gallery\n\n`;
  md += `Auto-generated from \`components/*.html\`.\n\n`;

  // Table of contents grouped by category
  for (const cat of [...CATEGORY_ORDER, "other"]) {
    const list = byCategory.get(cat);
    if (!list || list.length === 0) continue;
    md += `## ${CATEGORY_LABELS[cat]}\n\n`;
    for (const c of list) {
      md += `- [\`${c.component}\`](#${slug(c.component)})`;
      if (c.description) {
        // first line of description as a hint
        const firstLine = c.description.split("\n")[0].slice(0, 80);
        md += ` — ${firstLine}`;
      }
      md += `\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;

  // Detailed entries grouped by category
  for (const cat of [...CATEGORY_ORDER, "other"]) {
    const list = byCategory.get(cat);
    if (!list || list.length === 0) continue;

    md += `# ${CATEGORY_LABELS[cat]}\n\n`;

    for (const c of list) {
      md += `## ${c.component}\n\n`;
      if (c.description) md += `${c.description}\n\n`;
      if (c.usage) {
        md += `**Usage**\n\n\`\`\`html\n${c.usage}\n\`\`\`\n\n`;
      }
      if (c.props.length) {
        md += `**Props**\n\n`;
        md += `| Prop | Type | Default |\n`;
        md += `|------|------|---------|\n`;
        for (const p of c.props) {
          md += `| \`${p.name}\` | \`${p.type}\` | \`${p.default}\` |\n`;
        }
        md += `\n`;
      }
      if (c.impl) {
        md += `**Implementation notes**\n\n${c.impl}\n\n`;
      }
      md += `---\n\n`;
    }
  }

  await writeFile(OUT_FILE, md, "utf8");
  console.log(`Wrote ${OUT_FILE} (${components.length} components in ${byCategory.size} categories)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
