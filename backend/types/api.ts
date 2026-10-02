import type { ProjectFramework } from "./projects.ts";

export interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

export interface EmailBody {
  email?: string;
}

export interface EmailCodeBody extends EmailBody {
  code?: string;
}

export interface LoginBody extends EmailBody {
  password?: string;
}

export interface UpdateProfileBody {
  name?: string;
}

export interface ChangePasswordBody {
  current?: string;
  nextPw?: string;
}

export interface CreateProjectBody {
  prompt?: string;
  name?: string;
  framework?: ProjectFramework;
}

export interface UpdateProjectBody {
  name?: string;
  html?: string;
  published?: boolean;
}

export interface GenerateProjectBody {
  prompt?: string;
}

export interface CreateCheckoutBody {
  packageId?: string;
}

export interface VerifyCheckoutBody {
  sessionId?: string;
}
