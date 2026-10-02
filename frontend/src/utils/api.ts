import type { AxiosResponse } from "axios";
import axios from "axios";
import type {
  ApiOk,
  AuthUser,
  CommunityProject,
  ContributionDay,
  CreateProjectRequest,
  GitHubUploadRequest,
  GitHubUploadResult,
  LoginRequest,
  PaymentPackage,
  Project,
  ProjectUpdate,
  RegisterRequest,
  VercelDeployRequest,
  VercelDeployResult,
  VerifySessionResult
} from "../types";

// Centralized Axios instance configured with the base URL and standard headers
// for all backend communication.
const API = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — automatically injects the JWT bearer token from
// localStorage into every outgoing request.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — on a 401 the session has expired, so we clear the
// stored credentials and send the user back to the login screen. Third-party
// deploy endpoints (GitHub / Vercel) use their own tokens, so a 401 from those
// must NOT log the user out of the app.
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isThirdParty = /\/(deploy|github)$/i.test(url);
    if (err.response?.status === 401 && !isThirdParty) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

// Pulls a readable message out of an Axios error for toasts / inline errors.
export const apiError = (error: unknown): string => {
  if (axios.isAxiosError<{ error?: unknown }>(error)) {
    const message = error.response?.data?.error;
    if (typeof message === "string") return message;
    return error.message || "Something went wrong";
  }
  return error instanceof Error ? error.message : "Something went wrong";
};

export const apiStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

// Every endpoint below returns the response BODY (res.data) so callers can
// destructure it directly.
const body = <T>(request: Promise<AxiosResponse<T>>): Promise<T> =>
  request.then((response) => response.data);

// --- AUTHENTICATION ---
// Sign-up returns { ok, email, ... } (NO token) — the user must verify the OTP
// before they can log in.
export const register = (data: RegisterRequest) =>
  body<{ ok: boolean; email: string }>(API.post("/auth/register", data));
// Confirms a sign-up by checking the OTP code sent to the email.
export const registerVerify = (email: string, code: string) =>
  body<ApiOk & { alreadyVerified?: boolean }>(
    API.post("/auth/register/verify", { email, code }),
  );
// Resends the sign-up OTP code to the given email.
export const registerResend = (email: string) =>
  body<ApiOk & { email?: string }>(API.post("/auth/register/resend", { email }));
// Logs the user in and returns their token and profile.
export const login = (data: LoginRequest) =>
  body<{ token: string; user: AuthUser }>(API.post("/auth/login", data));
// Fetches the currently logged-in user's profile.
export const getMe = () => body<{ user: AuthUser }>(API.get("/auth/me"));
// Updates the logged-in user's profile fields.
export const updateProfile = (data: { name: string }) =>
  body<{ user: AuthUser }>(API.patch("/auth/me", data));
// Changes the logged-in user's password.
export const changePassword = (data: { current: string; nextPw: string }) =>
  body<ApiOk>(API.patch("/auth/me/password", data));
// Permanently deletes the logged-in user's account.
export const deleteMyAccount = () => body<ApiOk>(API.delete("/auth/me"));
// Fetches the user's contribution activity.
export const getContributions = () =>
  body<{
    days: ContributionDay[];
    total: number;
    from: string;
    to: string;
  }>(API.get("/auth/me/contributions"));

// --- FORGOT PASSWORD (OTP) ---
// Sends a password-reset OTP code to the email.
export const forgotRequest = (email: string) =>
  body<ApiOk & { email: string }>(API.post("/auth/forgot/request", { email }));
// Checks that the password-reset OTP code is valid.
export const forgotVerifyCode = (email: string, code: string) =>
  body<ApiOk>(API.post("/auth/forgot/verify-code", { email, code }));
// Sets a new password after the reset code is verified.
export const forgotReset = (email: string, code: string, newPassword: string) =>
  body<ApiOk>(API.post("/auth/forgot/reset", { email, code, newPassword }));

// --- PROJECTS ---
// Fetches all projects owned by the user.
export const getProjects = () =>
  body<{ projects: Project[] }>(API.get("/projects"));
// Creates a new project.
export const createProject = (data: CreateProjectRequest) =>
  body<{ project: Project }>(API.post("/projects", data));
// Fetches one project by its id.
export const getProject = (id: string) =>
  body<{ project: Project }>(API.get(`/projects/${id}`));
// Updates a project by id.
export const updateProject = (id: string, data: ProjectUpdate) =>
  body<{ project: Project }>(API.patch(`/projects/${id}`, data));
// Deletes a project by id.
export const deleteProject = (id: string) =>
  body<ApiOk>(API.delete(`/projects/${id}`));
// Runs the AI generation for a project from a prompt.
export const generateProject = (id: string, prompt: string) =>
  body<{ project: Project; user: AuthUser }>(
    API.post(`/projects/${id}/generate`, { prompt }),
  );
// Pushes the project's code to a GitHub repo.
export const uploadToGithub = (id: string, data: GitHubUploadRequest) =>
  body<GitHubUploadResult>(API.post(`/projects/${id}/github`, data));
// Deploys the project to Vercel.
export const deployToVercel = (id: string, data: VercelDeployRequest) =>
  body<VercelDeployResult>(API.post(`/projects/${id}/deploy`, data));

// --- COMMUNITY ---
// Fetches the public community projects, sorted as requested.
export const getCommunity = (sort: "new" | "views" | "likes" = "new") =>
  body<{ projects: CommunityProject[] }>(
    API.get(`/community?sort=${sort}`),
  );
// Fetches one shared community project by id.
export const getCommunityProject = (id: string) =>
  body<{ project: CommunityProject }>(API.get(`/community/${id}`));
// Likes a community project.
export const likeCommunityProject = (id: string) =>
  body<{ likes: number; liked: boolean }>(API.post(`/community/${id}/like`));

// --- PAYMENTS ---
// Fetches the available payment packages.
export const getPackages = () =>
  body<{ packages: PaymentPackage[]; configured: boolean }>(
    API.get("/payments/packages"),
  );
// Starts a checkout session for a chosen package.
export const createCheckoutSession = (packageId: string) =>
  body<{ url: string; sessionId: string }>(
    API.post("/payments/create-checkout-session", { packageId }),
  );
// Verifies a completed checkout session.
export const verifySession = (sessionId: string) =>
  body<VerifySessionResult>(API.post("/payments/verify-session", { sessionId }));

export default API;
