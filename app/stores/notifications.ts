import { defineStore } from "pinia"
import { notificationService } from "~/services/notificationService"
import type { NotificationItem } from "~/types/notification"

export const useNotificationsStore = defineStore(
  "notifications",
  () => {
    const notifications = ref<NotificationItem[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const markingAsReadId = ref<string | null>(null)

    const unreadCount = computed(() => {
      return notifications.value.filter(
        notification => !notification.isRead
      ).length
    })

    async function fetchNotifications() {
      loading.value = true
      error.value = null

      try {
        const response =
          await notificationService.getMyNotifications()

        notifications.value =
          response.data.notifications

        return {
          success: true
        }
      } catch (err: any) {
        error.value =
          err?.data?.message ||
          "No fue posible cargar las notificaciones."

        return {
          success: false,
          message: error.value
        }
      } finally {
        loading.value = false
      }
    }

    async function markAsRead(
      notificationId: string
    ) {
      const notification =
        notifications.value.find(
          item => item.id === notificationId
        )

      if (!notification) {
        return {
          success: false,
          message: "La notificación no existe."
        }
      }

      if (notification.isRead) {
        return {
          success: true
        }
      }

      markingAsReadId.value = notificationId
      error.value = null

      try {
        const response =
          await notificationService.markAsRead(
            notificationId
          )

        notification.isRead =
          response.data.notification.isRead

        notification.readAt =
          response.data.notification.readAt

        if (
          response.data.notification.updatedAt
        ) {
          notification.updatedAt =
            response.data.notification.updatedAt
        }

        return {
          success: true
        }
      } catch (err: any) {
        error.value =
          err?.data?.message ||
          "No fue posible marcar la notificación como leída."

        return {
          success: false,
          message: error.value
        }
      } finally {
        markingAsReadId.value = null
      }
    }

    function clearNotifications() {
      notifications.value = []
      error.value = null
      markingAsReadId.value = null
    }

    return {
      notifications,
      loading,
      error,
      markingAsReadId,
      unreadCount,
      fetchNotifications,
      markAsRead,
      clearNotifications
    }
  }
)