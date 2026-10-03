import type { Block } from "./ir";
import { renderHTML } from "./renderer-html";

export type TextAlignment = "left" | "center" | "right" | "justify";

export interface AffidavitSettings {
  fontFamily: string;
  bodySizePt: number;
  paragraphAlign: TextAlignment;
  headingSizePt: number;
  headingAlign: TextAlignment;
  signatureAlign: TextAlignment;
}

export interface FormatTemplate {
  headingFont: string;
  headingSize: string;
  headingBold: boolean;
  headingAlign: TextAlignment;
  headingSpaceAfter: string;
  subHeadingFont: string;
  subHeadingSize: string;
  subHeadingBold: boolean;
  subHeadingAlign: TextAlignment;
  subHeadingSpaceAfter: string;
  bodyFont: string;
  bodySize: string;
  bodyAlign: TextAlignment;
  bodySpaceAfter: string;
  listFont: string;
  listSize: string;
  signatureFont: string;
  signatureSize: string;
  signatureBold: boolean;
  signatureAlign: TextAlignment;
}

const AFFIDAVIT_DEFAULTS: AffidavitSettings = {
  fontFamily: "Times New Roman",
  bodySizePt: 14,
  paragraphAlign: "justify",
  headingSizePt: 16,
  headingAlign: "center",
  signatureAlign: "right",
};

const defaultConfig: FormatTemplate = {
  headingFont: "Times New Roman",
  headingSize: "16pt",
  headingBold: true,
  headingAlign: "center",
  headingSpaceAfter: "12pt",
  subHeadingFont: "Times New Roman",
  subHeadingSize: "16pt",
  subHeadingBold: true,
  subHeadingAlign: "center",
  subHeadingSpaceAfter: "8pt",
  bodyFont: "Times New Roman",
  bodySize: "14pt",
  bodyAlign: "justify",
  bodySpaceAfter: "6pt",
  listFont: "Times New Roman",
  listSize: "14pt",
  signatureFont: "Times New Roman",
  signatureSize: "14pt",
  signatureBold: true,
  signatureAlign: "right",
};

export function getAffidavitDefaults(): AffidavitSettings {
  return { ...AFFIDAVIT_DEFAULTS };
}

export function affidavitTemplate(
  blocks: Block[],
  settings: AffidavitSettings = AFFIDAVIT_DEFAULTS
): string {
  const bodySize = `${settings.bodySizePt}pt`;
  const headingSize = `${settings.headingSizePt}pt`;
  const template: FormatTemplate = {
    ...defaultConfig,
    headingFont: settings.fontFamily,
    headingSize,
    headingAlign: settings.headingAlign,
    subHeadingFont: settings.fontFamily,
    subHeadingSize: headingSize,
    subHeadingAlign: settings.headingAlign,
    bodyFont: settings.fontFamily,
    bodySize,
    bodyAlign: settings.paragraphAlign,
    listFont: settings.fontFamily,
    listSize: bodySize,
    signatureFont: settings.fontFamily,
    signatureSize: bodySize,
    signatureAlign: settings.signatureAlign,
  };

  return renderHTML(blocks, template);
}

export function defaultTemplate(blocks: Block[]): string {
  return affidavitTemplate(blocks);
}