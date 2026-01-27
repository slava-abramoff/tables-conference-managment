import type { FC } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  userName?: string;
  isAuthenticated: boolean;
  onBurgerClick: () => void;
  onLoginClick: () => void;
}

export const Header: FC<HeaderProps> = ({
  userName,
  isAuthenticated,
  onBurgerClick,
  onLoginClick,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.burger}
          onClick={onBurgerClick}
          aria-label="Open sidebar"
        >
          <span />
          <span />
          <span />
        </button>

        {isAuthenticated && userName && (
          <span className={styles.userName}>{userName}</span>
        )}
      </div>

      <div className={styles.right}>
        {!isAuthenticated && (
          <button className={styles.loginButton} onClick={onLoginClick}>
            Войти
          </button>
        )}
      </div>
    </header>
  );
};
