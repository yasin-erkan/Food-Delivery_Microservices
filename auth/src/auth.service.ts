//business logic

import jwt from "jsonwebtoken";
import type { AddressInput, LoginInput, RegisterInput } from "./auth.dto.ts";
import User from "./auth.model.ts";
import type { IAddress, IAuthResponse, IJwtPayload, IUser } from "./types/types.ts";


class AuthService {
    constructor() { }
    // token generation
    private generateTokens(user: IUser): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign({ userId: user?._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        const refreshToken = jwt.sign({ userId: user?._id }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });

        return { accessToken, refreshToken };
    }

    // !user register
    async register(userData: RegisterInput): Promise<IAuthResponse> {
        // email check
        const existingUser = await User.findOne({ email: userData.email });

        // email already exists
        if (existingUser) {
            throw new Error("Email already exists");
        }

        // create user
        const user = new User(userData);
        await user.save();

        // generate tokens
        const tokens = this.generateTokens(user);

        // prepare response for client
        return {
            status: "success",
            message: "User registered successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    // ! user login
    async login(loginData: LoginInput): Promise<IAuthResponse> {
        // email check
        const user = await User.findOne({ email: loginData.email });

        // user not found
        if (!user) {
            throw new Error("user not found");
        }

        // password check
        const isPasswordValid = await user.comparePassword(loginData.password);

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        // generate tokens
        const tokens = this.generateTokens(user);

        // prepare response for client

        return {
            status: "success",
            message: "User logged in successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }


    async refresh(refreshToken: string): Promise<{ accessToken: string }> {
        //make sure the refresh token is valid
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as IJwtPayload;

        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error("Invalid refresh token");
        }

        //generate new access token
        const token = this.generateTokens(user);

        //return the new access token
        return { accessToken: token.accessToken }
    }

    async addAddress(userId: string, addressData: AddressInput): Promise<{ status: string; message: string; data: { addresses: IAddress[] | undefined } }> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        // make other addresses not default if new address is default
        if (addressData.isDefault) {
            user?.addresses.forEach((address) => {
                address.isDefault = false;
            });
        }

        //add new address to user
        user.addresses.push(addressData as unknown as IAddress);
        await user.save();
        return {
            status: "success",
            message: "Address added successfully",
            data: { addresses: user?.addresses },
        };
    }

    async logout() {
        return 'data';
    }

    async getProfile() {
        return 'data';
    }
}
export default new AuthService();