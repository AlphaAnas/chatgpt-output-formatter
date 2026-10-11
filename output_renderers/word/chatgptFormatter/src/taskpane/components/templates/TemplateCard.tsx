import * as React from "react";
import { Text, makeStyles } from "@fluentui/react-components";

import type { SavedTemplate } from "./templateTypes";

const useStyles = makeStyles({
  card: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    border: "1px solid #D9DEE5",
    borderRadius: "2px",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  cardSelected: {
    border: "1px solid #185ABD",
    borderLeftWidth: "3px",
    backgroundColor: "#F7F9FC",
  },
  preview: {
    boxSizing: "border-box",
    flexShrink: 0,
    width: "44px",
    height: "56px",
    border: "1px solid #D9DEE5",
    borderRadius: "1px",
    backgroundColor: "#FFFFFF",
    padding: "6px 5px",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  previewHeading: {
    height: "4px",
    borderRadius: "1px",
    backgroundColor: "#185ABD",
  },
  previewLine: {
    height: "3px",
    borderRadius: "1px",
    backgroundColor: "#D9DEE5",
    width: "100%",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#000000",
  },
  summary: {
    fontSize: "11px",
    color: "#59636E",
  },
  trailing: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    flexShrink: 0,
  },
  dot: {
    boxSizing: "border-box",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "1.5px solid #8A8886",
  },
  dotSelected: {
    border: "1.5px solid #185ABD",
    backgroundColor: "#185ABD",
  },
  editLink: {
    fontSize: "11px",
    color: "#185ABD",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
});

function alignToFlex(align: string): string {
  if (align === "center") return "center";
  if (align === "right") return "flex-end";
  return "flex-start";
}

function alignLabel(align: string): string {
  if (align === "center") return "Centered";
  if (align === "right") return "Right-aligned";
  if (align === "justify") return "Justified";
  return "Left-aligned";
}

interface TemplateCardProps {
  template: SavedTemplate;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, selected, onSelect, onEdit }) => {
  const styles = useStyles();
  const { settings } = template;

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      className={selected ? `${styles.card} ${styles.cardSelected}` : styles.card}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className={styles.preview} aria-hidden="true">
        <div
          className={styles.previewHeading}
          style={{ width: "60%", alignSelf: alignToFlex(settings.headingAlign) }}
        />
        <div className={styles.previewLine} />
        <div className={styles.previewLine} style={{ width: "80%" }} />
        <div className={styles.previewLine} style={{ width: "90%" }} />
      </div>

      <div className={styles.info}>
        <Text className={styles.name}>{template.name}</Text>
        <Text className={styles.summary}>{settings.fontFamily} · {settings.bodySizePt}pt</Text>
        <Text className={styles.summary}>{alignLabel(settings.headingAlign)} headings</Text>
      </div>

      <div className={styles.trailing}>
        <span className={selected ? `${styles.dot} ${styles.dotSelected}` : styles.dot} aria-hidden="true" />
        {onEdit && (
          <button
            type="button"
            className={styles.editLink}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
