import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    minLength: [3, "username must contain 3 characters "],
    maxLength: [40, "username must cannot exceed 40 characters"],
    required: [true, "username is required"],
  },
  password: {
    type: String,
    minLength: [8, "password must contain 8 characters"],
    required: [true, "password is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    match: [/\S+@\S+\.\S+/, "email must be in a valid format"],
    unique: true,
  },
  address: {
    type: String,
    required: [true, "address is required"],
    maxLength: [100, "address must cannot exceed 100 characters"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits."],
    unique: true,
  },
  profileImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  paymentMethods: {
    bankTransfer: {
      accountNumber: {
        type: String,
        required: [false, "Bank account number is required"],
        minLength: [10, "Bank account number must be at least 10 characters"],
        maxLength: [20, "Bank account number cannot exceed 20 characters"],
      },
      bankName: {
        type: String,
        required: [false, "Bank name is required"],
        minLength: [3, "Bank name must be at least 3 characters"],
        maxLength: [50, "Bank name cannot exceed 50 characters"],
      },
      bankIFSCCode: {
        type: String,
        required: [false, "Bank IFSC code is required"],
        minLength: [11, "Bank IFSC code must be 11 characters"],
        maxLength: [11, "Bank IFSC code cannot exceed 11 characters"],
      },
    },
    razorpay: {
      razorpayAccountNumber: {
        type: String,
        required: [false, "Razorpay account number is required"],
        minLength: [
          10,
          "Razorpay account number must be at least 10 characters",
        ],
        maxLength: [20, "Razorpay account number cannot exceed 20 characters"],
      },
    },
    paypal: {
      paypalEmail: {
        type: String,
        required: [false, "PayPal email is required"],
        match: [/\S+@\S+\.\S+/, "PayPal email must be in a valid format"],
      },
    },
  },
  role: {
    type: String,
    enum: ["Auctioneer", "Bidder", "SuperAdmin"],
    default: "Bidder",
    required: true,
  },
  unpaidCommission: {
    type: Number,
    default: 0,
  },
  auctionWon: {
    type: Number,
    default: 0,
  },
  moneySpend: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export const userModel = mongoose.model("User", userSchema);
