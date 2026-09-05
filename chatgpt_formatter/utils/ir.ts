import type { Content, Root } from "mdast";
import { visit } from "unist-util-visit";

export type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "raw_html"; html: string };

function flattenText(node: Content): string {
  if ("value" in node) {
    return node.value;
  }

  if ("children" in node) {
    return node.children.map((child) => flattenText(child as Content)).join("");
  }

  return "";
}

/**
 * Converts mdast blocks to the small intermediate representation used by the
 * renderer. Inline marks are flattened to plain text until inline spans exist.
 */
export function toIR(ast: Root): Block[] {
  const blocks: Block[] = [];

  visit(ast, (node) => {
    switch (node.type) {
      case "heading":
        // TODO: Map heading depth and flattened inline children to a heading block.
        blocks.push({
          type: "heading",
          level: node.depth,
          text: node.children.map((child) => flattenText(child)).join(""),
        });
        break;
      case "paragraph":
        // TODO: Map paragraph children; preserve bold/italic/code/link as spans later.
        blocks.push({
          type: "paragraph",
          text: node.children.map((child) => flattenText(child)).join(""),
        });
        break;
      case "list":
        // TODO: Map listItem children into item strings, including nested lists later.
        blocks.push({
          type: "list",
          ordered: Boolean(node.ordered),
          items: node.children.map((item) =>
            item.children.map((child) => flattenText(child)).join("")
          ),
        });
        break;
      case "listItem":
        // TODO: Handle listItem-specific nesting and block content during list mapping.
        break;
      case "table":
        // TODO: Map table rows and cells once table parsing is enabled/configured.
        blocks.push({
          type: "table",
          headers: [],
          rows: [],
        });
        break;
      case "html":
        // TODO: Decide which raw HTML is safe to pass through to Word.
        blocks.push({ type: "raw_html", html: node.value });
        break;
      default:
        break;
    }
  });

  return blocks;
}
