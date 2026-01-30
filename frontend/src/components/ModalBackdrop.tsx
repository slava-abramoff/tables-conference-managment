import { ReactNode } from "react";

/**
 * Полупрозрачный фон для модальных окон.
 * Используйте этот компонент для всех модалок, чтобы контент под ними
 * оставался видимым (затемнённым), а не перекрывался чёрным экраном.
 * Класс bg-black/50 = чёрный с 50% прозрачностью.
 */
interface ModalBackdropProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ModalBackdrop({
  children,
  onClick,
  className = "",
}: ModalBackdropProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
