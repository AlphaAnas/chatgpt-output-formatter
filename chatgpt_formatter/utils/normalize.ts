/**
 * Converts raw model output into a predictable string for markdown parsing.
 */
export function normalize(input: string): string {
  // TODO: Replace em-dashes with regular hyphens or commas according to context.
  // TODO: Convert curly single and double quotes to straight quotes.
  // TODO: Replace non-breaking spaces with regular spaces.
  // TODO: Remove zero-width characters.
  // TODO: Remove horizontal-rule "---" partition lines used as separators,
  //       while preserving real markdown breaks when they are meaningful.
  return input;
}
