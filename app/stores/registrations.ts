import { defineStore } from "pinia"
import {
  RegistrationServiceError,
  register as registerToEvent,
  cancelRegistration as cancelEventRegistration,
  listMyRegistrations
} from "~/services/registrationService"
import type { Registration } from "~/types/registration"

interface RegistrationsState {
  registrations: Registration[]
  loading: boolean
  error: string | null
  errorStatus: number | null
}

export const useRegistrationsStore = defineStore("registrations", {
  state: (): RegistrationsState => ({
    registrations: [],
    loading: false,
    error: null,
    errorStatus: null
  }),

  getters: {
    isRegistered: (state) => {
      return (eventId: string) =>
        state.registrations.some(
          registration =>
            registration.event?.id === eventId &&
            registration.status === "registered"
        )
    }
  },

  actions: {
    async fetchMyRegistrations() {
      this.loading = true
      this.error = null
      this.errorStatus = null

      try {
        this.registrations = await listMyRegistrations()
      } catch (error) {
        const serviceError = error as RegistrationServiceError
        this.error = serviceError.message
        this.errorStatus = serviceError.status
      } finally {
        this.loading = false
      }
    },

    async register(eventId: string) {
      try {
        await registerToEvent(eventId)
        await this.fetchMyRegistrations()
        return { success: true as const }
      } catch (error) {
        const serviceError = error as RegistrationServiceError
        return { success: false as const, message: serviceError.message, status: serviceError.status }
      }
    },

    async cancelRegistration(eventId: string) {
      try {
        await cancelEventRegistration(eventId)
        await this.fetchMyRegistrations()
        return { success: true as const }
      } catch (error) {
        const serviceError = error as RegistrationServiceError
        return { success: false as const, message: serviceError.message, status: serviceError.status }
      }
    },

    async toggleRegistration(eventId: string) {
      if (this.isRegistered(eventId)) {
        return this.cancelRegistration(eventId)
      }

      return this.register(eventId)
    }
  }
})
