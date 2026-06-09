import apiClient from './apiClient'

export interface HealthResponse {
  status: string
  app: string
  environment: string
  database: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health')
  return data
}
