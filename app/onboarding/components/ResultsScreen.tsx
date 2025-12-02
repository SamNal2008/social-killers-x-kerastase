import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { ProgressIndicator } from '~/shared/components/ProgressIndicator/ProgressIndicator';
import { Title } from "~/shared/components/Typography/Title";
import { Body } from "~/shared/components/Typography/Body";
import { Caption } from "~/shared/components/Typography/Caption";
import { Button } from '~/shared/components/Button/Button';
import type { ResultsScreenProps } from '../types/results';
import { resultsService } from '../services/resultsService';
import type { ResultsData } from '../types/results';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';
import { ResultsScreenSkeleton } from './ResultsScreenSkeleton';
import { useMinimumLoadingTime } from '~/shared/hooks/useMinimumLoadingTime';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const ResultsScreen: FC<ResultsScreenProps> = ({ userResultId }) => {
    const navigate = useNavigate();
    const [resultsData, setResultsData] = useState<ResultsData | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>('loading');
    const [error, setError] = useState<Error | null>(null);
    const [isNavigating, setIsNavigating] = useState<boolean>(false);

    // Use minimum loading time hook to prevent flickering
    const shouldShowLoading = useMinimumLoadingTime(loadingState === 'loading', 500);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoadingState('loading');
                const data = await resultsService.fetchUserResult(userResultId);
                setResultsData(data);
                setLoadingState('success');
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load results'));
                setLoadingState('error');
            }
        };

        fetchResults();
    }, [userResultId]);

    const handleDeepDive = () => {
        setIsNavigating(true);
        navigate(`/details?userResultId=${userResultId}`);
    };

    if (shouldShowLoading) {
        return <ResultsScreenSkeleton />;
    }

    if (loadingState === 'error') {
        return (
            <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
                <div className="flex flex-col gap-4 items-center">
                    <Body variant="1" className="text-red-600">
                        Error loading results
                    </Body>
                    {error && (
                        <Body variant="2" className="text-neutral-gray">
                            {error.message}
                        </Body>
                    )}
                </div>
            </div>
        );
    }

    if (!resultsData) {
        return null;
    }

    return (
        <div className="bg-surface-light min-h-screen p-6 md:p-8">
            <motion.div
                className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header with Progress */}
                <motion.div variants={staggerItemVariants}>
                    <ProgressIndicator
                        currentStep={4}
                        totalSteps={4}
                        label="Kérastase Experience"
                    />
                </motion.div>

                {/* Main Content */}
                <div className="flex flex-col gap-12 w-full">
                    {/* Heading Section */}
                    <div className="flex flex-col gap-6 w-full">
                        <motion.div
                            variants={staggerItemVariants}
                            className="flex flex-col items-center justify-center w-full"
                        >
                            <Title
                                variant="h1"
                                className="text-neutral-dark text-center"
                            >
                                Your subculture matches
                            </Title>
                        </motion.div>

                        <motion.div
                            variants={staggerItemVariants}
                            className="flex items-center justify-center w-full"
                        >
                            <Body variant="1" className="text-neutral-gray text-center max-w-md">
                                Based on your choices, you resonate most with these energies.
                            </Body>
                        </motion.div>
                    </div>

                    {/* Subculture Percentages (Top 3) */}
                    <motion.div
                        variants={staggerItemVariants}
                        className="flex flex-col gap-8 w-full"
                    >
                        {(resultsData.subculturePercentages || [])
                            .sort((a, b) => b.percentage - a.percentage)
                            .slice(0, 3)
                            .map((subculture, index) => {
                                const isFirst = index === 0;
                                const isSecond = index === 1;
                                const isThird = index === 2;
                                const rank = `0${index + 1}`;

                                // Ensure name is Title Case
                                const formattedName = subculture.subcultureName
                                    .toLowerCase()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');

                                return (
                                    <div key={subculture.subcultureId} className="flex flex-col gap-3">
                                        <div className="flex items-center gap-4 w-full">
                                            {/* Rank Number */}
                                            {isFirst ? (
                                                <span className="font-['Inter'] text-[16px] font-semibold leading-none text-[#C9A961]">
                                                    {rank}
                                                </span>
                                            ) : isSecond ? (
                                                <Caption
                                                    variant="2"
                                                    className="text-[#6A7282]"
                                                >
                                                    {rank}
                                                </Caption>
                                            ) : (
                                                <span className="font-['Inter'] text-[10px] font-medium leading-none text-[#6A7282]">
                                                    {rank}
                                                </span>
                                            )}

                                            <div className="flex justify-between items-end w-full">
                                                {/* Subculture Name */}
                                                <Title
                                                    variant={isFirst ? 'h1' : isSecond ? 'h2' : 'h3'}
                                                    className="text-neutral-dark !leading-none"
                                                >
                                                    {formattedName}
                                                </Title>

                                                {/* Percentage */}
                                                <span className="text-neutral-gray text-sm mb-1">
                                                    {Math.round(subculture.percentage)}% Match
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-[4px] bg-neutral-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${isFirst ? 'bg-[#C9A961]' : 'bg-[#101828]'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${subculture.percentage}%` }}
                                                transition={{ duration: 0.8, delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </motion.div>

                    {/* Let's Deep Dive Button */}
                    <motion.div
                        variants={staggerItemVariants}
                        className="w-full"
                    >
                        <Button
                            variant="primary"
                            className="w-full h-[52px] flex items-center justify-center gap-2"
                            onClick={handleDeepDive}
                            disabled={isNavigating}
                        >
                            {isNavigating && <LoaderCircle className="w-5 h-5 animate-spin" />}
                            Let's deep dive
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
