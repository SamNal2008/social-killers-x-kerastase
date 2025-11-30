import type { FC } from "react";
import type { ButtonProps } from "./types";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-neutral-dark text-neutral-white font-['Inter'] font-normal text-[14px] leading-[normal] px-[20px] py-[8px] rounded-[8px] cursor-pointer transition-all duration-150 ease-out hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "bg-transparent text-neutral-dark font-['Inter'] font-normal text-[14px] leading-[normal] border-[0.5px] border-solid border-primary px-[20px] py-[8px] rounded-[8px] cursor-pointer transition-all duration-150 ease-out hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]",
  tertiary:
    "bg-transparent text-neutral-dark font-['Inter'] font-medium text-[12px] leading-[normal] px-0 py-[4px] flex items-center gap-[4px] cursor-pointer transition-all duration-120 ease-out hover:opacity-70 active:opacity-50",
  disabled:
    "bg-neutral-gray text-neutral-white font-['Inter'] font-normal text-[14px] leading-[normal] px-[20px] py-[8px] rounded-[8px] cursor-not-allowed opacity-50 transition-all duration-200",
};

export const Button: FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const effectiveVariant = disabled ? "disabled" : variant;
  const styles = variantStyles[effectiveVariant];

  return (
    <button
      className={`${styles} ${className}`}
      disabled={disabled || variant === "disabled"}
      {...props}
    >
      {children}
    </button>
  );
};
