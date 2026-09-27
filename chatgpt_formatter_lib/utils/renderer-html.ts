import type { Block } from "./ir";
import type { FormatTemplate } from "./templates";

function styleString(entries: Record<string, string>): string {
  return Object.entries(entries).map(([k, v]) => `${k}:${v}`).join("; ");
}

// Text color is set explicitly everywhere below. Without it, Word can
// inherit color from whatever was previously selected (e.g. a leftover
// white/theme color), making inserted text invisible against a white page.
const TEXT_COLOR = "#000000";

function headingStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.headingFont}', serif`,
    "font-size": t.headingSize,
    "text-align": t.headingAlign,
    "font-weight": t.headingBold ? "bold" : "normal",
    "margin-bottom": t.headingSpaceAfter,
    color: TEXT_COLOR,
  });
}

function subHeadingStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.subHeadingFont}', serif`,
    "font-size": t.subHeadingSize,
    "text-align": t.subHeadingAlign,
    "font-weight": t.subHeadingBold ? "bold" : "normal",
    "margin-bottom": t.subHeadingSpaceAfter,
    color: TEXT_COLOR,
  });
}

function paragraphStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.bodyFont}', serif`,
    "font-size": t.bodySize,
    "text-align": t.bodyAlign,
    "margin-bottom": t.bodySpaceAfter,
    "line-height": "1.15",
    color: TEXT_COLOR,
  });
}

function listItemStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.listFont}', serif`,
    "font-size": t.listSize,
    "margin-bottom": "3pt",
    color: TEXT_COLOR,
  });
}

export function renderHTML(blocks: Block[], template: FormatTemplate): string {
  const out: string[] = [];

  for (const block of blocks) {
    if (block.type === "heading") {
      out.push(`<h${block.level} style="${headingStyle(template)}">${block.text}</h${block.level}>`);
    } else if (block.type === "subheading") {
      out.push(`<p style="${subHeadingStyle(template)}">${block.text}</p>`);
    } else if (block.type === "paragraph") {
      out.push(`<p style="${paragraphStyle(template)}">${block.text}</p>`);
    } else if (block.type === "list") {
      const tag = block.ordered ? "ol" : "ul";
      const style = listItemStyle(template);
      const items = block.items.map((i) => `<li style="${style}">${i}</li>`).join("");
      out.push(`<${tag} style="padding-left: 20pt;">${items}</${tag}>`);
    } else if (block.type === "table") {
      const cellStyle = `color:${TEXT_COLOR};`;
      const head = `<tr>${block.headers.map((h) => `<th style="${cellStyle}">${h}</th>`).join("")}</tr>`;
      const rows = block.rows
        .map((r) => `<tr>${r.map((c) => `<td style="${cellStyle}">${c}</td>`).join("")}</tr>`)
        .join("");
      out.push(`<table border="1" style="border-collapse:collapse;">${head}${rows}</table>`);
    } else if (block.type === "raw_html") {
      out.push(block.html);
    }
  }

  return out.join("\n");
}