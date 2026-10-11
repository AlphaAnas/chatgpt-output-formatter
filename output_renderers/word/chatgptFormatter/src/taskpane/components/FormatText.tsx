import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button, Text, makeStyles } from "@fluentui/react-components";

import {
  ooxmlHasWordStructure,
  ooxmlToBlocks,
  processContent,
  templates,
} from "chatgpt_formatter_lib/index";
import type { AffidavitSettings } from "chatgpt_formatter_lib/index";

import { insertHtml } from "../taskpane";
import { getInputText } from "./takeInput";

import SettingsFields from "./templates/SettingsFields";
import TemplateForm from "./templates/TemplateForm";
import TemplatesScreen from "./templates/TemplatesScreen";
import { loadCustomTemplates, saveCustomTemplates } from "./templates/templateStorage";
import {
  parseEditableSettings,
  toEditableSettings,
  type EditableSettings,
  type SavedTemplate,
} from "./templates/templateTypes";

const BUILT_IN_TEMPLATE_ID = "builtin-affidavit";

function buildBuiltInTemplate(): SavedTemplate {
  return {
    id: BUILT_IN_TEMPLATE_ID,
    name: "Affidavit template",
    isBuiltIn: true,
    settings: templates.getAffidavitDefaults(),
  };
}

function createTemplateId(): string {
  return `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasMarkdownSyntax(text: string): boolean {
  return /(^|\n)\s{0,3}(?:#{1,6}\s|[-*+]\s|\d+\.\s)|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`/m.test(text);
}

function alignLabel(align: string): string {
  if (align === "center") return "centered";
  if (align === "right") return "right-aligned";
  if (align === "justify") return "justified";
  return "left-aligned";
}

type View = "format" | "templates" | "create" | "edit";

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
  templateRow: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    width: "100%",
    border: "1px solid #185ABD",
    borderLeftWidth: "3px",
    borderRadius: "3px",
    padding: "8px 9px",
    backgroundColor: "#F7F9FC",
    cursor: "pointer",
    textAlign: "left",
  },
  templateRowText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  templateName: {
    fontSize: "13px",
    fontWeight: 600,
  },
  templateSummary: {
    fontSize: "11px",
    color: "#59636E",
  },
  chevron: {
    fontSize: "16px",
    color: "#59636E",
    flexShrink: 0,
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

  const [view, setView] = useState<View>("format");
  const [returnView, setReturnView] = useState<View>("format");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const builtInTemplate = useMemo(() => buildBuiltInTemplate(), []);
  const [customTemplates, setCustomTemplates] = useState<SavedTemplate[]>(() => loadCustomTemplates());
  const allTemplates = useMemo(() => [builtInTemplate, ...customTemplates], [builtInTemplate, customTemplates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState(BUILT_IN_TEMPLATE_ID);
  const [settings, setSettings] = useState<EditableSettings>(() => toEditableSettings(builtInTemplate.settings));
  const [error, setError] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);

  useEffect(() => {
    saveCustomTemplates(customTemplates);
  }, [customTemplates]);

  const activeTemplate = allTemplates.find((t) => t.id === selectedTemplateId) ?? builtInTemplate;

  const updateSetting = <K extends keyof EditableSettings,>(key: K, value: EditableSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const resetSettings = () => {
    setSettings(toEditableSettings(activeTemplate.settings));
    setError("");
  };

  const selectTemplate = (id: string) => {
    const found = allTemplates.find((t) => t.id === id);
    if (!found) return;
    setSelectedTemplateId(id);
    setSettings(toEditableSettings(found.settings));
    setView("format");
  };

  const openCreateFromSettings = () => {
    setReturnView("format");
    setEditingTemplateId(null);
    setView("create");
  };

  const openCreateFromTemplates = () => {
    setReturnView("templates");
    setEditingTemplateId(null);
    setView("create");
  };

  const openEdit = (id: string) => {
    setReturnView("templates");
    setEditingTemplateId(id);
    setView("edit");
  };

  const handleSaveTemplate = (name: string, parsedSettings: AffidavitSettings) => {
    if (editingTemplateId) {
      setCustomTemplates((current) =>
        current.map((t) => (t.id === editingTemplateId ? { ...t, name, settings: parsedSettings } : t))
      );
      setSelectedTemplateId(editingTemplateId);
    } else {
      const id = createTemplateId();
      setCustomTemplates((current) => [...current, { id, name, isBuiltIn: false, settings: parsedSettings }]);
      setSelectedTemplateId(id);
    }
    setSettings(toEditableSettings(parsedSettings));
    setError("");
    setView("format");
  };

  const handleCancelForm = () => {
    setView(returnView);
  };

  const handleFormat = async () => {
    setError("");

    const parsedSettings = parseEditableSettings(settings);
    if (!parsedSettings) {
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

      const html = templates.affidavitTemplate(blocks, parsedSettings);
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

  if (view === "templates") {
    return (
      <div className={styles.container}>
        <TemplatesScreen
          templates={allTemplates}
          selectedId={selectedTemplateId}
          onBack={() => setView("format")}
          onSelect={selectTemplate}
          onEdit={openEdit}
          onCreateNew={openCreateFromTemplates}
        />
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    const editingTemplate = editingTemplateId ? allTemplates.find((t) => t.id === editingTemplateId) : null;
    return (
      <div className={styles.container}>
        <TemplateForm
          title={view === "edit" ? "Edit template" : "Create template"}
          initialName={editingTemplate ? editingTemplate.name : ""}
          initialSettings={editingTemplate ? toEditableSettings(editingTemplate.settings) : settings}
          onCancel={handleCancelForm}
          onSave={handleSaveTemplate}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button type="button" className={styles.templateRow} onClick={() => setView("templates")}>
        <span className={styles.templateRowText}>
          <Text className={styles.templateName}>{activeTemplate.name}</Text>
          <Text className={styles.templateSummary}>
            {activeTemplate.settings.fontFamily} · {activeTemplate.settings.bodySizePt}pt ·{" "}
            {alignLabel(activeTemplate.settings.headingAlign)} headings
          </Text>
        </span>
        <span className={styles.chevron} aria-hidden="true">›</span>
      </button>

      <SettingsFields settings={settings} onChange={updateSetting} idPrefix="format" />

      <Button appearance="subtle" size="small" className={styles.resetButton} onClick={resetSettings}>
        Reset to template defaults
      </Button>

      <Button appearance="subtle" size="small" className={styles.resetButton} onClick={openCreateFromSettings}>
        Save current settings as a new template
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
