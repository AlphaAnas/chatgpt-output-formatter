import * as React from "react";
import { useState } from "react";
import { Button, Field, Textarea, tokens, makeStyles } from "@fluentui/react-components";
import { processContent, templates } from "chatgpt_formatter_lib/index";

interface FormatTextProps {
  insertHtml: (html: string) => void;
}

const useStyles = makeStyles({
  wrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  textAreaField: {
    marginLeft: "20px",
    marginTop: "30px",
    marginBottom: "20px",
    marginRight: "20px",
    maxWidth: "50%",
  },
});

const FormatText: React.FC<FormatTextProps> = (props) => {
  const [rawText, setRawText] = useState<string>("");
  const styles = useStyles();

  const handleFormat = () => {
    try {
      const blocks = processContent(rawText);
      if (!blocks) throw new Error("No content could be processed.");

      const html = templates.defaultTemplate(blocks);
      props.insertHtml(html);
    } catch (e) {
      console.error("Error formatting content:", e);
    }
  };

  return (
    <div className={styles.wrap}>
      <Field className={styles.textAreaField} size="large" label="Paste ChatGPT/Claude output here.">
        <Textarea size="large" value={rawText} onChange={(e) => setRawText(e.target.value)} />
      </Field>
      <Button appearance="primary" size="large" onClick={handleFormat}>
        Clean & Format
      </Button>
    </div>
  );
};

export default FormatText;