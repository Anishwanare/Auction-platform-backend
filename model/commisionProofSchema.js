import mongoose from "mongoose";

export const commisionProofSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    proof: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Settled"],
        default: "Pending"
    },
    amount: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timeStamps: true })

export const paymentProofModel = mongoose.model('Proof', commisionProofSchema)