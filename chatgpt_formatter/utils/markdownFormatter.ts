/**
 * Applies formatting rules (fonts, sizes, alignment) to already-cleaned
 * markdown/HTML content, producing final styled HTML ready for insertion
 * into Word/Docs.
 */

export interface FormatTemplate {
  headingFont: string;
  headingSize: string;   // e.g. "14pt"
  headingBold: boolean;
  headingAlign: "left" | "center" | "right" | "justify";
  headingSpaceAfter: string; // e.g. "12pt"
  bodyFont: string;
  bodySize: string;      // e.g. "12pt"
  bodyAlign: "left" | "center" | "right" | "justify";
  bodySpaceAfter: string;    // e.g. "6pt"
  listFont: string;
  listSize: string;
}

export const defaultTemplate: FormatTemplate = {
  headingFont: "Times New Roman",
  headingSize: "14pt",
  headingBold: true,
  headingAlign: "center",
  headingSpaceAfter: "12pt",
  bodyFont: "Times New Roman",
  bodySize: "12pt",
  bodyAlign: "justify",
  bodySpaceAfter: "6pt",
  listFont: "Times New Roman",
  listSize: "12pt",
};

function styleString(entries: Record<string, string>): string {
  return Object.entries(entries)
    .map(([k, v]) => `${k}:${v}`)
    .join("; ");
}

function headingStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.headingFont}', serif`,
    "font-size": t.headingSize,
    "text-align": t.headingAlign,
    "font-weight": t.headingBold ? "bold" : "normal",
    "color": "#000000",
    "margin-top": "12pt",
    "margin-bottom": t.headingSpaceAfter,
  });
}

function paragraphStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.bodyFont}', serif`,
    "font-size": t.bodySize,
    "text-align": t.bodyAlign,
    "color": "#000000",
    "margin-top": "0pt",
    "margin-bottom": t.bodySpaceAfter,
    "line-height": "1.15",
  });
}

function listItemStyle(t: FormatTemplate): string {
  return styleString({
    "font-family": `'${t.listFont}', serif`,
    "font-size": t.listSize,
    "margin-bottom": "3pt",
    "text-align": "justify",
  });
}

function formatInline(text: string): string {
  let result = text;
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, "<em>$1</em>");
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");
  result = result.replace(/~(.+?)~/g, "<del>$1</del>");
  result = result.replace(/`([^`]+?)`/g, "<code>$1</code>");
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return result;
}

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

export async function formatContentHTML(
  content: string,
  template: FormatTemplate = defaultTemplate
): Promise<string> {
  try {
    // Pre-clean input formatting
    const cleaned = content
      .replace(/(?<!\n)(#{1,6}\s+)/g, "\n$1")
      .replace(/(?<!\n)(\d+\.\s+)/g, "\n$1");

    const lines = cleaned.split(/\r?\n/);
    const out: string[] = [];

    let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

    const flushList = () => {
      if (!listBuffer) return;
      const tag = listBuffer.type;
      const style = listItemStyle(template);
      const items = listBuffer.items
        .map((item) => `<li style="${style}">${formatInline(item)}</li>`)
        .join("");
      out.push(`<${tag} style="margin-bottom: ${template.bodySpaceAfter}; padding-left: 20pt;">${items}</${tag}>`);
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
        const blockStyle = headingStyle(template);
        const text = formatInline(heading.text);
        const spanStyle = `font-family: '${template.headingFont}', serif; font-size: ${template.headingSize}; font-weight: ${template.headingBold ? "bold" : "normal"};`;
        
        out.push(`<h${heading.level} style="${blockStyle}"><span style="${spanStyle}">${text}</span></h${heading.level}>`);
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

      // Plain paragraph
      flushList();
      if (isBlank(line)) continue;
      const blockStyle = paragraphStyle(template);
      const text = formatInline(line);
      const spanStyle = `font-family: '${template.bodyFont}', serif; font-size: ${template.bodySize};`;
      
      out.push(`<p style="${blockStyle}"><span style="${spanStyle}">${text}</span></p>`);
    }

    flushList();
    return out.join("\n");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Error formatting content: ${message}`);
  }
}