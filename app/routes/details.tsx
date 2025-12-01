import type { FC } from 'react';
import { useSearchParams } from 'react-router';
import { DetailsScreen } from '~/features/subculture-details/components/DetailsScreen';

const DetailsRoute: FC = () => {
  const [searchParams] = useSearchParams();
  // Use mock ID for development if no userResultId is provided
  const userResultId = searchParams.get('userResultId');
  if (!userResultId) {
    throw new Error('No userResultId provided');
  }
  return <DetailsScreen userResultId={userResultId} />;
};

export default DetailsRoute;
