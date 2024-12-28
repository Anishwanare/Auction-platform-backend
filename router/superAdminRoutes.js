import express from 'express';
import { deleteMessage, deletePaymentProof, fetchAllAuctionItems, fetchAllUsers, getAdminProfile, getAllPaymentsProof, getMessage, getPaymentProofDetails, getSuperAdminProfile, logoutAdmin, message, monthlyRevenue, removeAuctionItem, updatePaymentProof } from "../controller/superAdminController.js"
import { isSuperAdminAuthenticated, isSuperAdminAuthorized } from '../middleware/superAdminAuth.js';


const router = express.Router()

router.get("/paymentproof/details", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getAllPaymentsProof)


router.get("/paymentproof/details/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getPaymentProofDetails)

//delete the payment proof
router.delete("/delete-payment/proof/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), deletePaymentProof)

router.put("/paymentproof/update/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), updatePaymentProof)

//remove auction item
router.delete("/auction-items/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), removeAuctionItem)

// get all users
router.get("/fetchall/users", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), fetchAllUsers)

// get monthly revenue
router.get("/fetchmonthly/revenue", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), monthlyRevenue)


router.get("/fetchall/items", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), fetchAllAuctionItems)

router.post("/send-messages", message)
router.get("/fetch-messages", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getMessage)

// fetch superAdmin
router.get('/admin-fetch', isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getAdminProfile)

//logout admin
router.get("/logout-admin", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), logoutAdmin)

router.get("/admin/me", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getSuperAdminProfile)
router.delete("/message/delete/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), deleteMessage)

export default router