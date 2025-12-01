import type { FC } from 'react';
import { useSearchParams } from 'react-router';
import { DetailsScreen } from '~/features/subculture-details/components/DetailsScreen';

const DetailsRoute: FC = () => {
  const [searchParams] = useSearchParams();
  const userResultId = searchParams.get('userResultId');

  if (!userResultId) {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
        <p className="text-neutral-gray">
          Missing result ID. Please complete the onboarding process.
        </p>
      </div>
    );
  }

  return <DetailsScreen userResultId={userResultId} />;
};

export default DetailsRoute;
