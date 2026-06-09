export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'PetroMallis'

const DEFAULT_API_HOST = 'http://127.0.0.1:8001'
const API_V1_PATH = '/api/v1'

/** Normalize host URL and ensure /api/v1 suffix for production builds. */
function normalizeProductionApiUrl(rawUrl: string): string {
  const base = rawUrl.replace(/\/$/, '')
  return base.endsWith(API_V1_PATH) ? base : `${base}${API_V1_PATH}`
}

/**
 * In dev, use the Vite proxy (/api → backend) to avoid CORS and port mismatches.
 * In production, call the backend host from VITE_API_BASE_URL.
 */
function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return API_V1_PATH
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_HOST
  return normalizeProductionApiUrl(envUrl)
}

export const API_BASE_URL = resolveApiBaseUrl()

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  STATIONS: '/stations',
  SPACES: '/spaces',
  UTILITIES: '/utilities',
  PREFERRED_BRANDS: '/preferred-brands',
  IMAGES: '/images',
  PROFILE: '/profile',
} as const
