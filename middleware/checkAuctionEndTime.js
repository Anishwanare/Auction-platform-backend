import mongoose from "mongoose";
import { auctionModel } from "../model/auctionSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";

export const checkAuctionEndTime = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Validate auction ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid auction ID", 400));
    }

    try {
        // Find the auction by ID
        const auction = await auctionModel.findById(id);
        if (!auction) {
            return next(new ErrorHandler("Auction not found", 404));
        }

        // Check if the auction has not started yet
        if (new Date(auction.startTime) > new Date()) {
            return next(new ErrorHandler("Auction has not started yet", 400));
        }

        // Check if the auction has ended
        if (new Date(auction.endTime) < new Date()) {
            return next(new ErrorHandler("Auction has already ended", 400));
        }

        // Proceed if auction is active
        next();
    } catch (error) {
        // Handle server errors
        return next(new ErrorHandler(error.message || "Server error", 500));
    }
});
