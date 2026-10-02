import { Router } from "express";
import {
    changePassword,
    contributions,
    deleteAccount,
    login,
    me,
    register,
    resendRegister,
    updateProfile,
    verifyRegister,
} from "../controllers/authController.ts";
import { requireAuth } from "../middleware/auth.ts";
import forgotRoutes from "./authForgot.ts";

const router = Router();

// Registration → OTP verify → login
router.post("/register", register);
router.post("/register/verify", verifyRegister);
router.post("/register/resend", resendRegister);
router.post("/login", login);

// Current user
router.get("/me", requireAuth, me);
router.get("/me/contributions", requireAuth, contributions);
router.patch("/me", requireAuth, updateProfile);
router.patch("/me/password", requireAuth, changePassword);
router.delete("/me", requireAuth, deleteAccount);

// Forgot-password subflow — lives in its own controller/route file
router.use("/forgot", forgotRoutes);

export default router;
