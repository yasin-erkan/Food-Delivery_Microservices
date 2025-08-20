import type { NextFunction, Request, Response } from "express";
import type { Document, Schema } from "mongoose";


type RouteParams = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type { RouteParams };

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

export interface IOpeningHours {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

//restaurant types
export interface IRestaurant extends Document {

    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    categories: string[];
    deliveryTime: number;
    deliveryFee: number;
    minOrder: number;
    rating: number;
    isActive: boolean;
    isOpen: boolean;
    ownerId: string;
    openingHours: IOpeningHours;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMenuItem extends Document {
    restaurantId: Schema.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    ingredients: string[];
    allergens: string[];
    isVegetarian: boolean;
    isAvailable: boolean;
    preparationTime: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}