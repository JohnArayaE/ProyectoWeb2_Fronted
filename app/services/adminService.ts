import type { AuthUser } from "~/types/auth"

interface UsersResponse {
  success: boolean
  data: {
    users: AuthUser[]
  }
}

export const adminService = {

  async getUsers(): Promise<UsersResponse> {

    const config = useRuntimeConfig()

    const token = localStorage.getItem(
      "auth_token"
    )

    return await $fetch<UsersResponse>(
      `${config.public.apiBase}/api/users`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

  }

}