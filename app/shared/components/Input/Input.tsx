import type { FC, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      <input
        className={`
          w-full
          h-14
          font-inter text-body-1
          text-neutral-dark
          placeholder:text-neutral-gray-200
          border-0 border-b border-solid border-neutral-gray-200
          bg-transparent
          px-0 py-4
          transition-colors duration-200
          focus:outline-none focus:border-primary
          disabled:text-neutral-gray disabled:cursor-not-allowed
          ${error ? "border-feedback-error" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-feedback-error text-body-2 mt-1">{error}</p>
      )}
    </div>
  );
};
