import type { NextFunction, Request, Response } from "express";
import type { Document } from "mongoose";




export type RouteParams = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type UserRole = 'customer' | 'restaurant_owner' | 'courier' | 'admin';

export interface IAddress {
    _id?: string;
    title: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;

}


export interface IUser extends Document {

    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    addresses: IAddress[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;

}
export interface IJwtPayload {
    userId: string;
    role: UserRole;
    iat: number;
    exp: number;

}

export interface IAuthResponse {
    status: string;
    message: string;
    data: {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            role: UserRole;
        };
        accessToken: string;
        refreshToken?: string;
    }
}

