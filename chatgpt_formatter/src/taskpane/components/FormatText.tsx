import * as React from "react";
import { useState } from "react";
import { Button, Field, Textarea, tokens, makeStyles } from "@fluentui/react-components";
import TextGrabber from "./TextGrabber";

interface FormatTextProps {
  formatText: () => Promise<string>;
}

const useStyles = makeStyles({
  textPromptAndInsertion: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textAreaField: {
    marginLeft: "20px",
    marginTop: "30px",
    marginBottom: "20px",
    marginRight: "20px",
    maxWidth: "50%",
  },
});

const FormatText: React.FC<FormatTextProps> = (props: FormatTextProps) => {
  const [formatted, setFormatted] = useState<string>("");
  const styles = useStyles();

  const handleFormat = async () => {
    const result = await props.formatText();
    setFormatted(result);
  };

  return (
    <div className={styles.textPromptAndInsertion}>
      <Button appearance="primary" size="large" onClick={handleFormat}>
        Format Text
      </Button>
      {/* <Field className={styles.textAreaField} size="large" label="Grabbed document text:">
        <Textarea size="large" value={grabbed} readOnly rows={10} />
      </Field> */}
    </div>
  );
};

export default FormatText;