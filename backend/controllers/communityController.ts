import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/Project.ts";
import type { AuthenticatedRequest, OptionalAuthRequest } from "../types/requests.ts";

// Returns the published community projects, sorted, with per-user like/own flags.
export async function list(req: OptionalAuthRequest, res: Response, next: NextFunction) {
  try {
    const requestedSort = req.query.sort;
    const sort =
      requestedSort === "views"
        ? "-views -publishedAt"
        : requestedSort === "likes"
          ? "-likes -publishedAt"
          : "-publishedAt -createdAt";
    const items = await Project.find({ published: true })
      .select("+likedBy")
      .sort(sort)
      .limit(60)
      .populate("user", "name");

    const viewer = req.user;
    const meId = viewer?._id.toString();
    const projects = items.map((p) => {
      const card = p.toPublicCard({ withHtml: true });
      // Is this MY project? (so the frontend can disable the like button)
      card.isOwn = Boolean(meId && p.user?._id?.toString() === meId);
      card.likedByMe = Boolean(
        meId && (p.likedBy || []).some((id) => id.toString() === meId),
      );
      return card;
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

// Fetches one published project by id, counts a new view, and returns its details.
export async function get(req: OptionalAuthRequest<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid id" });
    const project = await Project.findById(req.params.id)
      .select("+viewedBy +likedBy")
      .populate("user", "name");
    if (!project || !project.published)
      return res.status(404).json({ error: "Not found" });

    const viewer = req.user;
    const meId = viewer?._id.toString();
    const ownerId = project.user?._id?.toString();
    const isOwn = Boolean(meId && ownerId === meId);
    const alreadyViewed = Boolean(
      viewer &&
        meId &&
        (project.viewedBy || []).some((id) => id.toString() === meId),
    );

    if (viewer && meId && !isOwn && !alreadyViewed) {
      await Project.updateOne(
        { _id: project._id },
        { $addToSet: { viewedBy: viewer._id }, $inc: { views: 1 } },
      );
      project.views += 1;
    }

    const likedByMe = Boolean(
      meId && (project.likedBy || []).some((id) => id.toString() === meId),
    );

    res.json({
      project: {
        ...project.toPublicCard(),
        html: project.html,
        isOwn,
        likedByMe,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Likes or unlikes a project for the current user and returns the new like count.
export async function toggleLike(req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid id" });
    const project = await Project.findOne({
      _id: req.params.id,
      published: true,
    }).select("+likedBy");
    if (!project) return res.status(404).json({ error: "Not found" });

    const meId = req.user._id.toString();

    if (project.user.toString() === meId)
      return res.status(403).json({ error: "You can't like your own project" });

    const idx = (project.likedBy || []).findIndex(
      (id) => id.toString() === meId,
    );
    let liked;
    if (idx === -1) {
      await Project.updateOne(
        { _id: project._id },
        { $addToSet: { likedBy: req.user._id }, $inc: { likes: 1 } },
      );
      liked = true;
    } else {
      await Project.updateOne(
        { _id: project._id },
        { $pull: { likedBy: req.user._id }, $inc: { likes: -1 } },
      );
      liked = false;
    }
    const fresh = await Project.findById(project._id).select("likes");
    res.json({ likes: Math.max(0, fresh?.likes ?? 0), liked });
  } catch (err) {
    next(err);
  }
}
