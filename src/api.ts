/**
 * API base URL for the multiplayer backend.
 *
 * - In development: empty string → fetch('/api/...') hits the local Express
 *   server on localhost:3000 via Vite's proxy-less relative paths.
 * - In production: set VITE_API_BASE_URL to the deployed backend URL
 *   (e.g. 'https://your-app.onrender.com') so the static frontend on
 *   Cloudflare Pages can reach the server.
 *
 * Set this in your Cloudflare Pages environment variables:
 *   VITE_API_BASE_URL = https://your-render-app.onrender.com
 */
export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
