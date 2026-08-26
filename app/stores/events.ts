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

interface EventsCache {
  events: EventItem[]
  pagination: EventPagination | null
  savedAt: string
}

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
  isOffline: boolean
  usingCachedEvents: boolean
}

const EVENTS_CACHE_KEY =
  "communityhub_events_cache"

export const useEventsStore = defineStore(
  "events",
  {
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
      selectedErrorStatus: null,
      isOffline: false,
      usingCachedEvents: false
    }),

    actions: {
      saveEventsToCache() {
        if (!import.meta.client) {
          return
        }

        try {
          const cache: EventsCache = {
            events: this.events,
            pagination: this.pagination,
            savedAt: new Date().toISOString()
          }

          localStorage.setItem(
            EVENTS_CACHE_KEY,
            JSON.stringify(cache)
          )
        } catch (error) {
          console.error(
            "No fue posible guardar las actividades",
            error
          )
        }
      },

      loadEventsFromCache(): boolean {
        if (!import.meta.client) {
          return false
        }

        try {
          const savedCache =
            localStorage.getItem(
              EVENTS_CACHE_KEY
            )

          if (!savedCache) {
            return false
          }

          const cache =
            JSON.parse(
              savedCache
            ) as EventsCache

          if (
            !Array.isArray(
              cache.events
            )
          ) {
            return false
          }

          this.events =
            cache.events

          this.pagination =
            cache.pagination

          this.usingCachedEvents =
            true

          return true
        } catch (error) {
          console.error(
            "No fue posible cargar las actividades guardadas",
            error
          )

          return false
        }
      },

      updateConnectionStatus() {
        if (!import.meta.client) {
          return
        }

        this.isOffline =
          !navigator.onLine
      },

      async fetchEvents(
        params: ListEventsParams = {}
      ) {
        this.lastParams = params
        this.loading = true
        this.error = null
        this.errorStatus = null
        this.usingCachedEvents = false

        this.updateConnectionStatus()

        if (this.isOffline) {
          const cacheLoaded =
            this.loadEventsFromCache()

          if (!cacheLoaded) {
            this.events = []
            this.pagination = null

            this.error =
              "No hay conexión a Internet y todavía no existen actividades guardadas."

            this.errorStatus = 0
          }

          this.loading = false
          return
        }

        try {
          const data =
            await listEvents(
              params
            )

          this.events =
            data.events

          this.pagination =
            data.pagination

          this.isOffline =
            false

          this.usingCachedEvents =
            false

          this.saveEventsToCache()
        } catch (error) {
          const serviceError =
            error as EventServiceError

          this.updateConnectionStatus()

          if (
            serviceError.isNetworkError ||
            serviceError.status === 0 ||
            this.isOffline
          ) {
            this.isOffline = true

            const cacheLoaded =
              this.loadEventsFromCache()

            if (!cacheLoaded) {
              this.events = []
              this.pagination = null

              this.error =
                "No hay conexión a Internet y todavía no existen actividades guardadas."

              this.errorStatus = 0
            }

            return
          }

          this.error =
            serviceError.message

          this.errorStatus =
            serviceError.status
        } finally {
          this.loading = false
        }
      },

      async fetchEvent(
        id: string
      ) {
        this.selectedLoading = true
        this.selectedError = null
        this.selectedErrorStatus = null
        this.selectedEvent = null

        try {
          this.selectedEvent =
            await getEvent(
              id
            )
        } catch (error) {
          const serviceError =
            error as EventServiceError

          this.selectedError =
            serviceError.message

          this.selectedErrorStatus =
            serviceError.status
        } finally {
          this.selectedLoading = false
        }
      },

      async createEvent(
        payload: CreateEventPayload
      ) {
        try {
          await createEvent(
            payload
          )

          await this.fetchEvents(
            this.lastParams
          )

          return {
            success: true as const
          }
        } catch (error) {
          const serviceError =
            error as EventServiceError

          return {
            success: false as const,
            message:
              serviceError.message,
            status:
              serviceError.status
          }
        }
      },

      async updateEvent(
        id: string,
        payload: UpdateEventPayload
      ) {
        try {
          await updateEvent(
            id,
            payload
          )

          await this.fetchEvents(
            this.lastParams
          )

          return {
            success: true as const
          }
        } catch (error) {
          const serviceError =
            error as EventServiceError

          return {
            success: false as const,
            message:
              serviceError.message,
            status:
              serviceError.status
          }
        }
      },

      async deleteEvent(
        id: string
      ) {
        try {
          await deleteEvent(
            id
          )

          await this.fetchEvents(
            this.lastParams
          )

          return {
            success: true as const
          }
        } catch (error) {
          const serviceError =
            error as EventServiceError

          return {
            success: false as const,
            message:
              serviceError.message,
            status:
              serviceError.status
          }
        }
      }
    }
  }
)