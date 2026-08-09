import * as React from "react";
import { useState } from "react";
import { Button, Field, Textarea, tokens, makeStyles } from "@fluentui/react-components";

interface TextGrabberProps {
  grabText: () => Promise<string>;
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

const TextGrabber: React.FC<TextGrabberProps> = (props: TextGrabberProps) => {
  const [grabbed, setGrabbed] = useState<string>("");
  const styles = useStyles();

  const handleGrab = async () => {
    const result = await props.grabText();
    setGrabbed(result);
  };

  return (
    <div className={styles.textPromptAndInsertion}>
      <Button appearance="primary" size="large" onClick={handleGrab}>
        Grab Text
      </Button>
      {/* <Field className={styles.textAreaField} size="large" label="Grabbed document text:">
        <Textarea size="large" value={grabbed} readOnly rows={10} />
      </Field> */}
    </div>
  );
};

export default TextGrabber;