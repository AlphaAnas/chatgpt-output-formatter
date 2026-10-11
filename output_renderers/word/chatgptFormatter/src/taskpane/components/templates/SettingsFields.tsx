import * as React from "react";
import { Text, makeStyles } from "@fluentui/react-components";

import type { TextAlignment } from "chatgpt_formatter_lib/index";

import { alignmentOptions, type EditableSettings } from "./templateTypes";

const useStyles = makeStyles({
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
});

interface SettingsFieldsProps {
  settings: EditableSettings;
  onChange: <K extends keyof EditableSettings>(key: K, value: EditableSettings[K]) => void;
  idPrefix: string;
}

const SettingsFields: React.FC<SettingsFieldsProps> = ({ settings, onChange, idPrefix }) => {
  const styles = useStyles();

  return (
    <>
      <section className={styles.settingsSection} aria-labelledby={`${idPrefix}-document-heading`}>
        <Text id={`${idPrefix}-document-heading`} className={styles.settingsHeading}>Document</Text>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor={`${idPrefix}-font-family`}>Font</label>
          <select
            id={`${idPrefix}-font-family`}
            className={styles.control}
            value={settings.fontFamily}
            onChange={(event) => onChange("fontFamily", event.currentTarget.value)}
          >
            <option>Times New Roman</option>
            <option>Arial</option>
            <option>Calibri</option>
            <option>Georgia</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor={`${idPrefix}-body-size`}>Body size</label>
          <input
            id={`${idPrefix}-body-size`}
            className={styles.control}
            type="number"
            min="6"
            max="72"
            step="1"
            value={settings.bodySizePt}
            onChange={(event) => onChange("bodySizePt", event.currentTarget.value)}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor={`${idPrefix}-paragraph-alignment`}>Paragraph alignment</label>
          <select
            id={`${idPrefix}-paragraph-alignment`}
            className={styles.control}
            value={settings.paragraphAlign}
            onChange={(event) => onChange("paragraphAlign", event.currentTarget.value as TextAlignment)}
          >
            {alignmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.settingsSection} aria-labelledby={`${idPrefix}-heading-heading`}>
        <Text id={`${idPrefix}-heading-heading`} className={styles.settingsHeading}>Headings</Text>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor={`${idPrefix}-heading-size`}>Heading size</label>
          <input
            id={`${idPrefix}-heading-size`}
            className={styles.control}
            type="number"
            min="6"
            max="72"
            step="1"
            value={settings.headingSizePt}
            onChange={(event) => onChange("headingSizePt", event.currentTarget.value)}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor={`${idPrefix}-heading-alignment`}>Alignment</label>
          <select
            id={`${idPrefix}-heading-alignment`}
            className={styles.control}
            value={settings.headingAlign}
            onChange={(event) => onChange("headingAlign", event.currentTarget.value as TextAlignment)}
          >
            {alignmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.settingsSection} aria-labelledby={`${idPrefix}-signature-heading`}>
        <Text id={`${idPrefix}-signature-heading`} className={styles.settingsHeading}>Signature</Text>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel} htmlFor={`${idPrefix}-signature-alignment`}>Alignment</label>
          <select
            id={`${idPrefix}-signature-alignment`}
            className={styles.control}
            value={settings.signatureAlign}
            onChange={(event) => onChange("signatureAlign", event.currentTarget.value as TextAlignment)}
          >
            {alignmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>
    </>
  );
};

export default SettingsFields;
