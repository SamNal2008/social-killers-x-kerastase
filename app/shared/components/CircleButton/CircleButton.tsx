import type { FC } from "react";

export type CircleButtonVariant = "default" | "left" | "right" | "heart";

export interface CircleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CircleButtonVariant;
  icon?: React.ReactNode;
  ariaLabel: string;
}

const defaultIcons: Record<CircleButtonVariant, React.ReactNode> = {
  default: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  left: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  right: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  heart: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17.5L8.75 16.375C4.5 12.5 1.875 10.125 1.875 7.1875C1.875 4.8125 3.6875 3 6.0625 3C7.4375 3 8.75 3.625 10 4.625C11.25 3.625 12.5625 3 13.9375 3C16.3125 3 18.125 4.8125 18.125 7.1875C18.125 10.125 15.5 12.5 11.25 16.375L10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
};

export const CircleButton: FC<CircleButtonProps> = ({
  variant = "default",
  icon,
  ariaLabel,
  className = "",
  ...props
}) => {
  const displayIcon = icon || defaultIcons[variant];

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`
        w-16 h-16
        flex items-center justify-center
        rounded-full
        border border-solid border-neutral-gray-200
        bg-transparent
        text-neutral-dark
        transition-all duration-200
        hover:border-primary hover:bg-primary/10
        active:bg-primary/20
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {displayIcon}
    </button>
  );
};
