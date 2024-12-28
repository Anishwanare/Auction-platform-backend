import express from "express";
import { placeItemBid } from "../controller/bidController.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";
import { checkAuctionEndTime } from "../middleware/checkAuctionEndTime.js";



const router = express.Router();

router.post('/place/bid/:id', isAuthenticated, checkAuctionEndTime, isAuthorized("Bidder"), placeItemBid)


export default router