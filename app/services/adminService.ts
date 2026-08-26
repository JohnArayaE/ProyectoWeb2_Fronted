import type { AuthUser } from "~/types/auth"

export interface AdminUser extends AuthUser {}

interface UsersResponse {
  success: boolean
  message: string
  data: {
    users: AdminUser[]
  }
}

interface UserResponse {
  success: boolean
  message?: string
  data: {
    user: AdminUser
  }
}

export interface AdminStats {
  totalUsers: number
  totalOrganizers: number
  totalEvents: number
  activeEvents: number
  completedEvents: number
  totalRegistrations: number
}

interface StatsResponse {
  success: boolean
  message?: string
  data: AdminStats
}

function getAuthToken(): string {
  if (!import.meta.client) {
    return ""
  }

  return localStorage.getItem("auth_token") || ""
}

export const adminService = {
  async getUsers(): Promise<UsersResponse> {
    const config = useRuntimeConfig()
    const token = getAuthToken()

    return await $fetch<UsersResponse>(
      `${config.public.apiBase}/api/users`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  },

  async getStats(): Promise<StatsResponse> {
    const config = useRuntimeConfig()
    const token = getAuthToken()

    return await $fetch<StatsResponse>(
      `${config.public.apiBase}/api/users/stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  },

  async getUserById(
    userId: string
  ): Promise<UserResponse> {
    const config = useRuntimeConfig()
    const token = getAuthToken()

    return await $fetch<UserResponse>(
      `${config.public.apiBase}/api/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  },

  async updateUserRole(
    userId: string,
    role: "admin" | "organizer" | "user"
  ): Promise<UserResponse> {
    const config = useRuntimeConfig()
    const token = getAuthToken()

    return await $fetch<UserResponse>(
      `${config.public.apiBase}/api/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          role
        }
      }
    )
  },

  async updateUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<UserResponse> {
    const config = useRuntimeConfig()
    const token = getAuthToken()

    return await $fetch<UserResponse>(
      `${config.public.apiBase}/api/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          isActive
        }
      }
    )
  }
}