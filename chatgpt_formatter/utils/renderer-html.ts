import type { Block } from "./ir";
import type { FormatTemplate } from "./templates";

function headingStyle(_template: FormatTemplate): string {
  // TODO: Port heading style logic from the old formatter.
  return "";
}

function paragraphStyle(_template: FormatTemplate): string {
  // TODO: Port paragraph style logic from the old formatter.
  return "";
}

function listItemStyle(_template: FormatTemplate): string {
  // TODO: Port list item style logic from the old formatter.
  return "";
}

/**
 * Renders intermediate blocks as HTML suitable for Word's insertHtml API.
 */
export function renderHTML(blocks: Block[], template: FormatTemplate): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          // TODO: Render <h{level}> with inline styles from the template.
          return `<h${block.level} style="${headingStyle(template)}">${block.text}</h${block.level}>`;
        case "paragraph":
          // TODO: Render a styled <p> and escape or format inline text.
          return `<p style="${paragraphStyle(template)}">${block.text}</p>`;
        case "list": {
          // TODO: Render <ul>/<ol> with styled <li> elements.
          const tag = block.ordered ? "ol" : "ul";
          const items = block.items
            .map((item) => `<li style="${listItemStyle(template)}">${item}</li>`)
            .join("");
          return `<${tag}>${items}</${tag}>`;
        }
        case "table":
          // TODO: Render a styled <table>, header row, and data rows.
          return "<table></table>";
        case "raw_html":
          // TODO: Pass through only raw HTML that is safe and supported by Word.
          return block.html;
      }
    })
    .join("\n");
}
