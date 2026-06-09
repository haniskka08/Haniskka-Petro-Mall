import apiClient from './apiClient'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  full_name: string; email: string; phone: string
  company_name: string; password: string; confirm_password: string
}
export interface TokenOut {
  access_token: string; token_type: string
  dealer_id: number; full_name: string; email: string
}
export interface DealerOut {
  id: number; full_name: string; email: string
  phone: string; company_name: string; address?: string; is_active: boolean
}
export interface DealerUpdate {
  full_name?: string; phone?: string; company_name?: string; address?: string
}
export interface PasswordChange {
  current_password: string; new_password: string; confirm_password: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<TokenOut> {
    const form = new URLSearchParams()
    form.append('username', payload.email)
    form.append('password', payload.password)
    const { data } = await apiClient.post<TokenOut>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  async register(payload: RegisterPayload): Promise<DealerOut> {
    const { data } = await apiClient.post<DealerOut>('/auth/register', payload)
    return data
  },

  async getMe(): Promise<DealerOut> {
    const { data } = await apiClient.get<DealerOut>('/auth/me')
    return data
  },

  async updateProfile(payload: DealerUpdate): Promise<DealerOut> {
    const { data } = await apiClient.put<DealerOut>('/dealers/me', payload)
    return data
  },

  async changePassword(payload: PasswordChange): Promise<{ message: string }> {
    const { data } = await apiClient.put('/dealers/me/password', payload)
    return data
  },
}
