import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import { auctionModel } from "../model/auctionSchema.js";
import { userModel } from "../model/userSchema.js";
import { bidModel } from "../model/bidSchema.js";
import ErrorHandler from "../middleware/error.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { request } from "express";

// auctioneer will create a new item
export const addNewAuctionItem = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Auction Item Image is required", 400));
    }

    const { itemImage } = req.files;

    const allowedFormats = ["image/jpg", "image/png", "image/jpeg", "image/webp"];

    // Validate profile image format
    if (!allowedFormats.includes(itemImage.mimetype)) {
        return next(new ErrorHandler("Unsupported Image Format", 400));
    }

    const {
        title,
        description,
        category,
        startingBid,
        startTime,
        endTime,
        condition,
    } = req.body;

    if (
        !title ||
        !description ||
        !category ||
        !startingBid ||
        !startTime ||
        !endTime ||
        !condition
    ) {
        return next(new ErrorHandler("Auction Item details are missing", 400));
    }

    //we have startTime in string format with the use of new Date we converted into Date
    if (new Date(startTime) < Date.now()) {
        return next(
            new ErrorHandler(
                "Auction start time should be greater than Present Time",
                400
            )
        );
    }

    if (new Date(startTime) >= new Date(endTime)) {
        return next(
            new ErrorHandler(
                "Auction start time should be less than ending time",
                400
            )
        );
    }

    // countDocuments will count the number of documents
    // Check if user already has 2 or more active auction items
    const activeAuctions = await auctionModel.countDocuments({
        createdBy: req.user._id,
        endTime: { $gt: new Date() }, // Only count auctions that haven't ended yet
    });

    // no. of auction from env file
    const numberOfAuctions = parseInt(process.env.NUMBER_OF_AUCTIONS, 10);

    try {
        //process.env.NUMBER_OF_AUCTIONS is into string we have to convert into a number
        if (activeAuctions >= numberOfAuctions) {
            return next(
                new ErrorHandler(
                    `You already have ${activeAuctions} active auctions. Limit is ${numberOfAuctions}.`,
                    400
                )
            );
        }

        // Upload image to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(
            itemImage.tempFilePath,
            { folder: "Auction_items" }
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error(
                "cloudinary error:",
                cloudinaryResponse.error || "cloudinary internal server error"
            );
            return next(
                new ErrorHandler("Error while uploading auction item image", 400)
            );
        }

        const auctionItem = await auctionModel.create({
            title,
            description,
            category,
            startingBid,
            startTime,
            endTime,
            condition,
            itemImage: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            createdBy: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: `Auction Item added successfully and will be visible at ${startTime}`,
            auctionItem,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: "Failed to create Auction",
            error: error.message,
        });
    }
});

// auctions items will be fetched for all
export const getAllAuctionItems = catchAsyncErrors(async (req, res, next) => {
    try {
        const auctionItems = await auctionModel.find({});
        return res.status(200).json({
            success: true,
            message: "Auction Items fetched successfully",
            auctionItems,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch auction items",
            error: error.message,
        });
    }
});
  
//fetch my auction item
export const getMyAuctionItem = catchAsyncErrors(async (req, res, next) => {
    try {
        const auctionItems = await auctionModel.find({ createdBy: req.user._id });
        return res.status(200).json({
            success: true,
            message: `${req.user.userName} your auction Items fetched successfully`,
            myAuctionItems: auctionItems.length > 0 ? auctionItems : "Items not found",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch auction items",
            error: error.message,
        });
    }
});

//specific item details will be fetched
export const getAuctionDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ErrorHandler("Auction ID is required", 400));
    }

    // Validate if the provided ID is a valid MongoDB Object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Auction ID", 400));
    }

    try {
        const auctionItem = await auctionModel.findById(id);
        if (!auctionItem) {
            return next(new ErrorHandler("Auction Item not found", 404));
        }

        // sort bidder according to bid
        const bidders = auctionItem.bids.sort((a, b) => b.bid - a.bid);

        return res.status(200).json({
            success: true,
            message: "Auction Item fetched successfully",
            auctionItem,
            bidders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch auction item",
            error: error.message,
        });
    }
});

//created auctioneer will remove its item only
export const removeAuctionItem = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Check if the auction ID is provided
    if (!id) {
        return next(new ErrorHandler("Auction ID is required", 400));
    }

    // Validate if the provided ID is a valid MongoDB Object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Auction ID", 400));
    }

    try {
        // Find the auction item by ID
        const auctionItem = await auctionModel.findById(id);

        // Check if the auction item exists
        if (!auctionItem) {
            return next(new ErrorHandler("Auction Item not found", 404));
        }


        // Check if the logged-in user is the one who created the auction
        if (auctionItem.createdBy.toString() !== req.user._id.toString()) {
            return next(
                new ErrorHandler("You are not authorized to delete this auction", 403)
            );
        }

        // Delete the auction item
        await auctionItem.deleteOne();

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Auction Item deleted successfully",
        });
    } catch (error) {
        // Handle any server error
        return res.status(500).json({
            success: false,
            message: "Failed to delete Auction Item",
            error: error.message,
        });
    }
});

//auctioneer will update the time of item only
export const republishAuctionItem = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { startTime, endTime } = req.body;

        // Validate auction ID format
        if (!mongoose.Types.ObjectId.isValid(id) || !id) {
            return next(new ErrorHandler("Invalid Auction ID", 400));
        }

        // Find the auction item by ID
        const republishItem = await auctionModel.findById(id);

        if (!republishItem) {
            return next(new ErrorHandler("Auction Item not found", 404));
        }

        // Check if startTime and endTime are provided
        if (!startTime || !endTime) {
            return next(
                new ErrorHandler("Start time and end time are required", 400)
            );
        }

        // Validate endTime to check if the auction is already available
        if (new Date(republishItem.endTime) >= Date.now()) {
            return next(new ErrorHandler("Auction Item is already active!", 400));
        }

        // Validate the new startTime and endTime
        const newStartTime = new Date(startTime);
        const newEndTime = new Date(endTime);

        if (newStartTime < Date.now()) {
            return next(
                new ErrorHandler("Auction start time must be in the future", 400)
            );
        }

        if (newStartTime >= newEndTime) {
            return next(
                new ErrorHandler(
                    "Auction start time must be earlier than end time",
                    400
                )
            );
        }

        // Check if the logged-in user is the one who created the auction
        if (republishItem.createdBy.toString() !== req.user._id.toString()) {
            return next(
                new ErrorHandler(
                    "You are not authorized to republish this auction",
                    403
                )
            );
        }


        if (republishItem.highestBidder) {
            const highestBidder = await userModel.findById(
                republishItem.highestBidder
            );
            highestBidder.moneySpend -= republishItem.currentBid;
            highestBidder.auctionWon -= 1;
            highestBidder.save();
        }

        // Update start and end time
        republishItem.startTime = newStartTime;
        republishItem.endTime = newEndTime;
        republishItem.currentBid = 0;
        republishItem.highestBidder = null;
        republishItem.bids = [];
        republishItem.commissionCalculated = 0;

        // remove all bids related to this id
        await bidModel.deleteMany({ republishItem: republishItem._id });

        //update the auctioneer commission
        let createdBy = await userModel.findByIdAndUpdate(
            req.user._id,
            { unpaidCommission: 0 },
            { new: true, runValidators: true }
        );
        await createdBy.save({
            validateBeforeSave: true,
            new: true,
            runValidators: true,
        });

        // Save the updated auction item
        await republishItem.save({
            validateBeforeSave: true,
            new: true,
            runValidators: true,
        });

        return res.status(200).json({
            success: true,
            message: `${req.user.userName}, your Auction Item was republished successfully will be published on ${republishItem.startTime}`,
            republishItem,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update auction item",
            error: error.message,
            created_By,
        });
    }
});

export const updateMyAuctionItemDetails = catchAsyncErrors(
    async (req, res, next) => {
        const { title, description } = req.body;

        // Find the auction item created by the user
        const auctionItem = await auctionModel.findOne({ createdBy: req.user._id });

        if (!auctionItem) {
            return next(new ErrorHandler("Auction item not found", 404));
        }

        try {
            // Update only the fields that are provided
            if (title) auctionItem.title = title;
            if (description) auctionItem.description = description;

            // Save the updated auction item
            await auctionItem.save();

            res.status(200).json({
                success: true,
                message: "Auction item details updated successfully",
                data: auctionItem,
            });
        } catch (error) {
            return next(
                new ErrorHandler("Something went wrong, please try again!", 400)
            );
        }
    }
);
