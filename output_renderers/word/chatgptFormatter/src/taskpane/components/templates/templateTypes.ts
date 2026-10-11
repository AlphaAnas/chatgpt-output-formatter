import type { AffidavitSettings, TextAlignment } from "chatgpt_formatter_lib/index";

/**
 * Same shape as AffidavitSettings, but with the numeric sizes kept as
 * strings while the user is editing them (so an input can be briefly
 * empty or "1" without being coerced to 0).
 */
export interface EditableSettings extends Omit<AffidavitSettings, "bodySizePt" | "headingSizePt"> {
  bodySizePt: string;
  headingSizePt: string;
}

export interface SavedTemplate {
  id: string;
  name: string;
  isBuiltIn: boolean;
  settings: AffidavitSettings;
}

export const alignmentOptions: { value: TextAlignment; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centered" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justified" },
];

export function toEditableSettings(settings: AffidavitSettings): EditableSettings {
  return {
    ...settings,
    bodySizePt: String(settings.bodySizePt),
    headingSizePt: String(settings.headingSizePt),
  };
}

export function parseEditableSettings(settings: EditableSettings): AffidavitSettings | null {
  const bodySizePt = Number(settings.bodySizePt);
  const headingSizePt = Number(settings.headingSizePt);
  if (
    !Number.isFinite(bodySizePt) || bodySizePt < 6 || bodySizePt > 72 ||
    !Number.isFinite(headingSizePt) || headingSizePt < 6 || headingSizePt > 72
  ) {
    return null;
  }
  return {
    fontFamily: settings.fontFamily,
    bodySizePt,
    paragraphAlign: settings.paragraphAlign,
    headingSizePt,
    headingAlign: settings.headingAlign,
    signatureAlign: settings.signatureAlign,
  };
}
