import ErrorHandler from "../middleware/error.js";
import { userModel } from "../model/userSchema.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import mongoose from "mongoose";

export const register = catchAsyncErrors(async (req, res, next) => {
    try {
        // Check if profile image exists
        if (!req.files || Object.keys(req.files).length === 0) {
            return next(new ErrorHandler("Profile Image is Required", 400));
        }

        const { profileImage } = req.files;
        const allowedFormats = [
            "image/jpg",
            "image/png",
            "image/jpeg",
            "image/webp",
        ];

        // Validate profile image format
        if (!allowedFormats.includes(profileImage.mimetype)) {
            return next(new ErrorHandler("Unsupported Image Format", 400));
        }

        const {
            userName,
            password,
            email,
            address,
            phone,
            role,
            accountNumber,
            bankName,
            bankIFSCCode,
            razorpayAccountNumber,
            paypalEmail,
        } = req.body;

        // Check required fields
        if (!userName || !password || !email || !address || !phone || !role) {
            return next(new ErrorHandler(`Please fill full form ${userName}.`, 400));
        }

        if (role === "Auctioneer") {
            if (!accountNumber || !bankName || !bankIFSCCode) {
                return next(
                    new ErrorHandler("Please fill full bank details for Auctioneer.", 400)
                );
            }
            if (!razorpayAccountNumber) {
                return next(
                    new ErrorHandler(
                        "Please fill Razorpay Account Number for Auctioneer.",
                        400
                    )
                );
            }
            if (!paypalEmail) {
                return next(
                    new ErrorHandler("Please fill PayPal Email for Auctioneer.", 400)
                );
            }
        }

        // Check if user is already registered
        const isRegister = await userModel.findOne({ $or: [{ email }, { phone }] });
        if (isRegister) {
            return next(new ErrorHandler("Already Registered", 409));
        }

        // Upload profile image to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(
            profileImage.tempFilePath,
            { folder: "Auction_wala_users" }
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error(
                "Cloudinary error: ",
                cloudinaryResponse.error || "Cloudinary internal server error"
            );
            return next(
                new ErrorHandler("Failed to upload profile image to cloudinary", 500)
            );
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const user = new userModel({
            userName,
            password: hashedPassword,
            email,
            address,
            phone,
            profileImage: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            role,
            paymentMethods: {
                bankTransfer: {
                    accountNumber,
                    bankName,
                    bankIFSCCode,
                },
                razorpay: {
                    razorpayAccountNumber,
                },
                paypal: {
                    paypalEmail,
                },
            },
        });
        // Save user to database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        // Send success response
        res
            .status(200)
            .cookie(
                `${user.role === "Auctioneer" ? "Auctioneer_Token" : user.role === "SuperAdmin" ? "SuperAdmin_Token" : "Bidder_Token"}`,
                token,
                {
                    expires: new Date(
                        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "None",
                }
            )
            .json({
                success: true,
                message: "Register successful",
                user,
                token,
            });
    } catch (error) {
        console.error(error);
        return next(new ErrorHandler("Registration failed", 500));
    }
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return next(new ErrorHandler("Please fill full form.", 400));
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        // Compare the passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        res
            .status(200)
            .cookie(
                `${user.role === "Auctioneer" ? "Auctioneer_Token" : user.role === "SuperAdmin" ? "SuperAdmin_Token" : "Bidder_Token"}`,
                token,
                {
                    expires: new Date(
                        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "None",
                }
            )
            .json({
                success: true,
                message: `${user?.role} Login successful`,
                user,
                token,
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
});


// Delete user by admin
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Check if the user ID is provided
    if (!id) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    // Find user by ID
    const user = await userModel.findById(id);

    // Check if the user exists
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Remove the user from the database
    await user.deleteOne();

    // Return success message
    res.status(500).json({
        success: true,
        message: "User deleted successfully",
    });
});

// Update user profile by admin
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            userName,
            password,
            email,
            address,
            phone,
            accountNumber,
            bankName,
            bankIFSCCode,
            razorpayAccountNumber,
            paypalEmail,
        } = req.body;

        // Check if user ID is provided and valid
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler("Valid User ID is required", 400));
        }

        // Find user by ID
        const user = await userModel.findById(id);

        // Check if the user exists
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // Update user profile fields (only if provided in the request body)
        if (userName) user.userName = userName;
        if (email) user.email = email;
        if (address) user.address = address;
        if (phone) user.phone = phone;

        // Hash the password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Handle updating payment details if the user is an Auctioneer
        if (req.user?.role === "Auctioneer") {
            // Ensure paymentMethods and its nested objects exist before updating
            if (!user.paymentMethods) {
                user.paymentMethods = {};
            }
            if (!user.paymentMethods.bankTransfer) {
                user.paymentMethods.bankTransfer = {};
            }
            if (!user.paymentMethods.razorpay) {
                user.paymentMethods.razorpay = {};
            }
            if (!user.paymentMethods.paypal) {
                user.paymentMethods.paypal = {};
            }

            // Update payment details only if provided
            if (accountNumber) user.paymentMethods.bankTransfer.accountNumber = accountNumber;
            if (bankName) user.paymentMethods.bankTransfer.bankName = bankName;
            if (bankIFSCCode) user.paymentMethods.bankTransfer.bankIFSCCode = bankIFSCCode;
            if (razorpayAccountNumber)
                user.paymentMethods.razorpay.razorpayAccountNumber = razorpayAccountNumber;
            if (paypalEmail) user.paymentMethods.paypal.paypalEmail = paypalEmail;
        }

        // Save the updated user to the database with schema validation
        await user.save({ validateBeforeSave: true, runValidators: true, new: true });

        // Return success message with updated user data
        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
});

// Logout user
export const logoutUser = catchAsyncErrors(async (req, res) => {
    try {
        res
            .status(200)
            .cookie("Auctioneer_Token", "", {
                expires: new Date(Date.now()), // Expire the Auctioneer_Token cookie
                httpOnly: true,
            })
            .cookie("Bidder_Token", "", {
                expires: new Date(Date.now()), // Expire the Bidder cookie
                httpOnly: true,
            })
            .json({
                success: true,
                message: `${req.user?.role} Logged out successfully`,
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
});

export const getUsersProfile = catchAsyncErrors(async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        return res.status(200).json({
            success: true,
            message: `${req.user?.userName} Welcome`,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});



export const fetchLeaderBoard = catchAsyncErrors(async (req, res, next) => {
    try {
        const users = await userModel.find({ moneySpend: { $gt: 0 } }) //find users whose money spend is greater than 0
        const leaderBoard = users.slice(0, 10)?.sort((a, b) => b.moneySpend - a.moneySpend)
        res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully",
            leaderBoard
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        })
    }
});


