import express from 'express';
import {isAuthenticated, isAuthorized} from "../middleware/auth.js"
import { proofCommission } from '../controller/comissionController.js';

// used to create new router object
const router = express.Router();

router.post('/proof',isAuthenticated,isAuthorized("Auctioneer"),proofCommission)

export default router;

