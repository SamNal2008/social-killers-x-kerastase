import type { FC } from "react";
import type { CaptionProps } from "~/shared/types/typography";

const variantStyles: Record<CaptionProps["variant"], string> = {
  "1": "font-['Inter'] font-semibold text-[10px] leading-[100%] tracking-[2px] uppercase",
  "2": "font-['Inter'] font-medium text-[12px] leading-[100%]",
};

export const Caption: FC<CaptionProps> = ({
  variant,
  children,
  className = "",
  as = "span",
}) => {
  const Component = as;
  const styles = variantStyles[variant];

  return <Component className={`${styles} ${className}`}>{children}</Component>;
};
