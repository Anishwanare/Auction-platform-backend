import { userModel } from "../model/userSchema.js";
import jwt from "jsonwebtoken"
import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.Auctioneer_Token || req.cookies.Bidder_Token
    // console.log(req.cookies);

    if (!token) {
        return next(new ErrorHandler("User not Autheticated", 401))
    }
    try {
        //  Verify the token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Fetch the user from the database and attach it to req.user
        req.user = await userModel.findById(decoded.id)

        next()
    } catch (error) {
        next(new ErrorHandler("Token invalid or expired", 401))
    }
})


export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        try {
            // Check if the user has the required role
            if (!roles.includes(req.user?.role)) {
                return next(new ErrorHandler("You are not authorized to access this route", 401))
            }
            next(); // proceed if user is authorized
        } catch (error) {
            return next(new ErrorHandler(error.message || "internal error", 500))
        }
    }
}
