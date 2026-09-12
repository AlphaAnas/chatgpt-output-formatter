/**
 * Converts raw model output into a predictable string for markdown parsing.
 */
export function normalize(input: string): string {
  let text = input;

  // Replace em-dashes with regular hyphens or commas according to context.
  // Between words with spaces around it -> " - " ; tight (no spaces, e.g. "2020—2021") -> "-"
  text = text.replace(/\s+[—–]\s+/g, " - ");
  text = text.replace(/([A-Za-z0-9])[—–]([A-Za-z0-9])/g, "$1-$2");

  // Convert curly single and double quotes to straight quotes.
  text = text.replace(/[\u2018\u2019]/g, "'");
  text = text.replace(/[\u201C\u201D]/g, '"');

  // Replace non-breaking spaces with regular spaces.
  text = text.replace(/\u00A0/g, " ");

  // Remove zero-width characters.
  text = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");

  // Remove horizontal-rule "---" partition lines used as separators,
  // while preserving real markdown breaks when they are meaningful.
  // A separator line is "---"/"***"/"___" alone on its own line, with
  // blank lines (or nothing) on both sides - that's AI-added decoration,
  // not an intentional <hr> the user wrote inline in prose.
  text = text.replace(
    /(^|\n)[ \t]*\n[ \t]*(?:-{3,}|\*{3,}|_{3,})[ \t]*\n[ \t]*(\n|$)/g,
    "$1$2"
  );

  return text.trim();
}