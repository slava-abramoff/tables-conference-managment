import type { FC, ReactNode } from "react";
import styles from "./SidebarButton.module.css";

interface SidebarButtonProps {
  text: string;
  icon?: ReactNode;
  active?: boolean;
  onClick: () => void;
}

export const SidebarButton: FC<SidebarButtonProps> = ({
  text,
  icon,
  active = false,
  onClick,
}) => {
  const buttonClassName = active
    ? `${styles.button} ${styles.active}`
    : styles.button;

  return (
    <button className={buttonClassName} onClick={onClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{text}</span>
    </button>
  );
};
