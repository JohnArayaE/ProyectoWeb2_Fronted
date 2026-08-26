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
    return Boolean(
      token.value &&
      user.value
    )
  })

  async function login(
    credentials: LoginRequest
  ) {
    const response =
      await authService.login(
        credentials
      )

    token.value =
      response.data.token

    user.value =
      response.data.user

    saveSession()

    return response
  }

  async function register(
    data: RegisterRequest
  ) {
    const response =
      await authService.register(
        data
      )

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
        JSON.stringify(
          user.value
        )
      )
    }
  }

  function restoreLocalSession(): boolean {
    if (!import.meta.client) {
      return false
    }

    const storedToken =
      localStorage.getItem(
        "auth_token"
      )

    const storedUser =
      localStorage.getItem(
        "auth_user"
      )

    if (
      !storedToken ||
      !storedUser
    ) {
      return false
    }

    try {
      const parsedUser =
        JSON.parse(
          storedUser
        ) as AuthUser

      token.value =
        storedToken

      user.value =
        parsedUser

      return true
    } catch {
      return false
    }
  }

  async function verifySession() {
  if (!import.meta.client) {
    return false
  }

  const storedToken =
    localStorage.getItem(
      "auth_token"
    )

  const storedUser =
    localStorage.getItem(
      "auth_user"
    )

  if (
    !storedToken ||
    !storedUser
  ) {
    return false
  }

  return restoreLocalSession()
}

  function logout() {
    token.value = null
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem(
        "auth_token"
      )

      localStorage.removeItem(
        "auth_user"
      )
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    verifySession,
    restoreLocalSession,
    logout
  }
})