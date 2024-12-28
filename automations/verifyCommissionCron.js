import { userModel } from "../model/userSchema.js";
import { paymentProofModel } from "../model/commisionProofSchema.js";
import { commissionModel } from "../model/commissionSchema.js";
import cron from "node-cron";
import { sendEmail } from "../utils/email.js";

export const verifyCommissionCron = () => {
    cron.schedule("*/1 * * * *", async () => {
        console.log("Running verify commission cron..");

        // Fetch all approved proofs, not just one
        const approvedProofs = await paymentProofModel.find({
            status: "Approved",
        });

        // Loop through each proof
        for (const proof of approvedProofs) {
            try {
                const user = await userModel.findById(proof?.userId);
                let updatedUserData = {};
                if (user) {
                    if (user.unpaidCommission >= proof.amount) {
                        updatedUserData = await userModel.findByIdAndUpdate(
                            user._id && proof.userId,
                            {
                                $inc: {
                                    unpaidCommission: -proof.amount,
                                },
                            },
                            { new: true }
                        );
                    } else {
                        updatedUserData = await userModel.findByIdAndUpdate(
                            user._id && proof.userId,
                            {
                                unpaidCommission: 0,
                            },
                            { new: true }
                        );
                    }

                    // Update proof status to "Settled"
                    await paymentProofModel.findByIdAndUpdate(proof._id, {
                        status: "Settled",
                    });

                    // Create a new commission entry
                    await commissionModel.create({
                        amount: proof.amount,
                        user: user._id,
                    });

                    const settlementDate = new Date(Date.now())
                        .toString()
                        .substring(0, 15);

                    const subject = `Your payment has been successfully settled and verified`;
                    const message = `Dear ${user.userName},

                    We are pleased to inform you that your recent payment has been successfully verified and settled. Thank you for promptly providing the necessary proof of payment. Your account has been updated, and you can now proceed with your activities on our platform without any restrictions.

                    Payment Details:
                    Amount Settled: ${proof.amount}
                    Unpaid Amount Remaining: ${updatedUserData.unpaidCommission}
                    Date of Settlement: ${settlementDate}

                    If you have any questions or need further assistance, feel free to contact our support team.

                    Best regards,
                    BidXpert Team`;

                    // Send email to the user
                    console.log("unable to send email");
                    await sendEmail({ email: user.email, subject, message });
                    console.log("Email sent successfully");
                }

                console.log(`User ${proof.userId} paid commission of ${proof.amount}`);
            } catch (error) {
                console.error(`Error verifying commission for user ${proof.userId}: ${error.message}`);
            }
        }
    });
};

