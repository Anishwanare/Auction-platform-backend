import mongoose from "mongoose";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { auctionModel } from "../model/auctionSchema.js";
import { bidModel } from "../model/bidSchema.js";
import { userModel } from "../model/userSchema.js";

// place bid for item
export const placeItemBid = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    
    if (!id) {
        return next(new ErrorHandler("Auction Item ID is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Auction Item ID", 400));
    }

    // find auction item by id
    const auctionItem = await auctionModel.findById(id);
    if (!auctionItem) {
        return next(new ErrorHandler("Auction Item not found", 404));
    }

    // enter bids for this item
    const { amount } = req.body;

    if (!amount) {
        return next(new ErrorHandler("Bid amount is required", 400));
    }

    if (amount <= 0) {
        return next(new ErrorHandler("Bid amount should be positive", 400));
    }

    if (amount <= auctionItem.currentBid) {
        return next(
            new ErrorHandler(`Bid amount should be higher than current bid.`, 400)
        );
    }

    if (amount <= auctionItem.startingBid) {
        return next(
            new ErrorHandler(
                `Bid amount should be higher than starting bid: ${auctionItem.startingBid}`,
                400
            )
        );
    }

    try {
        // Check if the user has already placed a bid for this auction item
        const existingBid = await bidModel.findOne({
            "bidder.id": req.user._id, // comparing bidder id with login user id
            auctionItem: auctionItem._id,
        });

        // Does this user have a bid for this item in auctionModel
        const existingBidInAuction = auctionItem.bids.find(
            (bid) => bid.userId.toString() === req.user._id.toString()
        );

        if (existingBid && existingBidInAuction) {
            // Update existing bid in both bidModel and auctionItem
            existingBidInAuction.amount = amount;
            existingBid.amount = amount;

            await existingBid.save({ validateBeforeSave: true, runValidators: true });
        } else {
            // If it's a new bid, create it in both models
            const bidderDetails = await userModel.findById(req.user._id);
            const bid = await bidModel.create({
                amount,
                bidder: {
                    id: bidderDetails._id,
                    userName: bidderDetails.userName,
                    profileImage: bidderDetails.profileImage?.url,
                },
                auctionItem: auctionItem._id,
            });

            auctionItem.bids.push({
                userId: req.user._id,
                userName: bidderDetails.userName,
                profileImage: bidderDetails.profileImage?.url,
                amount,
            });
        }

        // Update the current bid on the auction item
        auctionItem.currentBid = amount;

        // Save the auction item
        await auctionItem.save({ validateBeforeSave: true, runValidators: true });

        const currentBid = auctionItem.currentBid;

        res.status(200).json({
            success: true,
            message: `Bid placed successfully for ${currentBid}`,
            currentBid,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error" || error.message,
            error: error.message,
        });
    }
});
