export const getApiRoot = () => {
  if (typeof window !== "undefined" && window.__ENV__?.API_URL) {
    return window.__ENV__.API_URL.replace(/\/+$/, '');
  }
  const viteUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  if (viteUrl) {
    return viteUrl.replace(/\/+$/, '');
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://project-work-sync-backend.vercel.app";
  }
  return "http://localhost:8081";
};

export const API_ROOT = getApiRoot();
export default getApiRoot;
