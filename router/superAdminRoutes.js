import express from 'express';
import { deleteMessage, deletePaymentProof, deleteUsers, delteAuctionItem, fetchAllAuctionItems, fetchAllUsers, getAdminProfile, getAllPaymentsProof, getMessage, getPaymentProofDetails, getSuperAdminProfile, logoutAdmin, message, monthlyRevenue, updatePaymentProof } from "../controller/superAdminController.js"
import { isSuperAdminAuthenticated, isSuperAdminAuthorized } from '../middleware/superAdminAuth.js';


const router = express.Router()

// payment proof routers
router.get("/paymentproof/details", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getAllPaymentsProof)
router.get("/paymentproof/details/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getPaymentProofDetails)
router.delete("/delete-payment/proof/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), deletePaymentProof)
router.put("/paymentproof/update/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), updatePaymentProof)


//auction item routers
router.delete("/auction-items/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), delteAuctionItem)
router.get("/fetchall/items", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), fetchAllAuctionItems)

// get all users
router.get("/fetchall/users", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), fetchAllUsers)
router.delete("/delete/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), deleteUsers)

//revenue router
router.get("/fetchmonthly/revenue", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), monthlyRevenue)


// messages router
router.post("/send-messages", message)
router.get("/fetch-messages", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getMessage)
router.delete("/message/delete/:id", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), deleteMessage)

//superAdmin router
router.get('/admin-fetch', isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getAdminProfile)
router.get("/logout-admin", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), logoutAdmin)
router.get("/admin/me", isSuperAdminAuthenticated, isSuperAdminAuthorized("SuperAdmin"), getSuperAdminProfile)



export default router