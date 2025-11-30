import type { FC } from "react";

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  icon?: React.ReactNode;
}

export const Badge: FC<BadgeProps> = ({
  children,
  className = "",
  onClick,
  selected = false,
  icon,
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
        flex items-center gap-2
        ${
          selected
            ? "bg-neutral-dark text-neutral-white border-neutral-dark"
            : "bg-transparent text-neutral-dark border-neutral-gray-200"
        }
        ${
          isInteractive
            ? "cursor-pointer hover:border-neutral-dark hover:bg-neutral-dark/10 active:bg-neutral-dark/20"
            : "cursor-default"
        }
        ${className}
      `}
    >
      {selected && icon}
      {children}
    </button>
  );
};
