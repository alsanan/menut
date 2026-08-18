#!/usr/bin/env bun
// Auto-generates docs/components.md from the @component comments in
// examples/components/*.html. Run with: bun scripts/gen-component-docs.mjs

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const COMPONENTS_DIR = join(ROOT, "examples", "components");
const OUT_FILE = join(ROOT, "docs", "components.md");

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function parseComment(text) {
  const fields = {};
  const tags = ["component", "description", "usage", "impl"];
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
    components.push({ ...fields, props, file });
  }

  let md = `# Menut — Component Gallery\n\n`;
  md += `Auto-generated from \`examples/components/*.html\`.\n\n`;
  md += `## Table of contents\n\n`;
  for (const c of components) {
    md += `- [\`${c.component}\`](#${slug(c.component)})\n`;
  }
  md += `\n---\n\n`;

  for (const c of components) {
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

  await writeFile(OUT_FILE, md, "utf8");
  console.log(`Wrote ${OUT_FILE} (${components.length} components)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
