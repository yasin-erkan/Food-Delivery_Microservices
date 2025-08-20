import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { IJwtPayload } from "./types/types.ts";




// ! authenticate is a middleware that validates the jwt token
// ! if the token is valid, it sets the user in the request object
// ! if the token is invalid, it returns an error

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // reach the token
        const accessToken = req.cookies.accessToken || req.headers.authorization?.substring(7);
        if (!accessToken) {
            res.status(401).json({
                status: "error",
                message: "Token not found",
            });
            return;
        }

        // token validation if it is valid
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET) as IJwtPayload;

        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                status: "error",
                message: "Token expired",
            });
        } else {
            res.status(401).json({
                status: "error",
                message: "Token validation error",
            });
        }
    }
};

// role validation
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: "User authentication is required" });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: "You are not authorized to perform this action" });
            return;
        }

        next();
    };
};