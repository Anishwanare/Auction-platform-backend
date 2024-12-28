import mongoose from "mongoose";

const contactSchema = mongoose.Schema(
    {
        name: { type: String },
        email: { type: String },
        message: { type: String }, 
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const contactModel = mongoose.model('Contact-messages', contactSchema);
