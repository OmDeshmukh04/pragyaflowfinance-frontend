import type { components } from "./schema";

// Future integration boundary, deliberately NOT imported by the demo adapter.
// Missing endpoints are not simulated here. Server-side identity/RLS remain required.
export type RunStatus = components["schemas"]["RunStatusResponse"];
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export const runCacheKey = (tenant: string, run: string, version: number) =>
  ["tenant", tenant, "run", run, version] as const;
export async function readRun(
  tenant: string,
  run: string,
  signal?: AbortSignal,
): Promise<RunStatus> {
  const response = await fetch(
    `/api/v1/tenants/${encodeURIComponent(tenant)}/runs/${encodeURIComponent(run)}`,
    {
      signal,
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      code?: string;
    } | null;
    throw new ApiError(
      response.status,
      body?.code ?? "REQUEST_FAILED",
      response.status === 409
        ? "This run changed. Refresh before resubmitting."
        : response.status === 401
          ? "Your session expired. Sign in again."
          : response.status === 403
            ? "You do not have access to this run."
            : "The run could not be loaded. Try again.",
    );
  }
  const data: unknown = await response.json().catch(() => null);
  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    data.id !== run ||
    !("state" in data) ||
    typeof data.state !== "string" ||
    !("mode" in data) ||
    typeof data.mode !== "string" ||
    !("cancel_requested" in data) ||
    typeof data.cancel_requested !== "boolean" ||
    !("published_attempt_id" in data) ||
    !(
      data.published_attempt_id === null ||
      typeof data.published_attempt_id === "string"
    ) ||
    !("version" in data) ||
    typeof data.version !== "number" ||
    !Number.isSafeInteger(data.version) ||
    data.version < 1
  ) {
    throw new ApiError(
      502,
      "INVALID_RESPONSE",
      "The server returned an invalid run.",
    );
  }
  return data as RunStatus;
}
