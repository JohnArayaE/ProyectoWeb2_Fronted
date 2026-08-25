import type { EventItem } from "~/types/event"

export type RegistrationStatus = "registered" | "cancelled" | "attended"

export interface Registration {
  id: string
  user: string
  event: EventItem
  status: RegistrationStatus
  registeredAt: string
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RegistrationParticipantUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface RegistrationParticipant {
  id: string
  user: RegistrationParticipantUser | string
  event: string
  status: RegistrationStatus
  registeredAt: string
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}
