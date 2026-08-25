import { defineStore } from "pinia"
import {
  FavoriteServiceError,
  addFavorite,
  listFavorites,
  removeFavorite
} from "~/services/favoriteService"
import type { Favorite } from "~/types/favorite"

interface FavoritesState {
  favorites: Favorite[]
  loading: boolean
  error: string | null
  errorStatus: number | null
}

export const useFavoritesStore = defineStore("favorites", {
  state: (): FavoritesState => ({
    favorites: [],
    loading: false,
    error: null,
    errorStatus: null
  }),

  getters: {
    isFavorite: (state) => {
      return (eventId: string) =>
        state.favorites.some(favorite => favorite.event?.id === eventId)
    }
  },

  actions: {
    async fetchFavorites() {
      this.loading = true
      this.error = null
      this.errorStatus = null

      try {
        this.favorites = await listFavorites()
      } catch (error) {
        const serviceError = error as FavoriteServiceError
        this.error = serviceError.message
        this.errorStatus = serviceError.status
      } finally {
        this.loading = false
      }
    },

    async addFavorite(eventId: string) {
      try {
        await addFavorite(eventId)
        await this.fetchFavorites()
        return { success: true as const }
      } catch (error) {
        const serviceError = error as FavoriteServiceError
        return { success: false as const, message: serviceError.message, status: serviceError.status }
      }
    },

    async removeFavorite(eventId: string) {
      try {
        await removeFavorite(eventId)
        this.favorites = this.favorites.filter(
          favorite => favorite.event?.id !== eventId
        )
        return { success: true as const }
      } catch (error) {
        const serviceError = error as FavoriteServiceError
        return { success: false as const, message: serviceError.message, status: serviceError.status }
      }
    },

    async toggleFavorite(eventId: string) {
      if (this.isFavorite(eventId)) {
        return this.removeFavorite(eventId)
      }

      return this.addFavorite(eventId)
    }
  }
})
