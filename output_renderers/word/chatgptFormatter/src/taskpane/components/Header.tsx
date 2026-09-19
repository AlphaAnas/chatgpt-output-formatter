import * as React from "react";
import { Image, Text, tokens, makeStyles } from "@fluentui/react-components";

export interface HeaderProps {
  title: string;
  logo?: string;
  message: string;
}

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },

  logo: {
    width: "36px",
    height: "36px",
    objectFit: "contain",
  },

  logoPlaceholder: {
    width: "36px",
    height: "36px",
    borderRadius: "6px",
    backgroundColor: tokens.colorNeutralBackground3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorNeutralForeground3,
    fontSize: "11px",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  title: {
    fontSize: "15px",
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },

  message: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
});

const Header: React.FC<HeaderProps> = ({
  title,
  logo,
  message,
}) => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      {logo ? (
        <Image
          className={styles.logo}
          src={logo}
          alt={title}
        />
      ) : (
        <div className={styles.logoPlaceholder}>
          Logo
        </div>
      )}

      <div className={styles.content}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.message}>{message}</Text>
      </div>
    </header>
  );
};

export default Header;