import type { Block } from "./ir";
import { renderHTML } from "./renderer-html";

export interface FormatTemplate {
  headingFont: string;
  headingSize: string;
  headingBold: boolean;
  headingAlign: "left" | "center" | "right" | "justify";
  headingSpaceAfter: string;
  bodyFont: string;
  bodySize: string;
  bodyAlign: "left" | "center" | "right" | "justify";
  bodySpaceAfter: string;
  listFont: string;
  listSize: string;
}

const defaultConfig: FormatTemplate = {
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

// main.ts calls templates.defaultTemplate(blocks) - so this is a function, not a config.
export function defaultTemplate(blocks: Block[]): string {
  return renderHTML(blocks, defaultConfig);
}

// TODO: lawyerTemplate(blocks), hrTemplate(blocks) - same shape, different config object.