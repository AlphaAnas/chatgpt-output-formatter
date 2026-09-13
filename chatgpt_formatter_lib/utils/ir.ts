import type { Root } from "mdast";

export type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "raw_html"; html: string };

function flattenText(node: any): string {
  if (node.value !== undefined) return node.value;
  if (node.children) return node.children.map(flattenText).join("");
  return "";
}

/**
 * Walks top-level mdast children in document order (not a deep visit) -
 * this is what keeps headings/paragraphs/lists in the order they appeared.
 */
export function toIR(ast: Root): Block[] {
  const blocks: Block[] = [];

  for (const node of ast.children as any[]) {
    switch (node.type) {
      case "heading":
        blocks.push({ type: "heading", level: node.depth, text: flattenText(node) });
        break;

      case "paragraph":
        blocks.push({ type: "paragraph", text: flattenText(node) });
        break;

      case "list":
        blocks.push({
          type: "list",
          ordered: Boolean(node.ordered),
          items: node.children.map((item: any) => flattenText(item)),
        });
        break;

      case "table": {
        const [headerRow, ...bodyRows] = node.children;
        blocks.push({
          type: "table",
          headers: headerRow.children.map((cell: any) => flattenText(cell)),
          rows: bodyRows.map((row: any) => row.children.map((cell: any) => flattenText(cell))),
        });
        break;
      }

      case "html":
        blocks.push({ type: "raw_html", html: node.value });
        break;

      default:
        // TODO: blockquote, code fences, thematic breaks, etc. as needed
        break;
    }
  }

  return blocks;
}