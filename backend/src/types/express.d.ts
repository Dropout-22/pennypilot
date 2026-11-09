
export interface AuthenticatedUser {
    userId: string;
    sessionId: string;
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthenticatedUser;
        }
    }
}

export {};
