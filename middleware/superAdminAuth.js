import { userModel } from "../model/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken"
import ErrorHandler from "./error.js";

export const isSuperAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.SuperAdmin_Token;

    if (!token) {
        return next(new ErrorHandler("admin not authenticated", 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.superAdmin = await userModel.findById(decoded.id)
        next()
    } catch (error) {

        return next(new ErrorHandler("Token invalid or expired", 401))
    }
})


export const isSuperAdminAuthorized = (...roles) => {
    try {
        return (req, res, next) => {
            if (!roles.includes(req.superAdmin?.role)) {
                return next(new ErrorHandler("Unauthorized access", 403))
            }
            next()
        }
    } catch (error) {
        return next(new ErrorHandler("Unauthorized access" || error.userModel, 403))
    }
}