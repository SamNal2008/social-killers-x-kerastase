import type { FC } from "react";
import type { TitleProps } from "~/shared/types/typography";

const variantStyles: Record<TitleProps["variant"], string> = {
  h0: "font-crimson text-title-h0",
  h1: "font-crimson text-title-h1",
  h2: "font-crimson text-title-h2",
  h3: "font-crimson text-title-h3",
};

const variantTags: Record<TitleProps["variant"], React.ElementType> = {
  h0: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

export const Title: FC<TitleProps> = ({
  variant,
  children,
  className = "",
  as,
}) => {
  const Component = as || variantTags[variant];
  const styles = variantStyles[variant];

  return <Component className={`${styles} ${className}`}>{children}</Component>;
};
