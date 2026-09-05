import { normalize } from "./normalize";
import { parseMarkdown } from "./parser";
import { renderHTML } from "./renderer-html";
import { toIR } from "./ir";
import { defaultTemplate, type FormatTemplate } from "./templates";

/**
 * Runs the complete raw markdown to formatted HTML pipeline.
 */
export function formatContent(
  raw: string,
  template: FormatTemplate = defaultTemplate
): string {
  try {
    const cleaned = normalize(raw);
    const ast = parseMarkdown(cleaned);
    const blocks = toIR(ast);
    return renderHTML(blocks, template);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error formatting content: ${message}`);
  }
}
