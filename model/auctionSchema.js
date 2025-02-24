import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    startingBid: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    condition: {
        type: String,
        enum: ["New", "Used", "Refurbished"],
        required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    itemImage: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bids: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
            userName: String,
            profileImage: String,
            amount: Number,
        },
    ],
    highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    commissionCalculated: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const auctionModel = mongoose.model('Auction', auctionSchema)
