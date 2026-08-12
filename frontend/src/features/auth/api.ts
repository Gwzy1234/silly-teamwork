import { apiClient } from '../../api/client'
import { createApiError } from '../../api/errors'
import type { LoginRequest, RegisterRequest, TokenResponse, User } from './types'

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data, error, response } = await apiClient.POST('/api/v1/auth/login', {
    body: payload,
  })
  if (!data) {
    throw createApiError(response, error)
  }
  return data
}

export async function register(payload: RegisterRequest): Promise<User> {
  const { data, error, response } = await apiClient.POST('/api/v1/auth/register', {
    body: payload,
  })
  if (!data) {
    throw createApiError(response, error)
  }
  return data
}

export async function getCurrentUser(accessToken?: string): Promise<User> {
  const { data, error, response } = await apiClient.GET('/api/v1/users/me', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })
  if (!data) {
    throw createApiError(response, error)
  }
  return data
}
