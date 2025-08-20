import type { IJwtPayload } from "../types/types";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB_ORDER_URI: string;
            PORT: string;
            RABBITMQ_URI: string;
            JWT_SECRET: string;
            JWT_REFRESH_SECRET: string;
            RATE_LIMIT_WINDOW_MS: string;
            RATE_LIMIT_MAX: string;
            CLIENT_URL?: string;


        }
    }
    namespace Express {
        interface Request {
            user?: IJwtPayload;
        }
    }
}


export { };