import authService from "./auth.service.ts";
import catchAsync from "./utils/index.ts";
import { addressSchema, loginSchema, registerSchema, validateDto } from "./auth.dto.ts";



class AuthController {

    register = catchAsync(async (req, res, next) => {
        //checking the data coming from the client with ZOD
        const body = await validateDto(registerSchema, req.body)
        //!  do double check in the service layer
        const result = await authService.register(body)

        //declare cookie
        res.cookie("refreshToken", result.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        res.cookie("accessToken", result.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
        });

        // send response to the client
        res.status(201).json({ message: "user created successfully", result })
    })

    // ! login user
    login = catchAsync(async (req, res, next) => {
        const body = await validateDto(loginSchema, req.body)

        const result = await authService.login(body)

        //declare cookie BEFORE sending response
        res.cookie("refreshToken", result.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        res.cookie("accessToken", result.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
        });

        res.status(201).json({ message: 'user logged in !', result });
    })

    // ! refresh access token
    refresh = catchAsync(async (req, res, next) => {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }


        const result = await authService.refresh(refreshToken)

        //send refresh token to the service layer
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
        })
        res.status(201).json({ message: 'access token refreshed !', result })
    })

    // ! logout user
    logout = catchAsync(async (req, res, next) => {
        res.clearCookie("refreshToken")
        res.clearCookie("accessToken")
        res.status(201).json({ message: 'user logged out !' })
    })

    // ! get user profile
    getProfile = catchAsync(async (req, res, next) => {
        res.status(201).json({ message: 'user logged in !', user: req.user })
    })

    // ! add address
    addAddress = catchAsync(async (req, res, next) => {
        const body = await validateDto(addressSchema, req.body);

        const result = await authService.addAddress(req.user._id, body);

        res.status(201).json({ message: 'address added successfully', result })
    })
}


export default new AuthController();