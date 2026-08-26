export type NotificationType =
  | "registration"
  | "event-update"
  | "event-cancelled"
  | "event-reminder"
  | "system"

export type NotificationEventModality =
  | "in-person"
  | "virtual"
  | "hybrid"

export type NotificationEventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed"

export interface NotificationEventLocation {
  name?: string | null
  address?: string | null
  virtualUrl?: string | null
}

export interface NotificationEvent {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  modality: NotificationEventModality
  location?: NotificationEventLocation | null
  imageUrl?: string | null
  status: NotificationEventStatus
  isActive: boolean
}

export interface NotificationItem {
  id: string
  recipient: string
  event: NotificationEvent | string | null
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  readAt: string | null
  createdAt?: string
  updatedAt?: string
}

export interface NotificationsResponse {
  success: boolean
  message?: string
  data: {
    notifications: NotificationItem[]
  }
}

export interface NotificationResponse {
  success: boolean
  message: string
  data: {
    notification: NotificationItem
  }
}