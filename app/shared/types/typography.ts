export type TitleVariant = "h0" | "h1" | "h2" | "h3";
export type BodyVariant = "1" | "2";
export type CaptionVariant = "1" | "2";

export interface BaseTypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export interface TitleProps extends BaseTypographyProps {
  variant: TitleVariant;
}

export interface BodyProps extends BaseTypographyProps {
  variant: BodyVariant;
}

export interface CaptionProps extends BaseTypographyProps {
  variant: CaptionVariant;
}
