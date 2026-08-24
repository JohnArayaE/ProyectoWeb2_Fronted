export type EventModality = "in-person" | "virtual" | "hybrid"

export type EventStatus = "draft" | "published" | "cancelled" | "completed"

export interface EventLocation {
  name?: string
  address?: string
  virtualUrl?: string | null
}

export interface EventItem {
  id: string
  title: string
  description: string
  category: string
  organizer: string
  startDate: string
  endDate: string
  modality: EventModality
  location: EventLocation
  capacity: number
  imageUrl: string | null
  status: EventStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EventPagination {
  page: number
  limit: number
  totalEvents: number
  totalPages: number
}

export interface ListEventsParams {
  page?: number
  limit?: number
  mine?: boolean
}

export interface CreateEventPayload {
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  modality?: EventModality
  location?: EventLocation
  capacity: number
  imageUrl?: string
  status?: EventStatus
}

export interface UpdateEventPayload {
  title?: string
  description?: string
  category?: string
  startDate?: string
  endDate?: string
  modality?: EventModality
  location?: EventLocation
  capacity?: number
  imageUrl?: string
  status?: EventStatus
  isActive?: boolean
}
