import mongoose from "mongoose";

const bidSchema = mongoose.Schema({
    amount: Number,
    bidder: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userName: String,
        profileImage: String,
    },
    auctionItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

}, { timeStamps: true })

export const bidModel = mongoose.model("Bid", bidSchema);