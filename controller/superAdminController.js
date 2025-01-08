import mongoose from "mongoose";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js"
import ErrorHandler from "../middleware/error.js"
import { commissionModel } from "../model/commissionSchema.js"
import { userModel } from "../model/userSchema.js"
import { auctionModel } from "../model/auctionSchema.js"
import { paymentProofModel } from "../model/commisionProofSchema.js"
import { contactModel } from "../model/contactSchema.js"

//created auctioneer will remove its item only
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        res
            .status(200)
            .cookie("SuperAdmin_Token", "", {
                expires: new Date(Date.now()), // Expire the SuperAdmin_Token cookie
                httpOnly: true,
            })
            .json({
                success: true,
                message: `${req.superAdmin?.role} logged out successfully`,
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
})

export const getSuperAdminProfile = catchAsyncErrors(async (req, res, next) => {
    try {
        const admin = await userModel.findById(req.superAdmin._id)
        if (!admin) {
            return next(new ErrorHandler("Super-Admin not found!", 404))
        }
        return res.status(200).json({
            success: true,
            message: `${req.superAdmin?.userName} Welcome`,
            admin
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
})


export const delteAuctionItem = catchAsyncErrors(async (req, res, next) => {
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
        const auctionItem = await auctionModel.findById(id);

        if (!auctionItem) {
            return next(new ErrorHandler("Auction Item not found", 404));
        }

        // Delete the auction item
        await auctionItem.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Auction Item deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete Auction Item",
            error: error.message,
        });
    }
});

export const getAllPaymentsProof = catchAsyncErrors(async (req, res, next) => {
    try {
        const getAllPaymentsProof = await paymentProofModel.find({})
        return res.status(200).json({
            success: true,
            message: "successfully found all payments",
            getAllPaymentsProof
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to find all payments",
            error: error.message
        })
    }

})

//auctioneer payment proof
export const getPaymentProofDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid ID", 400))
    }

    try {
        const paymentProofDetails = await paymentProofModel.findById(id)

        if (!paymentProofDetails) {
            return next(new ErrorHandler("Payment proof not found", 404))
        }

        return res.status(200).json({
            success: true,
            message: "Payment proof details found successfully",
            paymentProofDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve messages.",
            error: error.message,
        });
    }
})

export const updatePaymentProof = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { status, amount } = req.body;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid ID", 400));
    }

    // Validate required fields
    if (!status || amount == null) {
        return next(new ErrorHandler("Status and Amount are required", 400));
    }

    try {
        // Find and update the payment proof
        const updatedProof = await paymentProofModel.findByIdAndUpdate(
            id,
            { status, amount },
            { new: true, runValidators: true }
        );

        // Check if payment proof exists
        if (!updatedProof) {
            return next(new ErrorHandler("Payment proof not found", 404));
        }

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Payment proof updated successfully",
            updatedProof
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server error.",
            error: error.message,
        });
    }
});

export const deletePaymentProof = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid ID", 400));
    }

    try {
        let proof = await paymentProofModel.findById(id);
        if (!proof) {
            return next(new ErrorHandler("Payment proof not id found", 404));
        }
        await proof.deleteOne();
        res.status(200).json({
            success: true,
            message: "Payment proof deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
})

//just fetching all users and will sort a/c to role
export const fetchAllUsers = catchAsyncErrors(async (req, res, next) => {
    try {
        const users = await userModel.find({})

        const Bidders = users.filter((bidder) => bidder.role === "Bidder")
        const Auctioneers = users.filter((auctioneer) => auctioneer.role === "Auctioneer")

        return res.status(200).json({
            success: true,
            message: users?.length > 0 ? `${users.length} uses fetch successfully` : "No users found",
            users,
            Bidders,
            Auctioneers
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to fetch all users",
            error: error.message
        })
    }
})

// delete user
export const deleteUsers = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id ) {
            return next(new ErrorHandler('Id not found', 404))
        }
        let deleteUser = await userModel.findById(id)

        if (!deleteUser) {
            return next(new ErrorHandler(`${deleteUser} not found`, 400))
        }
        await deleteUser.deleteOne()
        return res.status(200).json({
            success: true,
            message: `${deleteUser.userName} Deleted Successfully`,
            deleteUser
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        })
    }

})

export const fetchAllAuctionItems = catchAsyncErrors(async (req, res, next) => {
    try {
        const auctionItems = await auctionModel.find({})
        return res.status(200).json({
            success: true,
            message: auctionItems?.length > 0 ? `${auctionItems.length} auction items fetched successfully` : "No auction items found",
            auctionItems
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to fetch all auction items",
            error: error.message
        })
    }
})

// monthly revenue
export const monthlyRevenue = catchAsyncErrors(async (req, res, next) => {
    try {
        const payments = await commissionModel.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    totalAmount: { $sum: "$amount" },
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        const transformDataToMonthlyArray = (payments, totalMonth = 12) => {
            const result = Array(totalMonth);

            payments.forEach((payment) => {
                result[payment._id.month - 1] = payment.totalAmount;
            });

            return result;
        };

        const totalMonthlyRevenue = transformDataToMonthlyArray(payments);

        return res.status(200).json({
            success: true,
            message: "Monthly Revenue fetched successfully",
            totalMonthlyRevenue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve Monthly revenue.",
            error: error.message,
        });
    }
});


// contact us
export const message = catchAsyncErrors(async (req, res, next) => {
    const { name, email, message } = req.body;

    try {
        const newMessage = await contactModel.create({
            name,
            email,
            message
        })

        if (!name || !email || !message) {
            return next(new ErrorHandler("Fill full form.", 400))
        }

        return res.status(201).json({
            success: true,
            message: "Contact form submitted successfully",
            newMessage
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit contact form",
            error: error.message
        })
    }

})

export const getMessage = catchAsyncErrors(async (req, res) => {
    try {
        const messages = await contactModel.find(); // Retrieve all contact messages

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve messages.",
            error: error.message,
        });
    }
});

export const getAdminProfile = catchAsyncErrors(async (req, res, next) => {
    try {
        const superAdmin = await userModel.findById(req.superAdmin._id);
        if (!superAdmin) {
            return next(new ErrorHandler("superAdmin not found", 404));
        }
        return res.status(200).json({
            success: true,
            message: `${req.superAdmin?.userName} Welcome`,
            admin,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});


export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid ID", 400));
    }

    try {
        const message = await contactModel.findById(id);
        if (!message) {
            return next(new ErrorHandler("Message not found", 404));
        }

        await message.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete message",
            error: error.message,
        });
    }
});