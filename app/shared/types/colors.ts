export const colors = {
  primary: "#C9A961",
  neutral: {
    dark: "#101828",
    white: "#FFFFFF",
    gray: "#6A7282",
    "gray-200": "#D9DBE1",
  },
  surface: {
    light: "#F9FAFB",
  },
  feedback: {
    success: "#0E9F6E",
    error: "#E5484D",
  },
} as const;

export type ColorToken =
  | "primary"
  | "neutral-dark"
  | "neutral-white"
  | "neutral-gray"
  | "neutral-gray-200"
  | "surface-light"
  | "feedback-success"
  | "feedback-error";

export type ColorValue = string;
