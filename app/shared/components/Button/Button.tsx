import type { FC } from "react";
import type { ButtonProps } from "./types";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-neutral-dark text-neutral-white font-['Inter'] font-normal text-[14px] leading-[normal] px-[20px] py-[8px] rounded-[8px]",
  secondary:
    "bg-transparent text-neutral-dark font-['Inter'] font-normal text-[14px] leading-[normal] border-[0.5px] border-solid border-primary px-[20px] py-[8px] rounded-[8px]",
  tertiary:
    "bg-transparent text-neutral-dark font-['Inter'] font-medium text-[12px] leading-[normal] px-0 py-[4px] flex items-center gap-[4px]",
  disabled:
    "bg-neutral-gray text-neutral-white font-['Inter'] font-normal text-[14px] leading-[normal] px-[20px] py-[8px] rounded-[8px] cursor-not-allowed opacity-50",
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
