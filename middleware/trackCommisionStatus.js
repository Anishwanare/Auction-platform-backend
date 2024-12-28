import { catchAsyncErrors } from "./catchAsyncErrors.js";
import { userModel } from "../model/userSchema.js"
import ErrorHandler from "./error.js";

export const trackCommisionStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const userCommision = await userModel.findById(req.user._id)
        if (!userCommision) {
            return next(new ErrorHandler("User not found", 404))
        }

        if (userCommision?.unpaidCommission > 0) {
            return next(new ErrorHandler("Pay remaining commission before adding new auction item!", 404))
        }
        next();
    } catch (error) {
        return next(new ErrorHandler("Error while adding new auction item!", error))
    }
})