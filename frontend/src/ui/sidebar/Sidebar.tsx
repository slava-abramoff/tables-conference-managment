import type { FC, PropsWithChildren } from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {children}
      </aside>
    </>
  );
};
