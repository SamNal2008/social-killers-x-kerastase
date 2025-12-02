import type { FC } from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  animation?: 'shimmer' | 'pulse';
  'data-testid'?: string;
}

const formatDimension = (value: string | number | undefined, defaultValue: string): string => {
  if (value === undefined) return defaultValue;
  if (typeof value === 'number') return `${value}px`;
  return value;
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const Skeleton: FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  className = '',
  animation = 'shimmer',
  'data-testid': dataTestId,
}) => {
  const animationClass = animation === 'shimmer' ? 'animate-shimmer' : 'animate-pulse';
  const roundedClass = roundedClasses[rounded];

  const style = {
    width: formatDimension(width, '100%'),
    height: formatDimension(height, '1rem'),
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`bg-gray-200 ${roundedClass} ${animationClass} ${className}`}
      style={style}
      data-testid={dataTestId}
    />
  );
};
