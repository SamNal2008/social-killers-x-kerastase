import type { FC } from "react";
import { Title, Body, Caption } from "~/shared/components/Typography";

export interface PolaroidProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  currentItem?: number;
  totalItems?: number;
  className?: string;
}

export const Polaroid: FC<PolaroidProps> = ({
  imageSrc,
  imageAlt,
  title,
  subtitle = "Swipe to decide",
  currentItem,
  totalItems,
  className = "",
}) => {
  return (
    <div
      className={`
        bg-neutral-white
        rounded-lg
        p-6
        flex flex-col gap-6
        shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
        max-w-[360px]
        ${className}
      `}
    >
      <div className="aspect-[312/300] bg-neutral-gray-200 rounded overflow-hidden flex items-center justify-center">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center justify-between border-t border-neutral-white pt-2">
        <Body variant="2" className="text-neutral-gray">
          {subtitle}
        </Body>
        {currentItem !== undefined && totalItems !== undefined && (
          <Caption variant="2" className="text-neutral-dark">
            {currentItem}/{totalItems}
          </Caption>
        )}
      </div>
    </div>
  );
};
