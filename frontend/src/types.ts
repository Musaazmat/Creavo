export interface AuthUser {
  id: string;
  name: string;
  email: string;
  credits: number;
  emailVerified: boolean;
  createdAt?: string;
}

export interface ProjectMessage {
  role: "user" | "assistant";
  text: string;
  createdAt?: string;
}

export type ProjectFramework = "html" | "react" | "nextjs";

export interface GeneratedSourceFile {
  path: string;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  enhancedPrompt?: string;
  html: string;
  framework?: ProjectFramework;
  sourceFiles?: GeneratedSourceFile[];
  published: boolean;
  publishedAt?: string | null;
  messages?: ProjectMessage[];
  views?: number;
  likes?: number;
  deployUrl?: string;
  deployedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityProject extends Project {
  author?: string;
  isOwn?: boolean;
  likedByMe?: boolean;
}

export interface PaymentPackage {
  id: string;
  name: string;
  credits: number;
  amount: number;
  currency: string;
  perCredit: string;
  tagline: string;
  highlighted?: boolean;
}

export interface VerifySessionResult {
  ok: boolean;
  alreadyCredited?: boolean;
  creditsAdded?: number;
  user: AuthUser;
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface ApiOk {
  ok: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProjectUpdate {
  name?: string;
  html?: string;
  published?: boolean;
}

export interface CreateProjectRequest {
  prompt: string;
  name?: string;
  framework: ProjectFramework;
}

export interface GitHubUploadRequest {
  token: string;
  repoName: string;
  isPrivate?: boolean;
  enablePages?: boolean;
}

export interface GitHubUploadResult {
  owner: string;
  repoName: string;
  repoUrl: string;
  pagesUrl: string | null;
  alreadyExisted: boolean;
}

export interface VercelDeployRequest {
  token?: string;
  projectName?: string;
}

export interface VercelDeployResult {
  url: string;
  deploymentId: string;
  readyState: string;
}
