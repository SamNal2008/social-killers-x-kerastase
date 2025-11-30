export type ButtonVariant = "primary" | "secondary" | "tertiary" | "disabled";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}
