import * as React from "react";
import { useState } from "react";
import { Button, Text, makeStyles } from "@fluentui/react-components";

import type { AffidavitSettings } from "chatgpt_formatter_lib/index";

import SettingsFields from "./SettingsFields";
import { parseEditableSettings, type EditableSettings } from "./templateTypes";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  backLink: {
    alignSelf: "flex-start",
    color: "#185ABD",
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "12px",
    cursor: "pointer",
  },
  title: {
    fontSize: "16px",
    fontWeight: 600,
  },
  nameRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  nameLabel: {
    fontSize: "12px",
  },
  nameInput: {
    boxSizing: "border-box",
    width: "100%",
    minHeight: "30px",
    border: "1px solid #8A8886",
    borderRadius: "2px",
    padding: "4px 7px",
    fontSize: "12px",
    fontFamily: "inherit",
  },
  error: {
    color: "#A4262C",
    fontSize: "12px",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  saveButton: {
    flexGrow: 1,
  },
});

interface TemplateFormProps {
  title: string;
  initialName: string;
  initialSettings: EditableSettings;
  onCancel: () => void;
  onSave: (name: string, settings: AffidavitSettings) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  title,
  initialName,
  initialSettings,
  onCancel,
  onSave,
}) => {
  const styles = useStyles();
  const [name, setName] = useState(initialName);
  const [settings, setSettings] = useState<EditableSettings>(initialSettings);
  const [error, setError] = useState("");

  const updateSetting = <K extends keyof EditableSettings,>(key: K, value: EditableSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("Enter a template name.");
      return;
    }
    const parsed = parseEditableSettings(settings);
    if (!parsed) {
      setError("Enter font sizes from 6 to 72 pt.");
      return;
    }
    onSave(name.trim(), parsed);
  };

  return (
    <div className={styles.container}>
      <button type="button" className={styles.backLink} onClick={onCancel}>
        ← Templates
      </button>

      <Text className={styles.title}>{title}</Text>

      <div className={styles.nameRow}>
        <label className={styles.nameLabel} htmlFor="template-name">Template name</label>
        <input
          id="template-name"
          className={styles.nameInput}
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.currentTarget.value);
            setError("");
          }}
          placeholder="e.g. Business letter"
        />
      </div>

      <SettingsFields settings={settings} onChange={updateSetting} idPrefix="template-form" />

      {error && <Text role="alert" className={styles.error}>{error}</Text>}

      <div className={styles.actions}>
        <Button appearance="secondary" onClick={onCancel}>Cancel</Button>
        <Button appearance="primary" className={styles.saveButton} onClick={handleSave}>
          Save template
        </Button>
      </div>
    </div>
  );
};

export default TemplateForm;
