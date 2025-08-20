declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB_AUTH_URI: string;
            PORT: string;
            RABBITMQ_URI: string;
            PORT: string;
            JWT_SECRET: string;
            JWT_REFRESH_SECRET: string;
            RATE_LIMIT_WINDOW_MS: string;
            RATE_LIMIT_MAX: string;


        }
    }
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: UserRole;
                iat: number;
                exp: number;
            };
        }
    }
}


export { };