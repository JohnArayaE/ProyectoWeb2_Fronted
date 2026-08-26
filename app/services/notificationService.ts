import type {
  NotificationsResponse,
  NotificationResponse
} from "~/types/notification"

function getAuthToken(): string {
  if (!import.meta.client) {
    return ""
  }

  return localStorage.getItem("auth_token") || ""
}

export const notificationService = {
  async getMyNotifications(): Promise<NotificationsResponse> {
    const config = useRuntimeConfig()
    const token = getAuthToken()

    return await $fetch<NotificationsResponse>(
      `${config.public.apiBase}/api/users/me/notifications`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  },

  async markAsRead(
    notificationId: string
  ): Promise<NotificationResponse> {
    const config = useRuntimeConfig()
    const token = getAuthToken()

    return await $fetch<NotificationResponse>(
      `${config.public.apiBase}/api/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  }
}