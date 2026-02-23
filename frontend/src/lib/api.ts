import type {
  ApiError,
  Filament,
  FilamentDraft,
  OperationSource,
} from "../types/inventory";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function apiUrl(path: string) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
}

function buildApiError(
  source: OperationSource,
  status: number | null,
  message: string
): ApiError {
  return { source, status, message };
}

export function toApiError(
  error: unknown,
  source: OperationSource,
  fallback: string
): ApiError {
  if (
    typeof error === "object" &&
    error !== null &&
    "source" in error &&
    "message" in error &&
    "status" in error
  ) {
    return error as ApiError;
  }

  if (error instanceof Error) {
    return buildApiError(source, null, error.message || fallback);
  }

  return buildApiError(source, null, fallback);
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  source: OperationSource,
  fallbackMessage: string
): Promise<T> {
  const response = await fetch(apiUrl(path), init);

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      `${fallbackMessage} (${response.status})`
    );
    throw buildApiError(source, response.status, message);
  }

  return (await response.json()) as T;
}

export async function fetchFilaments(): Promise<Filament[]> {
  return requestJson<Filament[]>(
    "/api/filaments",
    { method: "GET" },
    "load",
    "Failed to load inventory"
  );
}

export async function verifyPasscode(token: string): Promise<void> {
  await requestJson<{ ok: boolean }>(
    "/api/auth/verify",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "authVerify",
    "Unable to verify passcode"
  );
}

export async function createFilament(
  payload: FilamentDraft,
  token: string
): Promise<Filament> {
  return requestJson<Filament>(
    "/api/filaments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
    "create",
    "Create failed"
  );
}

export async function updateFilament(
  id: number,
  payload: FilamentDraft,
  token: string
): Promise<Filament> {
  return requestJson<Filament>(
    `/api/filaments/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
    "update",
    "Update failed"
  );
}

export async function deleteFilament(id: number, token: string): Promise<void> {
  await requestJson<{ ok: boolean }>(
    `/api/filaments/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "delete",
    "Delete failed"
  );
}
