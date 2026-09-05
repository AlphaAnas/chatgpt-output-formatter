import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root } from "mdast";

/**
 * Parses cleaned markdown into a mdast root node.
 */
export function parseMarkdown(input: string): Root {
  return unified().use(remarkParse).parse(input);
}
