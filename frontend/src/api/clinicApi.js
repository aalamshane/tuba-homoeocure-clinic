export const api = {
  get: async (path) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  },
  post: async (path, payload) => {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json();
  },
  put: async (path, payload) => {
    const response = await fetch(path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json();
  },
  delete: async (path) => {
    const response = await fetch(path, {
      method: "DELETE"
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }
  }
};

export async function requestTable(resource, { query, page, size, sortBy, sortDirection }) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    size: String(size),
    sortBy,
    sortDirection
  });

  return api.get(`/api/${resource}?${params.toString()}`);
}
