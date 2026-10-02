import mongoose, { type HydratedDocument, type Model, Types } from "mongoose";
import type { GeneratedSourceFile, ProjectFramework } from "../types/projects.ts";

export interface ProjectMessage {
  role: "user" | "assistant";
  text: string;
  createdAt?: Date;
}

export interface ProjectRecord {
  user: Types.ObjectId;
  name: string;
  prompt: string;
  enhancedPrompt: string;
  html: string;
  framework: ProjectFramework;
  sourceFiles: GeneratedSourceFile[];
  published: boolean;
  publishedAt: Date | null;
  messages: ProjectMessage[];
  views: number;
  likes: number;
  viewedBy: Types.ObjectId[];
  likedBy: Types.ObjectId[];
  deployUrl: string;
  deployedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectClient {
  id: string;
  name: string;
  prompt: string;
  enhancedPrompt: string;
  html: string;
  framework: ProjectFramework;
  sourceFiles: GeneratedSourceFile[];
  published: boolean;
  publishedAt: Date | null;
  messages: ProjectMessage[];
  views: number;
  likes: number;
  deployUrl: string;
  deployedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicProjectCard {
  id: string;
  name: string;
  prompt: string;
  publishedAt: Date | null;
  views: number;
  likes: number;
  author: string;
  html?: string;
  isOwn?: boolean;
  likedByMe?: boolean;
}

interface ProjectMethods {
  toClient(): ProjectClient;
  toPublicCard(options?: { withHtml?: boolean }): PublicProjectCard;
}

interface ProjectModel extends Model<ProjectRecord, {}, ProjectMethods> {}

export type ProjectDocument = HydratedDocument<ProjectRecord, ProjectMethods>;

const messageSchema = new mongoose.Schema<ProjectMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
  },
  { _id: false, timestamps: true },
);

const sourceFileSchema = new mongoose.Schema<GeneratedSourceFile>(
  {
    path: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema<ProjectRecord, ProjectModel, ProjectMethods>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: "Untitled project",
      maxlength: 80,
    },
    prompt: { type: String, default: "" },
    enhancedPrompt: { type: String, default: "" },
    html: { type: String, default: "" },
    framework: {
      type: String,
      enum: ["html", "react", "nextjs"],
      default: "html",
    },
    sourceFiles: { type: [sourceFileSchema], default: [] },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    messages: { type: [messageSchema], default: [] },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    viewedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      select: false,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      select: false,
    },
    // For real Vercel deployments
    deployUrl: { type: String, default: "" },
    deployedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Returns the project's full data shaped for the logged-in owner's client.
projectSchema.methods.toClient = function (this: ProjectDocument): ProjectClient {
  return {
    id: this._id.toString(),
    name: this.name,
    prompt: this.prompt,
    enhancedPrompt: this.enhancedPrompt,
    html: this.html,
    framework: this.framework,
    sourceFiles: this.sourceFiles,
    published: this.published,
    publishedAt: this.publishedAt,
    messages: this.messages,
    views: this.views,
    likes: this.likes,
    deployUrl: this.deployUrl,
    deployedAt: this.deployedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Returns a trimmed public view of the project for gallery cards, optionally with HTML.
projectSchema.methods.toPublicCard = function (
  this: ProjectDocument,
  { withHtml = false }: { withHtml?: boolean } = {},
): PublicProjectCard {
  const populatedUser = this.populated("user") as { name?: string } | undefined;
  const card: PublicProjectCard = {
    id: this._id.toString(),
    name: this.name,
    prompt: this.prompt,
    publishedAt: this.publishedAt,
    views: this.views,
    likes: this.likes,
    author: populatedUser?.name || "Anonymous",
  };
  if (withHtml) card.html = this.html;
  return card;
};

export const Project = mongoose.model<ProjectRecord, ProjectModel>("Project", projectSchema);
