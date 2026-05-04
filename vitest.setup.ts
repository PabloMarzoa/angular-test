import { vi } from 'vitest';

// Mock fetch globally to handle relative paths in tests and avoid ERR_INVALID_URL
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string' && input.startsWith('i18n/')) {
    // For i18n files, we return a mock response to avoid network calls and invalid URL errors
    return {
      ok: true,
      json: async () => ({}),
      status: 200,
    } as Response;
  }
  return originalFetch(input, init);
};

// Also mock btoa/atob for environments that don't have it (like older Node)
if (typeof btoa === 'undefined') {
  (globalThis as any).btoa = (str: string) => Buffer.from(str).toString('base64');
  (globalThis as any).atob = (str: string) => Buffer.from(str, 'base64').toString();
}
