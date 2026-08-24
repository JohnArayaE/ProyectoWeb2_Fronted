import { defineStore } from "pinia"
import {
  EventServiceError,
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent
} from "~/services/eventService"
import type {
  CreateEventPayload,
  EventItem,
  EventPagination,
  ListEventsParams,
  UpdateEventPayload
} from "~/types/event"

interface EventsState {
  events: EventItem[]
  pagination: EventPagination | null
  loading: boolean
  error: string | null
  errorStatus: number | null
  lastParams: ListEventsParams
  selectedEvent: EventItem | null
  selectedLoading: boolean
  selectedError: string | null
  selectedErrorStatus: number | null
}

export const useEventsStore = defineStore("events", {
  state: (): EventsState => ({
    events: [],
    pagination: null,
    loading: false,
    error: null,
    errorStatus: null,
    lastParams: {},
    selectedEvent: null,
    selectedLoading: false,
    selectedError: null,
    selectedErrorStatus: null
  }),

  actions: {
    async fetchEvents(params: ListEventsParams = {}) {
      this.lastParams = params
      this.loading = true
      this.error = null
      this.errorStatus = null

      try {
        const data = await listEvents(params)
        this.events = data.events
        this.pagination = data.pagination
      } catch (error) {
        const serviceError = error as EventServiceError
        this.error = serviceError.message
        this.errorStatus = serviceError.status
      } finally {
        this.loading = false
      }
    },

    async fetchEvent(id: string) {
      this.selectedLoading = true
      this.selectedError = null
      this.selectedErrorStatus = null
      this.selectedEvent = null

      try {
        this.selectedEvent = await getEvent(id)
      } catch (error) {
        const serviceError = error as EventServiceError
        this.selectedError = serviceError.message
        this.selectedErrorStatus = serviceError.status
      } finally {
        this.selectedLoading = false
      }
    },

    async createEvent(payload: CreateEventPayload) {
      try {
        await createEvent(payload)
        await this.fetchEvents(this.lastParams)
        return { success: true as const }
      } catch (error) {
        const serviceError = error as EventServiceError
        return {
          success: false as const,
          message: serviceError.message,
          status: serviceError.status
        }
      }
    },

    async updateEvent(id: string, payload: UpdateEventPayload) {
      try {
        await updateEvent(id, payload)
        await this.fetchEvents(this.lastParams)
        return { success: true as const }
      } catch (error) {
        const serviceError = error as EventServiceError
        return {
          success: false as const,
          message: serviceError.message,
          status: serviceError.status
        }
      }
    },

    async deleteEvent(id: string) {
      try {
        await deleteEvent(id)
        await this.fetchEvents(this.lastParams)
        return { success: true as const }
      } catch (error) {
        const serviceError = error as EventServiceError
        return {
          success: false as const,
          message: serviceError.message,
          status: serviceError.status
        }
      }
    }
  }
})
