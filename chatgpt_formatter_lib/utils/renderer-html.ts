import type { Block } from "./ir";
import type { FormatTemplate } from "./templates";

function styleString(entries: Record<string, string>): string {
  return Object.entries(entries).map(([k, v]) => `${k}:${v}`).join("; ");
}

function headingStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.headingFont}', serif`,
    "font-size": t.headingSize,
    "text-align": t.headingAlign,
    "font-weight": t.headingBold ? "bold" : "normal",
    "margin-bottom": t.headingSpaceAfter,
  });
}

function paragraphStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.bodyFont}', serif`,
    "font-size": t.bodySize,
    "text-align": t.bodyAlign,
    "margin-bottom": t.bodySpaceAfter,
    "line-height": "1.15",
  });
}

function listItemStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.listFont}', serif`,
    "font-size": t.listSize,
    "margin-bottom": "3pt",
  });
}

export function renderHTML(blocks: Block[], template: FormatTemplate): string {
  const out: string[] = [];

  for (const block of blocks) {
    if (block.type === "heading") {
      out.push(`<h${block.level} style="${headingStyle(template)}">${block.text}</h${block.level}>`);
    } else if (block.type === "paragraph") {
      out.push(`<p style="${paragraphStyle(template)}">${block.text}</p>`);
    } else if (block.type === "list") {
      const tag = block.ordered ? "ol" : "ul";
      const style = listItemStyle(template);
      const items = block.items.map((i) => `<li style="${style}">${i}</li>`).join("");
      out.push(`<${tag} style="padding-left: 20pt;">${items}</${tag}>`);
    } else if (block.type === "table") {
      const head = `<tr>${block.headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
      const rows = block.rows
        .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
        .join("");
      out.push(`<table border="1" style="border-collapse:collapse;">${head}${rows}</table>`);
    } else if (block.type === "raw_html") {
      out.push(block.html);
    }
  }

  return out.join("\n");
}