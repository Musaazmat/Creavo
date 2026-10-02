import { Router, type Request, type RequestHandler, type Response } from "express";
import type { ProjectDocument } from "../models/Project.ts";
import { getErrorMessage, getErrorStatus } from "../utils/errors.ts";
import { deployToVercel, publishToGitHub } from "../utils/services.ts";

const router = Router({ mergeParams: true });

type ProjectRouteParams = { id: string };
type ProjectLoader = (
  req: Request<ProjectRouteParams>,
  res: Response,
) => Promise<ProjectDocument | null>;

interface GitHubUploadBody {
  token?: unknown;
  repoName?: unknown;
  isPrivate?: unknown;
  enablePages?: unknown;
}

interface VercelDeployBody {
  token?: unknown;
  projectName?: unknown;
}

// Builds the route handler that publishes a project's HTML to a GitHub repo.
export function githubRoute(
  loadOwnedProject: ProjectLoader,
): RequestHandler<ProjectRouteParams, unknown, GitHubUploadBody> {
  return async (req, res, next) => {
    try {
      const project = await loadOwnedProject(req, res);
      if (!project) return;
      if (!project.html || project.html.length < 100) {
        return res
          .status(400)
          .json({ error: "Project has no generated HTML yet" });
      }
      const token =
        typeof req.body.token === "string" ? req.body.token.trim() : "";
      const repoName =
        typeof req.body.repoName === "string" ? req.body.repoName.trim() : "";
      if (token.length < 20)
        return res.status(400).json({ error: "Token looks too short" });
      if (
        !repoName ||
        repoName.length > 60 ||
        !/^[a-zA-Z0-9._-]+$/.test(repoName)
      )
        return res
          .status(400)
          .json({
            error: "Use letters, numbers, '.', '_' or '-' for the repo name",
          });

      const result = await publishToGitHub({
        token,
        repoName,
        html: project.html,
        projectName: project.name,
        prompt: project.prompt,
        isPrivate: Boolean(req.body.isPrivate),
        enablePages: req.body.enablePages !== false,
      });
      res.json(result);

    } catch (err: unknown) {
      const status = getErrorStatus(err);
      if (status === 401)
        return res
          .status(401)
          .json({ error: "GitHub token is invalid or expired" });
      if (status === 403)
        return res
          .status(403)
          .json({
            error: "Token doesn't have the required scopes (repo, pages)",
          });
      if (status === 422)
        return res
          .status(422)
          .json({
            error:
              "Repo name is invalid or already exists with different owner",
          });
      console.error("[github upload]", err);
      res.status(500).json({
        error: getErrorMessage(err, "GitHub upload failed"),
      });
    }
  };
}

// Builds the route handler that deploys a project's HTML to Vercel and saves the live URL.
export function vercelRoute(
  loadOwnedProject: ProjectLoader,
): RequestHandler<ProjectRouteParams, unknown, VercelDeployBody> {
  return async (req, res, next) => {
    try {
      const project = await loadOwnedProject(req, res);
      if (!project) return;
      if (!project.html || project.html.length < 100) {
        return res
          .status(400)
          .json({ error: "Project has no generated HTML yet" });
      }
      const bodyToken =
        typeof req.body.token === "string" ? req.body.token.trim() : "";
      const projectName =
        typeof req.body.projectName === "string"
          ? req.body.projectName.trim()
          : "";
      const token =
        bodyToken.length >= 10
          ? bodyToken
          : (process.env.VERCEL_TOKEN || "").trim();
      if (!token) {
        return res.status(400).json({
          error:
            "No Vercel token provided. Either paste one in the modal, or add VERCEL_TOKEN to backend/.env.",
        });
      }
      const result = await deployToVercel({
        token,
        projectName: projectName || project.name,
        html: project.html,
        prompt: project.prompt,
      });
      project.deployUrl = result.url;
      project.deployedAt = new Date();
      await project.save();
      res.json({
        url: result.url,
        deploymentId: result.deploymentId,
        readyState: result.readyState,
      });
      
    } catch (err: unknown) {
      const status = getErrorStatus(err);
      if (status === 401 || status === 403)
        return res
          .status(422)
          .json({ error: "Vercel token is invalid or lacks deploy scope" });
      if (status === 429)
        return res
          .status(429)
          .json({
            error: "Vercel rate-limited the request — try again in a minute",
          });
      console.error("[vercel deploy]", err);
      res.status(status ?? 500).json({
        error: getErrorMessage(err, "Vercel deployment failed"),
      });
    }
  };
}

export default router;
