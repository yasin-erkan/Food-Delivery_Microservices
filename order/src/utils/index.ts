import type { NextFunction, Request, RequestHandler, Response } from "express"
import type { RouteParams } from "../types/types.ts"


const catchAsync = (fn: RouteParams): RequestHandler => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

export default catchAsync;