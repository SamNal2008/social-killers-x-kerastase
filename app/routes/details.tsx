import type { FC } from 'react';
import { useSearchParams } from 'react-router';
import { DetailsScreen } from '~/features/subculture-details/components/DetailsScreen';

const DetailsRoute: FC = () => {
  const [searchParams] = useSearchParams();
  // Use mock ID for development if no userResultId is provided
  const userResultId = searchParams.get('userResultId') || 'mock-user-result-id';

  return <DetailsScreen userResultId={userResultId} />;
};

export default DetailsRoute;
