import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { Title, Caption } from '~/shared/components/Typography';
import type { DashboardPolaroidProps } from '../types';
import { formatTimestamp } from '../utils/formatTimestamp';
import { useImageRotation } from '../hooks/useImageRotation';

export const DashboardPolaroid: FC<DashboardPolaroidProps> = ({
  userName,
  subcultureName,
  imageUrls,
  timestamp,
  className = '',
  onDelete,
}) => {
  const formattedTime = formatTimestamp(timestamp);
  const currentImageUrl = useImageRotation(imageUrls, 3000);

  return (
    <div
      className={`
        bg-white
        rounded-lg
        p-6
        flex flex-col gap-6
        shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
        w-[360.916px]
        ${className}
      `}
    >
      <div
        data-testid="image-container"
        className="
          bg-neutral-gray-200
          h-[367px]
          min-h-[250px]
          overflow-hidden
          flex items-center justify-center
          w-full
        "
      >
        {currentImageUrl && (
          <img
            src={currentImageUrl}
            alt={`${userName} - ${subcultureName}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-4 items-center justify-center w-full">
        <div className="flex flex-col gap-2 items-center">
          <Title variant="h2" className="text-neutral-dark text-center">
            {userName}
          </Title>
          <div
            data-testid="subculture-badge"
            className="
              bg-primary-light
              px-3
              py-1
              rounded-md
              flex items-center justify-center
            "
          >
            <Caption variant="1" className="text-primary">
              {subcultureName.toUpperCase()}
            </Caption>
          </div>
        </div>

        <div className="h-6 w-full flex items-center justify-between">
          <div className="w-6" />
          <Caption variant="2" className="text-neutral-gray-200 text-center">
            {formattedTime}
          </Caption>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="
                p-1
                rounded-full
                hover:bg-feedback-error/10
                transition-colors
                group
              "
              aria-label="Delete result"
            >
              <Trash2 className="w-4 h-4 text-neutral-gray-200 group-hover:text-feedback-error transition-colors" />
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>
      </div>
    </div>
  );
};
