// Shared error classes for Edge Functions

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

export class APIError extends AppError {
    constructor(message: string) {
        super(message, 'API_ERROR', 500);
    }
}

export class StorageError extends AppError {
    constructor(message: string) {
        super(message, 'STORAGE_ERROR', 500);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, 'DATABASE_ERROR', 500);
    }
}
