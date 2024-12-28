import mongoose from "mongoose";

export const databaseConnection = () => {
    mongoose.connect(process.env.MONGO_URL, {
        dbName: "Auction_wala"
    }).then(() => {
        console.log("Connected to Auction Wala MongoDB");
    }).catch((err) => {
        console.error("Failed to connect to Auction Wala MongoDB", err);
    })
}