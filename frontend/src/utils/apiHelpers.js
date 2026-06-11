export function normalizeListResponse(response) {
  if (!response) return [];

  // Support arrays directly
  if (Array.isArray(response)) {
    return response;
  }

  const data = response.data ?? response;
  if (!data) return [];
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}
