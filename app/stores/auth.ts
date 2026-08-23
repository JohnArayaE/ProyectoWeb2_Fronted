import { defineStore } from "pinia"

import type {
  AuthUser,
  LoginRequest,
  RegisterRequest
} from "~/types/auth"

import { authService } from "~/services/authService"

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => {
    return Boolean(token.value && user.value)
  })

  async function login(credentials: LoginRequest) {
    const response = await authService.login(credentials)

    token.value = response.data.token
    user.value = response.data.user

    saveSession()

    return response
  }

  async function register(data: RegisterRequest) {
    const response = await authService.register(data)

    token.value = response.data.token
    user.value = response.data.user

    saveSession()

    return response
  }

  function saveSession() {
    if (!import.meta.client) {
      return
    }

    if (token.value) {
      localStorage.setItem(
        "auth_token",
        token.value
      )
    }

    if (user.value) {
      localStorage.setItem(
        "auth_user",
        JSON.stringify(user.value)
      )
    }
  }

  async function verifySession() {
    if (!import.meta.client) {
      return false
    }

    const storedToken = localStorage.getItem("auth_token")

    if (!storedToken) {
      logout()
      return false
    }

    try {
      token.value = storedToken

      const response = await authService.getMe(storedToken)

      user.value = response.data.user

      localStorage.setItem(
        "auth_user",
        JSON.stringify(response.data.user)
      )

      return true
    } catch {
      logout()
      return false
    }
  }

  function logout() {
    token.value = null
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    verifySession,
    logout
  }
})