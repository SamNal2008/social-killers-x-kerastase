const USER_ID_KEY = 'kerastase_user_id';
const USER_NAME_KEY = 'kerastase_user_name';
const USER_RESULT_ID_KEY = 'kerastase_user_result_id';

export const localStorageUtils = {

    set(key: string, value: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },

    get(key: string): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },

    remove(key: string): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    },

    setUserId(userId: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_ID_KEY, userId);
        }
    },

    getUserId(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(USER_ID_KEY);
        }
        return null;
    },

    removeUserId(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_ID_KEY);
        }
    },

    setUserName(userName: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_NAME_KEY, userName);
        }
    },

    getUserName(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(USER_NAME_KEY);
        }
        return null;
    },

    removeUserName(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_NAME_KEY);
        }
    },

    clearAllUserData(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_ID_KEY);
            localStorage.removeItem(USER_NAME_KEY);
            localStorage.removeItem(USER_RESULT_ID_KEY);
        }
    },

    hasUserId(): boolean {
        return this.getUserId() !== null;
    },

    hasUserName(): boolean {
        return this.getUserName() !== null;
    },

    setUserResultId(userResultId: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_RESULT_ID_KEY, userResultId);
        }
    },

    getUserResultId(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(USER_RESULT_ID_KEY);
        }
        return null;
    },

    removeUserResultId(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_RESULT_ID_KEY);
        }
    },

    hasUserResultId(): boolean {
        return this.getUserResultId() !== null;
    },
};
