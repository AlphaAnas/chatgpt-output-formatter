// index.ts

// the exposed API file

export { processContent } from "./processContent";
export { ooxmlToBlocks, ooxmlHasWordStructure } from "./utils/wordOoxml";
export * as templates from "./utils/templates";
export type { Block } from "./utils/ir";
export type { FormatTemplate } from "./utils/templates";