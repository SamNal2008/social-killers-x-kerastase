import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ProgressIndicator } from '~/shared/components/ProgressIndicator/ProgressIndicator';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { Button } from '~/shared/components/Button/Button';
import type { ResultsScreenProps } from '../types/results';
import { resultsService } from '../services/resultsService';
import type { ResultsData } from '../types/results';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const ResultsScreen: FC<ResultsScreenProps> = ({ userResultId }) => {
    const navigate = useNavigate();
    const [resultsData, setResultsData] = useState<ResultsData | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>('loading');
    const [error, setError] = useState<Error | null>(null);

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
        navigate(`/details?userResultId=${userResultId}`);
    };

    if (loadingState === 'loading') {
        return (
            <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
                <Body variant="1" className="text-neutral-gray">
                    Loading your results...
                </Body>
            </div>
        );
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
                                {resultsData.userResult.dominantTribeName}
                            </Title>
                        </motion.div>

                        <motion.div
                            variants={staggerItemVariants}
                            className="flex items-center justify-center w-full"
                        >
                            <Body variant="1" className="text-neutral-gray text-center">
                                Your unique style profile
                            </Body>
                        </motion.div>
                    </div>

                    {/* Tribe Percentages */}
                    <motion.div
                        variants={staggerItemVariants}
                        className="flex flex-col gap-6 w-full"
                    >
                        {resultsData.tribePercentages.map((tribe) => (
                            <div key={tribe.tribeId} className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <Body variant="2" className="text-neutral-dark font-medium">
                                        {tribe.tribeName}
                                    </Body>
                                    <Body variant="2" className="text-neutral-gray">
                                        {tribe.percentage}%
                                    </Body>
                                </div>
                                <div className="w-full h-2 bg-neutral-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${tribe.percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Let's Deep Dive Button */}
                    <motion.div
                        variants={staggerItemVariants}
                        className="w-full"
                    >
                        <Button
                            variant="primary"
                            className="w-full h-[52px] flex items-center justify-center"
                            onClick={handleDeepDive}
                        >
                            Let's deep dive
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
