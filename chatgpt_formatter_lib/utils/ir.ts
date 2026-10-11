import type { Root } from "mdast";

export type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "subheading"; text: string }
  | { type: "signature"; text: string }
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
 * A paragraph whose ENTIRE content is a single bold run (e.g. "**Prayer**")
 * acts like a section title rather than body text. If it ends in ":" it's
 * a field label ("**To:**", "**Date:**") that stays inline with what
 * follows it, so only the colon-less case is treated as a subheading.
 */
function isSignatureText(text: string): boolean {
  const value = text.trim();
  // Matches lines like: "Signature", "Signature:", "Signature,", "Deponent: Ali"
  // Keywords: deponent, signature, signed (by), sincerely, advocate
  return /^(?:deponent|signature|signed(?:\s+by)?|sincerely|advocate)\b[\s:,\-]*/i.test(value);
}

/**
 * Short label:value lines immediately after a signature keyword line,
 * e.g. "Name: Ali", "CNIC: 12345-…", "Contact: 0300-…".
 * Only active when inSignatureSection is true.
 */
function isSignatureContinuation(text: string): boolean {
  const value = text.trim();
  // "Label: value" pattern, short enough to be a field, not a body sentence
  return value.length <= 120 && /^[^:\n]{1,40}:.+$/.test(value);
}

function isSectionTitleParagraph(node: any, text: string): boolean {
  return (
    node.children &&
    node.children.length === 1 &&
    node.children[0].type === "strong" &&
    !text.trim().endsWith(":")
  );
}

/**
 * Walks top-level mdast children in document order (not a deep visit) -
 * this is what keeps headings/paragraphs/lists in the order they appeared.
 */
export function toIR(ast: Root): Block[] {
  const blocks: Block[] = [];
  let inSignatureSection = false;

  for (const node of ast.children as any[]) {
    switch (node.type) {
      case "heading": {
        const text = flattenText(node);
        inSignatureSection = false;
        if (isSignatureText(text)) {
          inSignatureSection = true;
          blocks.push({ type: "signature", text });
        } else {
          blocks.push({ type: "heading", level: node.depth, text });
        }
        break;
      }

      case "paragraph": {
        const text = flattenText(node);
        if (isSignatureText(text)) {
          inSignatureSection = true;
          blocks.push({ type: "signature", text });
        } else if (inSignatureSection && isSignatureContinuation(text)) {
          // Name, CNIC, Contact — keep signature alignment
          blocks.push({ type: "signature", text });
        } else if (isSectionTitleParagraph(node, text)) {
          inSignatureSection = false;
          blocks.push({ type: "subheading", text });
        } else {
          inSignatureSection = false;
          blocks.push({ type: "paragraph", text });
        }
        break;
      }

      case "list":
        inSignatureSection = false;
        blocks.push({
          type: "list",
          ordered: Boolean(node.ordered),
          items: node.children.map((item: any) => flattenText(item)),
        });
        break;

      case "table": {
        inSignatureSection = false;
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