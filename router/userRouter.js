import express from "express";
import { deleteUser, fetchLeaderBoard, getUsersProfile, loginUser, logoutUser, register, updateUserProfile } from "../controller/userController.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

const router = express.Router()


router.post('/register', register)
router.post('/login', loginUser)
router.get('/me', isAuthenticated, getUsersProfile)
router.delete("/users/:id", deleteUser)
router.put("/users/:id", isAuthenticated, updateUserProfile)
router.get("/logout", isAuthenticated, logoutUser)

router.get("/leaderboard", fetchLeaderBoard)

export default router;