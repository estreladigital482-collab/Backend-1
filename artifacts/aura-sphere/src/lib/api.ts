let _getToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

export const getApiBase = () => "/api";

export const getAuthHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
});

export const getAuthHeadersAsync = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_getToken) {
    const token = await _getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
