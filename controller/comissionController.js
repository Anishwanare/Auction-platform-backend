import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js"
import ErrorHandler from "../middleware/error.js"
import { paymentProofModel } from "../model/commisionProofSchema.js"
import { userModel } from "../model/userSchema.js"
import { auctionModel } from "../model/auctionSchema.js"
import { v2 as cloudinary } from "cloudinary"
import mongoose from "mongoose"



export const calculateCommission = async (auctionId) => {
    const auction = await auctionModel.findById(auctionId)
    if (!mongoose.Types.ObjectId.isValid(auction)) {
        return next(new ErrorHandler("Invalid auction", 400))
    }
    const commissionRate = 0.05;
    const commission = auction.currentBid * commissionRate;
    const user = await userModel.findById(auction.createdBy)

    return commission;

};

export const proofCommission = catchAsyncErrors(async (req, res, next) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Proof of Commission is required", 400))
    }

    const { proof } = req.files

    const allowedFormats = ["image/png", "image/jpeg", "image/jpg"]
    if (!allowedFormats.includes(proof.mimetype)) {
        return next(new ErrorHandler("Unsupported Image Format", 400))
    }

    const { amount, comment } = req.body;

    const user = await userModel.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    if (!amount) {
        return next(new ErrorHandler("Please enter amount", 400))
    }

    if (user.unpaidCommission === 0) {
        return res.status(200).json({
            status: true,
            message: "No Unpaid Commission remain",
        })
    }

    if (user.unpaidCommission < amount) {
        return next(new ErrorHandler(`Amount can't be more than ₹${user.unpaidCommission}`, 400))

    }

    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
            proof.tempFilePath,
            { folder: "Auction Payment Proof" }
        )

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error("Cloudinary error: ", cloudinaryResponse.error || "Cloudinary internal server error")
            return next(new ErrorHandler(cloudinaryResponse.error || "failed to upload payment proof, try again!", 400))
        }

        const proofPayement = await paymentProofModel.create({
            userId: req.user._id,
            proof: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            status: "Pending",
            amount,
            comment,
        })

        res.status(200).json({
            success: true,
            message: "Proof of Commission uploaded successfully, we will review your proof in 24 hours.",
            proofPayement,
        })

    } catch (error) {
        return next(new ErrorHandler("Failed to upload proof, Try again!", 400))
    }
})


