import type { FC } from "react";

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const Badge: FC<BadgeProps> = ({
  children,
  className = "",
  onClick,
  selected = false,
}) => {
  const isInteractive = !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={`
        font-inter text-body-2
        px-6 py-3
        rounded-full
        border border-solid
        transition-all duration-200
        ${
          selected
            ? "bg-primary text-neutral-white border-primary"
            : "bg-transparent text-neutral-dark border-neutral-gray-200"
        }
        ${
          isInteractive
            ? "cursor-pointer hover:border-primary hover:bg-primary/10 active:bg-primary/20"
            : "cursor-default"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};
