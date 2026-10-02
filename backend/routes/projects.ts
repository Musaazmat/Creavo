import { Router } from "express";
import {
    create,
    generate,
    get,
    list,
    loadOwnedProject,
    remove,
    update,
} from "../controllers/projectsController.ts";
import { requireAuth } from "../middleware/auth.ts";
import { githubRoute, vercelRoute } from "./projectDeploy.ts";

const router = Router();

router.get("/", requireAuth, list);
router.post("/", requireAuth, create);
router.get("/:id", requireAuth, get);
router.patch("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);
router.post("/:id/generate", requireAuth, generate);
router.post("/:id/github", requireAuth, githubRoute(loadOwnedProject));
router.post("/:id/deploy", requireAuth, vercelRoute(loadOwnedProject));

export default router;
