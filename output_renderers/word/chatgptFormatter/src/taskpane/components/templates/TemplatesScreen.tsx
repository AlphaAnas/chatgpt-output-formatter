import * as React from "react";
import { Button, Text, makeStyles } from "@fluentui/react-components";

import TemplateCard from "./TemplateCard";
import type { SavedTemplate } from "./templateTypes";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
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
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

interface TemplatesScreenProps {
  templates: SavedTemplate[];
  selectedId: string;
  onBack: () => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
}

const TemplatesScreen: React.FC<TemplatesScreenProps> = ({
  templates,
  selectedId,
  onBack,
  onSelect,
  onEdit,
  onCreateNew,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <button type="button" className={styles.backLink} onClick={onBack}>
        ← Format
      </button>

      <Text className={styles.title}>Templates</Text>

      <div className={styles.list} role="radiogroup" aria-label="Choose a template">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={template.id === selectedId}
            onSelect={() => onSelect(template.id)}
            onEdit={template.isBuiltIn ? undefined : () => onEdit(template.id)}
          />
        ))}
      </div>

      <Button appearance="outline" onClick={onCreateNew}>
        + Create new template
      </Button>
    </div>
  );
};

export default TemplatesScreen;
