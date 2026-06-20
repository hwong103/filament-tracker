import { describe, expect, it, vi } from "vitest";
import worker, { type Env } from "./worker";

function createEnv() {
  const all = vi.fn().mockResolvedValue({
    results: [
      {
        id: 1,
        brand: "Aster",
        color: "Ivory",
        type: "Basic",
        material: "PLA",
        amount: 1,
      },
    ],
  });
  const prepare = vi.fn().mockReturnValue({ all });

  return {
    env: {
      DB: { prepare } as unknown as D1Database,
      EDIT_TOKEN: "test-token",
      ALLOWED_ORIGINS: "https://example.com",
    } satisfies Env,
    prepare,
  };
}

describe("filament Worker authorization", () => {
  it("rejects inventory reads without a bearer token before querying D1", async () => {
    const { env, prepare } = createEnv();

    const response = await worker.fetch(
      new Request("https://tracker.example/api/filaments"),
      env
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(prepare).not.toHaveBeenCalled();
  });

  it("rejects invalid bearer tokens", async () => {
    const { env, prepare } = createEnv();

    const response = await worker.fetch(
      new Request("https://tracker.example/api/filaments", {
        headers: { Authorization: "Bearer wrong-token" },
      }),
      env
    );

    expect(response.status).toBe(401);
    expect(prepare).not.toHaveBeenCalled();
  });

  it("returns inventory for the shared passcode", async () => {
    const { env, prepare } = createEnv();

    const response = await worker.fetch(
      new Request("https://tracker.example/api/filaments", {
        headers: { Authorization: "Bearer test-token" },
      }),
      env
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({ brand: "Aster", material: "PLA" }),
    ]);
    expect(prepare).toHaveBeenCalledOnce();
  });

  it("continues to answer CORS preflight requests", async () => {
    const { env, prepare } = createEnv();

    const response = await worker.fetch(
      new Request("https://tracker.example/api/filaments", { method: "OPTIONS" }),
      env
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(prepare).not.toHaveBeenCalled();
  });
});
