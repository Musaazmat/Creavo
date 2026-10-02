import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import mongoose from "mongoose";
import type { ProjectDocument } from "../models/Project.ts";
import { Project } from "../models/Project.ts";
import type {
  CreateProjectBody,
  GenerateProjectBody,
  UpdateProjectBody,
} from "../types/api.ts";
import type { AuthenticatedRequest } from "../types/requests.ts";
// import { generateAppFiles } from "../utils/appGenerator.ts";
import { generateMockSite } from "../utils/mockGenerator.ts";
import { enhancePrompt, generateSite, postProcess } from "../utils/services.ts";

type BodyRequest<Body> = Request<ParamsDictionary, unknown, Body>;
type ProjectRequest<Body = Record<string, never>> = AuthenticatedRequest<
  { id: string },
  Body
>;

// Checks whether a string is a valid MongoDB ObjectId.
function isValidId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// Shared loader — used by every handler that operates on a single project.
// Exported so projectDeploy can reuse it.
export async function loadOwnedProject(
  req: Request<{ id: string }>,
  res: Response,
): Promise<ProjectDocument | null> {
  if (!isValidId(req.params.id)) {
    res.status(400).json({ error: "Invalid id" });
    return null;
  }
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return null;
  }
  if (!req.user) {
    res.status(401).json({ error: "Missing token" });
    return null;
  }
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return project;
}

// Returns the current user's projects, newest first.
export async function list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const list = await Project.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json({ projects: list.map((p) => p.toClient()) });
  } catch (err) {
    next(err);
  }
}

// Creates a new project from the user's prompt.
export async function create(
  req: AuthenticatedRequest<ParamsDictionary, CreateProjectBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const prompt =
      typeof req.body.prompt === "string" ? req.body.prompt.trim() : "";
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const requestedFramework = req.body.framework ?? "html";
    if (requestedFramework !== "html") {
      return res.status(400).json({ error: "Only HTML projects are currently supported." });
    }
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });
    if (prompt.length > 2000)
      return res
        .status(400)
        .json({ error: "Prompt is too long (max 2000 characters)." });

    const project = await Project.create({
      user: req.user._id,
      name: name || prompt.split(/[.!?]/)[0].slice(0, 60) || "Untitled project",
      prompt,
      framework: requestedFramework,
      messages: [{ role: "user", text: prompt }],
    });
    res.status(201).json({ project: project.toClient() });
  } catch (err) {
    next(err);
  }
}

// Returns a single project the user owns.
export async function get(
  req: ProjectRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await loadOwnedProject(req, res);
    if (!project) return;
    if (project.framework !== "html") {
      return res.status(400).json({ error: "Only HTML projects are currently supported." });
    }
    res.json({ project: project.toClient() });
  } catch (err) {
    next(err);
  }
}

// Updates a project's name, HTML, or published status.
export async function update(
  req: ProjectRequest<UpdateProjectBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await loadOwnedProject(req, res);
    if (!project) return;

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name || name.length > 80)
        return res.status(400).json({ error: "Name must be 1–80 characters." });
      project.name = name;
    }
    if (req.body.html !== undefined) {
      const html = String(req.body.html);
      if (html.length > 500_000)
        return res.status(400).json({ error: "HTML is too large." });
      project.html = html;
    }
    if (req.body.published !== undefined) {
      const published = Boolean(req.body.published);
      project.published = published;
      project.publishedAt = published ? new Date() : null;
    }
    await project.save();
    res.json({ project: project.toClient() });
  } catch (err) {
    next(err);
  }
}

// Deletes a project the user owns.
export async function remove(
  req: ProjectRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await loadOwnedProject(req, res);
    if (!project) return;
    await project.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// Strip script/style + tags + collapse whitespace. Used by the skeleton guard.
function visibleText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Builds or edits the site's HTML via the AI, then saves and charges credits.
export async function generate(
  req: ProjectRequest<GenerateProjectBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await loadOwnedProject(req, res);
    if (!project) return;
    // Cost: first generation = 5 credits, iteration = 2 credits.
    const hasGeneratedOutput =
      project.framework === "html"
        ? project.html.length >= 100
        : project.sourceFiles.length > 0;
    const isFirstGeneration = !hasGeneratedOutput;
    const cost = isFirstGeneration ? 5 : 2;
    if ((req.user.credits ?? 0) < cost)
      return res.status(402).json({
        error: `You need at least ${cost} credits ${isFirstGeneration ? "for a new site" : "for changes"}. Top up to continue.`,
        cost,
      });
    const prompt =
      typeof req.body.prompt === "string" ? req.body.prompt.trim() : "";
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });
    if (prompt.length > 2000)
      return res
        .status(400)
        .json({ error: "Prompt is too long (max 2000 characters)." });

    // Don't duplicate the user message if the project was just seeded with it.
    const last = project.messages[project.messages.length - 1];
    if (!last || last.role !== "user" || last.text !== prompt) {
      project.messages.push({ role: "user", text: prompt });
    }

    // For iterations, the "original" prompt is what defines the brand.
    const originalPrompt = project.prompt || prompt;

    // Only enhance into a full brand brief on the FIRST build. On iterations
    // (regenerate / "improve it" / any edit) we pass the raw request instead —
    // re-enhancing would invent a brand-new brand and make a different site.
    let brief;
    if (isFirstGeneration) {
      const enhanceResult = await enhancePrompt(prompt);
      project.enhancedPrompt = enhanceResult.text;
      brief = enhanceResult.text;
    } else {
      brief = prompt;
    }

    let outcome: "saved" | "keptPrevious" | "template" | "incomplete";
    let assistantText: string;
    let chargeCredits = false;

    if (project.framework === "html") {
      const genResult = await generateSite(brief, {
        previousHtml: project.html,
        history: project.messages,
        originalPrompt,
      });
      const isRealLlm = genResult.source === "llm";
      const tooShort = !genResult.html || genResult.html.length < 500;
      const visibleLen = visibleText(genResult.html).length;
      const hasAnyHeading = /<h[1-3]\b/i.test(genResult.html || "");
      const sectionCount = (genResult.html?.match(/<section\b/gi) || []).length;
      const badOutput =
        tooShort || visibleLen < 200 || (!hasAnyHeading && sectionCount < 1);
      const truncated = Boolean(genResult.truncated);
      const hadWorkingSite = Boolean(project.html && project.html.length > 200);

      if (hadWorkingSite && (!isRealLlm || badOutput || truncated)) {
        outcome = "keptPrevious";
      } else if (!isRealLlm || badOutput) {
        project.html = isRealLlm
          ? postProcess(generateMockSite(originalPrompt))
          : genResult.html;
        outcome = "template";
      } else if (truncated) {
        project.html = genResult.html;
        outcome = "incomplete";
      } else {
        project.html = genResult.html;
        outcome = "saved";
      }
      chargeCredits = outcome === "saved" && isRealLlm;

      if (outcome === "saved") {
        assistantText =
          genResult.summary && genResult.summary.length > 20
            ? genResult.summary
            : "Done — I built your site.";
      } else if (outcome === "keptPrevious") {
        assistantText =
          "That update came back incomplete, so I kept your current site unchanged — please try again in a moment.";
      } else if (outcome === "incomplete") {
        assistantText =
          "Your site is ready, but it came out a little cut off — try again and I'll complete it.";
      } else if (genResult.source === "mock-no-key") {
        assistantText =
          "No AI provider is configured on the server, so I used a starter template.";
      } else {
        assistantText =
          "The AI was busy just now, so I used a starter template — please try again in a moment.";
      }
    } else {
      // React and Next.js project generation is temporarily disabled.
      /*
      const appResult = await generateAppFiles(project.framework, brief, {
        previousFiles: project.sourceFiles,
        history: project.messages,
      });
      project.sourceFiles = appResult.files;
      outcome = appResult.source === "llm" ? "saved" : "template";
      assistantText = appResult.summary;
      chargeCredits = outcome === "saved";
      */
      return res.status(400).json({ error: "Only HTML projects are currently supported." });
    }

    if (outcome !== "saved") {
      console.warn(`[generate] outcome=${outcome} framework=${project.framework}`);
    }

    project.messages.push({ role: "assistant", text: assistantText });
    if (!project.prompt) project.prompt = prompt;
    await project.save();

    // Charge credits only for a genuinely complete AI build/edit.
    if (chargeCredits) {
      req.user.credits = Math.max(0, req.user.credits - cost);
      await req.user.save();
    }

    res.json({ project: project.toClient(), user: req.user.toClient() });
  } catch (err) {
    next(err);
  }
}
