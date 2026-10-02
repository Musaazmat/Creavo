import { Router } from "express";
import { get, list, toggleLike } from "../controllers/communityController.ts";
import { optionalAuth, requireAuth } from "../middleware/auth.ts";

const router = Router();

router.get("/", optionalAuth, list);
router.get("/:id", optionalAuth, get);
router.post("/:id/like", requireAuth, toggleLike);

export default router;
