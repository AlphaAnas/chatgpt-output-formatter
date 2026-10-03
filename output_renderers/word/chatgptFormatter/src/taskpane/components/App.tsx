import * as React from "react";

import { makeStyles } from "@fluentui/react-components";

import FormatText from "./FormatText";


const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>

      <FormatText />
    </div>
  );
};

export default App;