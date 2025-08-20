// middleware for JWT token validation
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { IJwtPayload } from "./types/types.ts";
import User from "./auth.model.ts";




export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // get access token from headers or cookies
        const authHeader = req.headers?.authorization;
        const accessToken = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.cookies?.accessToken;

        if (!accessToken) {
            res.status(401).json({ message: "Access token not found" });
            return;
        }
        // verify access token if it is valid or not
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as IJwtPayload;

        // get user from database
        const user = await User.findById(decoded.userId);
        console.log(user, decoded.userId);
        if (!user) {
            res.status(401).json({ message: "Invalid access token or user is not active" });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid access token" });
            return;
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "Access token expired" });
            return;
        } else {
            res.status(500).json({ message: "Token verification failed" });
            return;
        }
    };

}
