import type { FC } from "react";
import type { CaptionProps } from "~/shared/types/typography";

const variantStyles: Record<CaptionProps["variant"], string> = {
  "1": "font-inter text-caption-1 tracking-caption-wide uppercase",
  "2": "font-inter text-caption-2",
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
