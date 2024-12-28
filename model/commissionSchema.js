import mongoose from "mongoose"


//this schema in only for approved users
const commissionSchema = mongoose.Schema({
    amount: Number,
    user: mongoose.Schema.Types.ObjectId,
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timeStamps: true })

export const commissionModel = mongoose.model("Commission", commissionSchema)