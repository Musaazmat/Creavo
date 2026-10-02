import { Router } from "express";
import {
    createSession,
    listHistory,
    listPackages,
    verifySession,
} from "../controllers/paymentsController.ts";
import { requireAuth } from "../middleware/auth.ts";

const router = Router();

router.get("/packages", listPackages);

router.post("/create-checkout-session", requireAuth, createSession);
router.post("/verify-session", requireAuth, verifySession);
router.get("/history", requireAuth, listHistory);

export default router;
