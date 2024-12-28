import express from 'express';
import { addNewAuctionItem, getAllAuctionItems, getAuctionDetails, getMyAuctionItem, removeAuctionItem, republishAuctionItem, updateMyAuctionItemDetails } from '../controller/auctionItemController.js';
import { isAuthenticated, isAuthorized } from '../middleware/auth.js';
import { trackCommisionStatus } from '../middleware/trackCommisionStatus.js';
import { isSuperAdminAuthenticated, isSuperAdminAuthorized } from '../middleware/superAdminAuth.js';

const router = express.Router();


router.post("/create-item", isAuthenticated, isAuthorized("Auctioneer"), trackCommisionStatus, addNewAuctionItem)
router.get("/get-my-auction-item", isAuthenticated, isAuthorized("Auctioneer"), getMyAuctionItem)
router.get("/all-items", getAllAuctionItems)
router.get("/details/:id", getAuctionDetails)
router.delete("/delete/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), trackCommisionStatus, removeAuctionItem)
router.put("/republish/:id", isAuthenticated, isAuthorized("Auctioneer"), trackCommisionStatus, republishAuctionItem)
router.put("/update-my-item", isAuthenticated, isAuthorized("Auctioneer"), updateMyAuctionItemDetails)

export default router
