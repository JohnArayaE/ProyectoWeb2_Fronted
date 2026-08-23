import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  MeResponse
} from "~/types/auth"

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const config = useRuntimeConfig()

    return await $fetch<AuthResponse>(
      `${config.public.apiBase}/api/auth/login`,
      {
        method: "POST",
        body: credentials
      }
    )
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const config = useRuntimeConfig()

    return await $fetch<AuthResponse>(
      `${config.public.apiBase}/api/auth/register`,
      {
        method: "POST",
        body: data
      }
    )
  },

  async getMe(token: string): Promise<MeResponse> {
    const config = useRuntimeConfig()

    return await $fetch<MeResponse>(
      `${config.public.apiBase}/api/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  }
}