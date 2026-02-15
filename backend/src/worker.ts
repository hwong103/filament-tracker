export interface Env {
  DB: D1Database;
  EDIT_TOKEN: string;
  ALLOWED_ORIGINS?: string;
}

type FilamentInput = {
  brand: string;
  color: string;
  type: string;
  material: string;
  amount: number;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function getAllowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!origin) {
    return allowed.length === 0 ? "*" : allowed[0];
  }

  if (allowed.length === 0) {
    return "*";
  }

  if (allowed.includes("*")) {
    return "*";
  }

  return allowed.includes(origin) ? origin : "null";
}

function withCors(request: Request, env: Env, headers: HeadersInit = {}) {
  const origin = getAllowedOrigin(request, env);
  return {
    ...headers,
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function jsonResponse(
  request: Request,
  env: Env,
  body: unknown,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: withCors(request, env, JSON_HEADERS),
  });
}

function badRequest(request: Request, env: Env, message: string) {
  return jsonResponse(request, env, { error: message }, 400);
}

function unauthorized(request: Request, env: Env) {
  return jsonResponse(request, env, { error: "Unauthorized" }, 401);
}

function parseAuthToken(request: Request) {
  const header = request.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function requireAuth(request: Request, env: Env) {
  const token = parseAuthToken(request);
  if (!token || token !== env.EDIT_TOKEN) {
    return unauthorized(request, env);
  }
  return null;
}

function normalizeInput(payload: unknown): FilamentInput | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const brand = String(data.brand || "").trim();
  const color = String(data.color || "").trim();
  const type = String(data.type || "").trim();
  const material = String(data.material || "").trim();
  const amount = Number(data.amount);

  if (!brand || !color || !type || !material) return null;
  if (!Number.isFinite(amount) || amount < 0) return null;

  return { brand, color, type, material, amount };
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: withCors(request, env),
      });
    }

    if (path === "/api/auth/verify" && request.method === "GET") {
      const authError = requireAuth(request, env);
      if (authError) return authError;
      return jsonResponse(request, env, { ok: true });
    }

    if (path === "/api/filaments") {
      if (request.method === "GET") {
        const result = await env.DB.prepare(
          "SELECT * FROM filaments ORDER BY brand ASC, color ASC"
        ).all();
        return jsonResponse(request, env, result.results ?? []);
      }

      if (request.method === "POST") {
        const authError = requireAuth(request, env);
        if (authError) return authError;

        const payload = await request.json().catch(() => null);
        const input = normalizeInput(payload);
        if (!input) {
          return badRequest(request, env, "Invalid filament data");
        }

        const now = new Date().toISOString();
        const insert = await env.DB.prepare(
          `INSERT INTO filaments (brand, color, type, material, amount, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            input.brand,
            input.color,
            input.type,
            input.material,
            input.amount,
            now,
            now
          )
          .run();

        const id = Number(insert.meta.last_row_id);
        const row = await env.DB.prepare("SELECT * FROM filaments WHERE id = ?")
          .bind(id)
          .first();
        return jsonResponse(request, env, row ?? { id });
      }
    }

    if (path.startsWith("/api/filaments/")) {
      const idPart = path.replace("/api/filaments/", "");
      const id = Number(idPart);
      if (!Number.isInteger(id)) {
        return badRequest(request, env, "Invalid filament id");
      }

      if (request.method === "PUT") {
        const authError = requireAuth(request, env);
        if (authError) return authError;

        const payload = await request.json().catch(() => null);
        const input = normalizeInput(payload);
        if (!input) {
          return badRequest(request, env, "Invalid filament data");
        }

        const now = new Date().toISOString();
        const update = await env.DB.prepare(
          `UPDATE filaments
           SET brand = ?, color = ?, type = ?, material = ?, amount = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            input.brand,
            input.color,
            input.type,
            input.material,
            input.amount,
            now,
            id
          )
          .run();

        if (update.meta.changes === 0) {
          return jsonResponse(request, env, { error: "Not found" }, 404);
        }

        const row = await env.DB.prepare("SELECT * FROM filaments WHERE id = ?")
          .bind(id)
          .first();
        return jsonResponse(request, env, row ?? { id });
      }

      if (request.method === "DELETE") {
        const authError = requireAuth(request, env);
        if (authError) return authError;

        const result = await env.DB.prepare("DELETE FROM filaments WHERE id = ?")
          .bind(id)
          .run();

        if (result.meta.changes === 0) {
          return jsonResponse(request, env, { error: "Not found" }, 404);
        }

        return jsonResponse(request, env, { ok: true });
      }
    }

    return new Response("Not found", {
      status: 404,
      headers: withCors(request, env),
    });
  },
};
