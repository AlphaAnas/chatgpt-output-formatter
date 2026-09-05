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

// TODO: Add lawyerTemplate, hrTemplate, etc. here later — same shape, different values.
