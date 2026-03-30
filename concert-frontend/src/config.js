// Backend URL configuration
// Uses environment variable VITE_API_URL or defaults to localhost

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const config = {
  API_URL: `${API_BASE_URL}/api/concerts`,
  SOCKET_URL: API_BASE_URL,
};

console.log("🔧 Frontend Config - Backend:", config.SOCKET_URL);
