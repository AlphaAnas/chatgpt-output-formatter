import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm"; // required for tables, strikethrough, task lists
import type { Root } from "mdast";

export function parseMarkdown(input: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(input);
}