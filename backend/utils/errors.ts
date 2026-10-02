export function getErrorField(error: unknown, field: string): unknown {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  return (error as Record<string, unknown>)[field];
}

export function getErrorStatus(error: unknown): number | undefined {
  const status = getErrorField(error, "status");
  return typeof status === "number" ? status : undefined;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Unknown error",
): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export function getErrorProviderName(error: unknown): string | undefined {
  const providerName = getErrorField(error, "providerName");
  return typeof providerName === "string" ? providerName : undefined;
}
