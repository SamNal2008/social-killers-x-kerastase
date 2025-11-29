import type { FC } from "react";

export interface CardProps {
  imageSrc: string;
  imageAlt: string;
  onClick?: () => void;
  className?: string;
}

export const Card: FC<CardProps> = ({
  imageSrc,
  imageAlt,
  onClick,
  className = "",
}) => {
  const isInteractive = !!onClick;

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`
        bg-neutral-white
        rounded-lg
        overflow-hidden
        transition-all duration-200
        ${
          isInteractive
            ? "cursor-pointer hover:scale-105 hover:shadow-lg active:scale-100"
            : ""
        }
        ${className}
      `}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
