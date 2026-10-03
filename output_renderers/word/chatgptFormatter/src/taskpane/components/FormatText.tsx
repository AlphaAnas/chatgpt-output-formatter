import * as React from "react";
import { useState } from "react";
import {
  Button,
  makeStyles,
  Radio,
  RadioGroup,
  Text,
} from "@fluentui/react-components";

import {
  ooxmlHasWordStructure,
  ooxmlToBlocks,
  processContent,
  templates,
} from "chatgpt_formatter_lib/index";
import type { AffidavitSettings, TextAlignment } from "chatgpt_formatter_lib/index";

import { insertHtml } from "../taskpane";
import { getInputText } from "./takeInput";

interface EditableSettings extends Omit<AffidavitSettings, "bodySizePt" | "headingSizePt"> {
  bodySizePt: string;
  headingSizePt: string;
}

const alignmentOptions: { value: TextAlignment; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centered" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justified" },
];

function getDefaultFormSettings(): EditableSettings {
  const defaults = templates.getAffidavitDefaults();
  return {
    ...defaults,
    bodySizePt: String(defaults.bodySizePt),
    headingSizePt: String(defaults.headingSizePt),
  };
}

function hasMarkdownSyntax(text: string): boolean {
  return /(^|\n)\s{0,3}(?:#{1,6}\s|[-*+]\s|\d+\.\s)|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`/m.test(text);
}

const useStyles = makeStyles({
  container: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minHeight: "100vh",
    padding: "16px 14px 76px",
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },

  templateSection: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  templateChoice: {
    border: "1px solid #185ABD",
    borderLeftWidth: "3px",
    borderRadius: "3px",
    padding: "8px 9px",
    backgroundColor: "#F7F9FC",
  },
  templateDescription: {
    display: "block",
    color: "#59636E",
    fontSize: "11px",
    lineHeight: "15px",
    paddingLeft: "26px",
  },
  settingsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    borderTop: "1px solid #D9DEE5",
    paddingTop: "11px",
  },
  settingsHeading: {
    fontSize: "13px",
    fontWeight: 600,
  },
  settingRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(118px, 1.15fr)",
    alignItems: "center",
    gap: "8px",
    minHeight: "32px",
  },
  settingLabel: {
    fontSize: "12px",
    lineHeight: "16px",
  },
  control: {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    minHeight: "30px",
    border: "1px solid #8A8886",
    borderRadius: "2px",
    padding: "4px 7px",
    color: "#000000",
    backgroundColor: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: "12px",
    outlineColor: "#185ABD",
    "&:focus-visible": {
      outline: "2px solid #185ABD",
      outlineOffset: "1px",
    },
  },
  resetButton: {
    alignSelf: "flex-start",
    marginLeft: "-8px",
    minHeight: "28px",
  },
  instruction: {
    color: "#59636E",
    fontSize: "11px",
    lineHeight: "15px",
  },
  error: {
    color: "#A4262C",
    fontSize: "12px",
    lineHeight: "16px",
  },
  actionBar: {
    position: "sticky",
    bottom: 0,
    zIndex: 1,
    marginTop: "auto",
    paddingTop: "10px",
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #D9DEE5",
  },
  applyButton: {
    width: "100%",
  },
});

const FormatText: React.FC = () => {
  const styles = useStyles();
  const [selectedTemplate, setSelectedTemplate] = useState("affidavit");
  const [settings, setSettings] = useState<EditableSettings>(getDefaultFormSettings);
  const [error, setError] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);

  const updateSetting = <K extends keyof EditableSettings,>(key: K, value: EditableSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const resetSettings = () => {
    setSettings(getDefaultFormSettings());
    setError("");
  };

  const handleFormat = async () => {
    setError("");

    const bodySizePt = Number(settings.bodySizePt);
    const headingSizePt = Number(settings.headingSizePt);
    if (
      !Number.isFinite(bodySizePt) || bodySizePt < 6 || bodySizePt > 72 ||
      !Number.isFinite(headingSizePt) || headingSizePt < 6 || headingSizePt > 72
    ) {
      setError("Enter font sizes from 6 to 72 pt.");
      return;
    }

    setIsFormatting(true);
    try {
      console.log("Getting input from Word...");
      const { text, ooxml, hasSelection } = await getInputText();
      console.log("Text received:", text);
      console.log("Has selection:", hasSelection);

      if (!text.trim()) {
        setError("Select text or add text to the document first.");
        return;
      }

      const hasMarkdown = hasMarkdownSyntax(text);
      const hasWordStructure = ooxmlHasWordStructure(ooxml);
      const wordBlocks = ooxml && hasWordStructure && !hasMarkdown ? ooxmlToBlocks(ooxml) : [];
      const blocks = wordBlocks.length > 0 ? wordBlocks : processContent(text);
      console.log("Using Word OOXML structure:", wordBlocks.length > 0);
      console.log("Detected blocks:", blocks);

      if (!blocks || blocks.length === 0) {
        setError("No content could be processed.");
        return;
      }

      if (selectedTemplate !== "affidavit") {
        setError("Select a template before applying formatting.");
        return;
      }

      const templateSettings: AffidavitSettings = {
        fontFamily: settings.fontFamily,
        bodySizePt,
        paragraphAlign: settings.paragraphAlign,
        headingSizePt,
        headingAlign: settings.headingAlign,
        signatureAlign: settings.signatureAlign,
      };
      const html = templates.affidavitTemplate(blocks, templateSettings);
      console.log("Formatted HTML:", html);

      await insertHtml(html, hasSelection);
      console.log("Formatting complete.");
    } catch (formatError) {
      console.error("Error formatting content:", formatError);
      setError("Formatting failed. Check the browser console for details.");
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.templateSection}>
        <div className={styles.templateChoice}>
          <RadioGroup
            aria-label="Choose a template"
            value={selectedTemplate}
            onChange={(_, data) => setSelectedTemplate(data.value)}
          >
            <Radio value="affidavit" label="Affidavit template" />
          </RadioGroup>
          <Text className={styles.templateDescription}>
            Times New Roman · 14 pt body · centered headings
          </Text>
        </div>
      </section>

      <section className={styles.settingsSection} aria-labelledby="document-settings-heading">
        <Text id="document-settings-heading" className={styles.settingsHeading}>Document</Text>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor="font-family">Font</label>
          <select
            id="font-family"
            className={styles.control}
            value={settings.fontFamily}
            onChange={(event) => updateSetting("fontFamily", event.currentTarget.value)}
          >
            <option>Times New Roman</option>
            <option>Arial</option>
            <option>Calibri</option>
            <option>Georgia</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor="body-size">Body size</label>
          <input
            id="body-size"
            className={styles.control}
            type="number"
            min="6"
            max="72"
            step="1"
            value={settings.bodySizePt}
            onChange={(event) => updateSetting("bodySizePt", event.currentTarget.value)}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor="paragraph-alignment">Paragraph alignment</label>
          <select
            id="paragraph-alignment"
            className={styles.control}
            value={settings.paragraphAlign}
            onChange={(event) => updateSetting("paragraphAlign", event.currentTarget.value as TextAlignment)}
          >
            {alignmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.settingsSection} aria-labelledby="heading-settings-heading">
        <Text id="heading-settings-heading" className={styles.settingsHeading}>Headings</Text>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor="heading-size">Heading size</label>
          <input
            id="heading-size"
            className={styles.control}
            type="number"
            min="6"
            max="72"
            step="1"
            value={settings.headingSizePt}
            onChange={(event) => updateSetting("headingSizePt", event.currentTarget.value)}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor="heading-alignment">Alignment</label>
          <select
            id="heading-alignment"
            className={styles.control}
            value={settings.headingAlign}
            onChange={(event) => updateSetting("headingAlign", event.currentTarget.value as TextAlignment)}
          >
            {alignmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.settingsSection} aria-labelledby="signature-settings-heading">
        <Text id="signature-settings-heading" className={styles.settingsHeading}>Signature</Text>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor="signature-alignment">Alignment</label>
          <select
            id="signature-alignment"
            className={styles.control}
            value={settings.signatureAlign}
            onChange={(event) => updateSetting("signatureAlign", event.currentTarget.value as TextAlignment)}
          >
            {alignmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <Button
        appearance="subtle"
        size="small"
        className={styles.resetButton}
        onClick={resetSettings}
      >
        Reset to template defaults
      </Button>

      <Text className={styles.instruction}>
        Select text to format it, or leave no selection to format the whole document.
      </Text>

      {error && <Text role="alert" className={styles.error}>{error}</Text>}

      <div className={styles.actionBar}>
        <Button
          appearance="primary"
          size="large"
          className={styles.applyButton}
          onClick={handleFormat}
          disabled={isFormatting}
        >
          {isFormatting ? "Formatting…" : "Apply formatting"}
        </Button>
      </div>
    </div>
  );
};

export default FormatText;
