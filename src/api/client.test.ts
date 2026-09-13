import { afterEach, expect, it, vi } from "vitest";
import { readRun, runCacheKey } from "./client";

afterEach(() => vi.unstubAllGlobals());
it("separates tenant and version cache identities", () => {
  expect(runCacheKey("a", "run", 1)).not.toEqual(runCacheKey("b", "run", 1));
  expect(runCacheKey("a", "run", 1)).not.toEqual(runCacheKey("a", "run", 2));
});
it.each([401, 403, 409, 500])(
  "preserves the HTTP %s failure without mock success",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ code: "DENIED" }), { status }),
        ),
    );
    await expect(readRun("tenant", "run")).rejects.toMatchObject({
      status,
      code: "DENIED",
    });
  },
);
it.each([null, {}, { id: "another-run" }])(
  "rejects incomplete or mismatched responses",
  async (data) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(data))),
    );
    await expect(readRun("tenant", "run")).rejects.toMatchObject({
      status: 502,
      code: "INVALID_RESPONSE",
    });
  },
);
it("passes the abort signal and tenant-scoped path", async () => {
  const response = {
    id: "run",
    state: "completed",
    mode: "operational",
    version: 1,
    cancel_requested: false,
    published_attempt_id: null,
  };
  const request = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(response)));
  vi.stubGlobal("fetch", request);
  const controller = new AbortController();
  await expect(readRun("tenant", "run", controller.signal)).resolves.toEqual(
    response,
  );
  expect(request).toHaveBeenCalledWith(
    "/api/v1/tenants/tenant/runs/run",
    expect.objectContaining({
      signal: controller.signal,
      credentials: "same-origin",
    }),
  );
});
