import type { FC } from "react";
import type { BodyProps } from "~/shared/types/typography";

const variantStyles: Record<BodyProps["variant"], string> = {
  "1": "font-inter text-body-1",
  "2": "font-inter text-body-2",
};

export const Body: FC<BodyProps> = ({
  variant,
  children,
  className = "",
  as = "p",
}) => {
  const Component = as;
  const styles = variantStyles[variant];

  return <Component className={`${styles} ${className}`}>{children}</Component>;
};
