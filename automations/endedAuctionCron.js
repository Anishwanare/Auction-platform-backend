import cron from "node-cron";
import { auctionModel } from "../model/auctionSchema.js";
import { userModel } from "../model/userSchema.js";
import { calculateCommission } from "../controller/comissionController.js";
import { bidModel } from "../model/bidSchema.js";
import { sendEmail } from "../utils/email.js";
import ErrorHandler from "../middleware/error.js";

export const endedAuctionCron = () => {
    cron.schedule("*/1 * * * *", async () => {
        const now = Date.now();
        console.log("Cron job for ended auction..");

        // Find auctions where endTime is less than the current time and commission hasn't been calculated
        const endedAuctions = await auctionModel.find({
            endTime: { $lt: now }, // use $lt (less than) to check for ended auctions
            commissionCalculated: false
        });

        for (const auction of endedAuctions) {
            try {
                // Calculate commission using auction's ID
                const commissionAmount = await calculateCommission(auction._id);
                auction.commissionCalculated = true;

                // Find the highest bidder for this auction
                const highestBidder = await bidModel.findOne({
                    auctionItem: auction._id,
                    amount: auction.currentBid
                });

                if(highestBidder){
                    console.log("found highest bidder")
                }

                // Find auctioneer (the user who created the auction)
                const auctioneer = await userModel.findById(auction.createdBy);
                auctioneer.unpaidCommission = commissionAmount;

                if (highestBidder) {
                    auction.highestBidder = highestBidder.bidder.id;

                    // Save auction with the highest bidder
                    await auction.save();

                    // Find bidder and update their stats
                    const bidder = await userModel.findById(highestBidder.bidder.id);
                    await userModel.findByIdAndUpdate(
                        bidder._id,
                        {
                            $inc: {
                                moneySpend: highestBidder.amount,
                                auctionWon: 1
                            }
                        },
                        { new: true }
                    );

                    // Update auctioneer's unpaid commission
                    await userModel.findByIdAndUpdate(
                        auctioneer._id,
                        {
                            $inc: {
                                unpaidCommission: commissionAmount
                            }
                        },
                        { new: true }
                    );

                    // Prepare the email content
                    const subject = `Congratulations! You won the auction for ${auction.title}`;
                    const message = `Dear ${bidder.userName}, 

                    Congratulations! You have won the auction for "${auction.title}". 
                    
                    Before proceeding with the payment, please contact your auctioneer via their email: ${auctioneer.email}.
                    
                    Please complete your payment using one of the following methods:
                    
                    1. **Bank Transfer**: 
                       - Account Name: ${auctioneer.paymentMethods.bankTransfer.bankName}
                       - Account Number: ${auctioneer.paymentMethods.bankTransfer.accountNumber}
                       - Bank IFSC code: ${auctioneer.paymentMethods.bankTransfer.bankIFSCCode}
                    
                    2. **RazorPay**: 
                       - You can send payment via RazorPay to: ${auctioneer.paymentMethods.razorpay.razorpayAccountNumber}
                    
                    3. **PayPal**: 
                       - Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}
                    
                    4. **Cash on Delivery (COD)**: 
                       - If you prefer COD, you must pay 20% of the total amount upfront before delivery.
                       - To pay the 20% upfront, use any of the above methods.
                       - The remaining 80% will be paid upon delivery.
                       - If you wish to see the condition of your auction item, please send an email to: ${auctioneer.email}
                    
                    Please ensure your payment is completed by [Payment Due Date]. Once the payment is confirmed, the item will be shipped to you.
                    
                    Thank you for participating!
                    
                    Best regards, 
                    BidXpert Team`;

                    // Send email to the highest bidder
                    console.log("Sending email to highest bidder...");
                    await sendEmail({ email: bidder.email, subject, message });
                    console.log("Successfully sent email to highest bidder");
                } else {
                    // Just save the auction if there are no bids
                    await auction.save();
                }
            } catch (error) {
                console.error(`Error in ended auction cron for auction ${auction._id}: ${error.message}`);
                console.log(`Error in ended auction cron for auction ${auction._id}: ${error.message}`);
            }
        }
    });
};
