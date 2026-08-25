import type { EventItem } from "~/types/event"

export interface Favorite {
  id: string
  user: string
  event: EventItem
  createdAt: string
  updatedAt: string
}
