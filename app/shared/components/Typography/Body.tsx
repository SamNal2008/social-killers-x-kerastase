import type { FC } from "react";
import type { BodyProps } from "~/shared/types/typography";

const variantStyles: Record<BodyProps["variant"], string> = {
  "1": "font-['Inter'] font-normal text-[16px] leading-[100%]",
  "2": "font-['Inter'] font-normal text-[14px] leading-[100%]",
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
