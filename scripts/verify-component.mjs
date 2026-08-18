#!/usr/bin/env bun
// verify-component.mjs — static + AI review of a Menut component SFC.
//
// Usage:
//   bun scripts/verify-component.mjs <file.html>
//   bun scripts/verify-component.mjs components/theme-switch.html
//
// Static checks (always run):
//   - banned patterns: eval, new Function, document.write, external script src
//   - required doc fields: @component, @category, @usage
//   - @category is one of the canonical values
//   - valid <template> present
//   - JS inside <script> is syntactically valid
//
// AI review (only if LLM_API_KEY env var is set):
//   - sends the component to an OpenAI-compatible chat endpoint
//   - posts the review as a comment on the PR (when GITHUB_PR_NUMBER is set)
//
// Exit codes:
//   0 = all checks passed (warnings allowed)
//   1 = one or more checks failed

import { readFile } from "fs/promises";

const CATEGORIES = ["forms", "data", "text", "buttons", "layout", "3d", "content"];

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

// --- Static checks --------------------------------------------------------

async function staticChecks(filePath, content) {
  // 1. Doc comment
  const commentMatch = content.match(/<!--\s*([\s\S]*?)\s*-->/);
  if (!commentMatch) {
    fail("Missing doc comment at the top of the file.");
    return;
  }
  const comment = commentMatch[1];

  for (const tag of ["@component", "@category", "@usage"]) {
    if (!new RegExp(`@${tag}\\s+\\S`).test(comment)) {
      fail(`Missing or empty @${tag} in doc comment.`);
    }
  }

  // 2. @category value
  const catMatch = comment.match(/@category\s+(\S+)/);
  if (catMatch && !CATEGORIES.includes(catMatch[1])) {
    fail(`@category "${catMatch[1]}" is not valid. Must be one of: ${CATEGORIES.join(", ")}`);
  }

  // 3. <template> present
  if (!/<template[\s>]/.test(content)) {
    fail("Missing <template> element.");
  }

  // 4. Banned patterns
  const banned = [
    { re: /\beval\s*\(/, label: "eval()" },
    { re: /new\s+Function\s*\(/, label: "new Function()" },
    { re: /document\.write\s*\(/, label: "document.write()" },
  ];
  for (const { re, label } of banned) {
    if (re.test(content)) {
      fail(`Banned pattern found: ${label}`);
    }
  }

  // 5. External <script src="...">
  const scriptSrcRe = /<script\s+[^>]*src\s*=\s*["'][^"']+["'][^>]*>/gi;
  let m;
  while ((m = scriptSrcRe.exec(content)) !== null) {
    fail(`External script reference: ${m[0].trim()}`);
  }

  // 6. innerHTML with non-constant
  const innerHTMLRe = /\.innerHTML\s*=\s*([^;]+)/g;
  while ((m = innerHTMLRe.exec(content)) !== null) {
    const rhs = m[1].trim();
    // Allow string literals (template strings, single/double quoted)
    if (/^["'`]/.test(rhs)) continue;
    // Allow String() calls
    if (/^String\s*\(/.test(rhs)) continue;
    warn(`innerHTML assigned non-constant value: ${rhs.slice(0, 60)}`);
  }

  // 7. fetch to non-CDN
  const fetchRe = /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g;
  while ((m = fetchRe.exec(content)) !== null) {
    const url = m[1];
    if (!/^(https?:\/\/|\/)/.test(url)) continue;
    if (/cdn|cloudflare|jsdelivr|unpkg|w3\.org|picsum/.test(url)) continue;
    warn(`fetch to non-CDN URL: ${url}`);
  }

  // 8. addEventListener without signal (heuristic)
  const listenerRe = /addEventListener\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^,)]+)/g;
  while ((m = listenerRe.exec(content)) !== null) {
    const full = content.slice(m.index, content.indexOf(")", m.index) + 1);
    if (!/signal\s*[:]/.test(full) && !/once\s*:\s*true/.test(full)) {
      // Only warn if there's no ondisconnected cleanup nearby
      if (!/ondisconnected/.test(content)) {
        warn(`addEventListener('${m[1]}', …) without { signal } — possible memory leak`);
      }
    }
  }

  // 9. JS syntax check (extract <script> content)
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    try {
      // Wrap in a function to check syntax without executing
      new Function(scriptMatch[1]);
    } catch (e) {
      fail(`JS syntax error in <script>: ${e.message}`);
    }
  }
}

// --- AI review -------------------------------------------------------------

async function aiReview(filePath, content) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.LLM_BASE_URL || "https://opencode.ai/zen/go/v1";
  const model = process.env.LLM_MODEL || "deepseek-v4-flash";

  const prompt = `You are reviewing a Menut component (a single-file HTML custom element).
Check for:
1. Security issues (XSS, injection, unsafe innerHTML, eval-like patterns)
2. Memory leaks (event listeners without cleanup, observers not disconnected)
3. Menut idioms (use host.signal for listeners, host.ondisconnected for observers,
   host.onpropchange for prop reactivity, this.el for the host element)
4. Light vs Shadow DOM appropriateness (wrappers around native elements should
   use light DOM so external CSS applies; self-contained widgets should use shadow)
5. Any bugs or edge cases

Respond in markdown with:
## Summary
<one-line verdict>

## Issues
- <issue or "None found">

## Suggestions
- <suggestion or "None">

Be concise. Only report real issues, not style preferences.

Component file: ${filePath}

\`\`\`html
${content}
\`\`\``;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      warn(`AI review request failed: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    warn(`AI review error: ${e.message}`);
    return null;
  }
}

// --- GitHub PR comment -----------------------------------------------------

async function postPRComment(body) {
  const prNumber = process.env.GITHUB_PR_NUMBER;
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!prNumber || !token || !repo) return;

  try {
    await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    });
  } catch (e) {
    // non-fatal
  }
}

// --- Main ------------------------------------------------------------------

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: verify-component.mjs <file.html>");
    process.exit(1);
  }

  const content = await readFile(file, "utf8");

  await staticChecks(file, content);

  // AI review (optional)
  const aiResult = await aiReview(file, content);

  // Build report
  let report = `## 🔍 Component verification: \`${file}\`\n\n`;

  if (errors.length === 0) {
    report += `### ✅ Static checks passed\n`;
  } else {
    report += `### ❌ Static checks failed\n`;
    for (const e of errors) report += `- ❌ ${e}\n`;
  }

  if (warnings.length > 0) {
    report += `\n### ⚠️ Warnings\n`;
    for (const w of warnings) report += `- ⚠️ ${w}\n`;
  }

  if (aiResult) {
    report += `\n### 🤖 AI review\n\n${aiResult}\n`;
  } else if (process.env.LLM_API_KEY) {
    report += `\n### 🤖 AI review\n\n_Skipped (request failed)_\n`;
  } else {
    report += `\n### 🤖 AI review\n\n_Skipped (no LLM_API_KEY configured)_\n`;
  }

  console.log(report);

  // Post to PR if running in CI
  await postPRComment(report);

  if (errors.length > 0) process.exit(1);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
