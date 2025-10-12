export interface TimedFetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Fetch wrapper that enforces a timeout using AbortController.
 * Defaults to 8000 ms to keep serverless functions from idling too long.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: TimedFetchOptions = {},
): Promise<Response> {
  const { timeoutMs = 8000, ...rest } = init;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...rest, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
