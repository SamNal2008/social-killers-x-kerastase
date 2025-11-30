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
  const hasError = error !== null && error !== undefined;
  return (
    <div className="w-full">
      <input
        className={`
          w-full
          h-14
          font-inter text-body-1
          text-neutral-dark
          placeholder:text-neutral-gray-200
          border-0 border-b-[1.5px] border-solid border-neutral-gray-200
          bg-transparent
          px-0 py-4
          transition-all duration-300 ease-out
          focus:outline-none focus:border-primary focus:border-b-2
          disabled:text-neutral-gray disabled:cursor-not-allowed
          ${hasError ? "border-feedback-error" : ""}
          ${className}
        `}
        {...props}
      />
      {hasError ? (
        <p className="text-feedback-error text-body-2 mt-1">{error}</p>
      ) : null}
    </div>
  );
};
