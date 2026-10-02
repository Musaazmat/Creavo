export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
  contributions: ["contributions"] as const,
  community: {
    all: ["community"] as const,
    list: (sort: string) => ["community", "list", sort] as const,
    detail: (id: string, authenticated: boolean) =>
      ["community", "detail", id, authenticated] as const,
  },
  payments: {
    packages: ["payments", "packages"] as const,
    verification: (sessionId: string) =>
      ["payments", "verification", sessionId] as const,
  },
};
