import * as React from "react";

import {
  Button,
  makeStyles,
  Text,
} from "@fluentui/react-components";

import {
  processContent,
  templates,
} from "chatgpt_formatter_lib/index";

import { insertHtml } from "../taskpane";
import { getInputText } from "./takeInput";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    gap: "16px",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  title: {
    fontSize: "20px",
    fontWeight: 600,
  },

  subtitle: {
    fontSize: "13px",
    lineHeight: "18px",
  },

  instructions: {
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  button: {
    width: "100%",
  },

  hint: {
    fontSize: "12px",
    lineHeight: "18px",
  },
});

const FormatText: React.FC = () => {
  const styles = useStyles();

  const handleFormat = async () => {
    try {
      console.log("Getting input from Word...");

      const { text, hasSelection } = await getInputText();

      console.log("Text received:", text);
      console.log("Has selection:", hasSelection);

      if (!text.trim()) {
        console.log("No text found in Word.");
        return;
      }

      const blocks = processContent(text);

      if (!blocks) {
        throw new Error("No content could be processed.");
      }

      const html = templates.defaultTemplate(blocks);

      console.log("Formatted HTML:", html);

      await insertHtml(html, hasSelection);

      console.log("Formatting complete.");
    } catch (error) {
      console.error("Error formatting content:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>
          Format AI Text
        </Text>

        <Text className={styles.subtitle}>
          Format ChatGPT or Claude output directly in your Word document.
        </Text>
      </div>

      <div className={styles.instructions}>
        <Text>
          <strong>1.</strong> Paste your AI-generated text into Word.
        </Text>

        <Text>
          <strong>2.</strong> Select the text you want to format.
        </Text>

        <Text>
          <strong>3.</strong> Click <strong>Clean & Format</strong>.
        </Text>
      </div>

      <Button
        appearance="primary"
        size="large"
        className={styles.button}
        onClick={handleFormat}
      >
        Clean & Format
      </Button>

      <Text className={styles.hint}>
        Selected text will be replaced with the formatted version.
        If nothing is selected, the entire document will be formatted.
      </Text>
    </div>
  );
};

export default FormatText;