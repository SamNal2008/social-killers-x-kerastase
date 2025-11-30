import type { PageType } from '~/onboarding/types';
import { localStorageUtils } from '~/shared/utils/localStorage';
import { useEffect, useState } from 'react';

const CURRENT_PAGE_KEY = 'kerastase_current_page';

// Define page order for navigation logic
const PAGE_ORDER: PageType[] = ['WelcomePage', 'NamePage', 'KeywordPage', 'TinderPage', 'Step4Page'];

export const useStepStore = () => {
    const [currentPage, setCurrentPage] = useState<PageType>('WelcomePage');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorageUtils.set(CURRENT_PAGE_KEY, currentPage);
        }
        if (!currentPage) {
            localStorageUtils.remove(CURRENT_PAGE_KEY);
            localStorageUtils.clearAllUserData();
        }
    }, [currentPage]);

    return {
        currentPage,
        getCurrentPage: () => currentPage,
        setCurrentPage: (page: PageType) => setCurrentPage(page),
        goToNextPage: () => {
            const currentIndex = PAGE_ORDER.indexOf(currentPage);
            const nextIndex = currentIndex + 1;
            if (nextIndex < PAGE_ORDER.length) {
                setCurrentPage(PAGE_ORDER[nextIndex]);
            }
        },
        goToPreviousPage: () => {
            const currentIndex = PAGE_ORDER.indexOf(currentPage);
            const prevIndex = currentIndex - 1;
            if (prevIndex >= 0) {
                setCurrentPage(PAGE_ORDER[prevIndex]);
            }
        },
        goToPage: (page: PageType) => setCurrentPage(page),
        reset: () => setCurrentPage('WelcomePage'),
        getPageNumber: (page: PageType) => PAGE_ORDER.indexOf(page) + 1,
        determineInitialPage: () => {
            const hasUserId = localStorageUtils.hasUserId();
            const hasUserName = localStorageUtils.hasUserName();

            if (!hasUserId) {
                return 'WelcomePage';
            }

            if (hasUserId && !hasUserName) {
                return 'NamePage';
            }

            // If user has both ID and name, go to next step
            return 'Step2Page';
        },
    };
};
