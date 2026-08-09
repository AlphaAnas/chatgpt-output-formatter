/**
 * Applies formatting rules (fonts, sizes, alignment) to already-cleaned
 * markdown/HTML content, producing final styled HTML ready for insertion
 * into Word/Docs. Rules are driven by a template config so styling isn't
 * hardcoded — matches templates.ts from the plan.
 */

export interface FormatTemplate {
  headingFont: string;
  headingSize: string;   // e.g. "14px"
  headingBold: boolean;
  headingAlign: "left" | "center" | "right" | "justify";
  bodyFont: string;
  bodySize: string;      // e.g. "12px"
  bodyAlign: "left" | "center" | "right" | "justify";
  listFont: string;
  listSize: string;
}

export const defaultTemplate: FormatTemplate = {
  headingFont: "Times New Roman",
  headingSize: "14px",
  headingBold: true,
  headingAlign: "left",
  bodyFont: "Times New Roman",
  bodySize: "12px",
  bodyAlign: "justify",
  listFont: "Times New Roman",
  listSize: "12px",
};

function styleString(entries: Record<string, string>): string {
  return Object.entries(entries)
    .map(([k, v]) => `${k}:${v}`)
    .join("; ");
}

function headingStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": t.headingFont,
    "font-size": t.headingSize,
    "text-align": t.headingAlign,
    "font-weight": t.headingBold ? "bold" : "normal",
    "color": "#000000",  // Fixed from "font-color" to valid CSS "color"
  });
}

function paragraphStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": t.bodyFont,
    "font-size": t.bodySize,
    "text-align": t.bodyAlign,
    "color": "#000000",  // Fixed from "font-color" to valid CSS "color"
  });
}

function listItemStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": t.listFont,
    "font-size": t.listSize,
  });
}

// --- inline formatting (bold / italic / inline code / links / strikethrough) ---

function formatInline(text: string): string {
  let result = text;
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, "<em>$1</em>");
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>"); // Added strikethrough (double tilde)
  result = result.replace(/~(.+?)~/g, "<del>$1</del>");     // Added strikethrough (single tilde)
  result = result.replace(/`([^`]+?)`/g, "<code>$1</code>");
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return result;
}

// --- block detection ---

function matchHeading(line: string): { level: number; text: string } | null {
  const m = line.match(/^(#{1,6})\s+(.+)$/);
  if (!m) return null;
  return { level: m[1].length, text: m[2] };
}

function matchUnorderedListItem(line: string): string | null {
  const m = line.match(/^[ \t]*[-*+]\s+(.+)$/);
  return m ? m[1] : null;
}

function matchOrderedListItem(line: string): string | null {
  const m = line.match(/^[ \t]*\d+\.\s+(.+)$/);
  return m ? m[1] : null;
}

function isBlank(line: string): boolean {
  return line.trim() === "";
}

function isAlreadyHtmlTag(line: string): boolean {
  return line.trimStart().startsWith("<");
}

function isSkippable(line: string): boolean {
  const t = line.trim();
  return t === "" || /^(?:```|---)/.test(t);
}

// --- main block-based formatter (handles multi-line lists properly) ---

export async function formatContentHTML(
  content: string,
  template: FormatTemplate = defaultTemplate
): Promise<string> {
  try {
    const lines = content.split(/\r?\n/); // Safely handle both Windows and Unix line endings
    const out: string[] = [];

    let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

    const flushList = () => {
      if (!listBuffer) return;
      const tag = listBuffer.type;
      const style = listItemStyle(template);
      const items = listBuffer.items
        .map((item) => `<li style="${style}">${formatInline(item)}</li>`)
        .join("");
      out.push(`<${tag}>${items}</${tag}>`);
      listBuffer = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trimRight ? rawLine.trimRight() : rawLine.replace(/\s+$/, "");

      if (isSkippable(line)) {
        flushList();
        continue;
      }

      if (isAlreadyHtmlTag(line)) {
        flushList();
        out.push(line);
        continue;
      }

      const heading = matchHeading(line);
      if (heading) {
        flushList();
        const style = headingStyle(template);
        const text = formatInline(heading.text);
        out.push(`<h${heading.level} style="${style}">${text}</h${heading.level}>`);
        continue;
      }

      const ulItem = matchUnorderedListItem(line);
      if (ulItem !== null) {
        if (!listBuffer || listBuffer.type !== "ul") {
          flushList();
          listBuffer = { type: "ul", items: [] };
        }
        listBuffer.items.push(ulItem);
        continue;
      }

      const olItem = matchOrderedListItem(line);
      if (olItem !== null) {
        if (!listBuffer || listBuffer.type !== "ol") {
          flushList();
          listBuffer = { type: "ol", items: [] };
        }
        listBuffer.items.push(olItem);
        continue;
      }

      // plain paragraph
      flushList();
      if (isBlank(line)) continue;
      const style = paragraphStyle(template);
      out.push(`<p style="${style}">${formatInline(line)}</p>`);
    }

    flushList();
    return out.join("\n");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Error formatting content: ${message}`);
  }
}