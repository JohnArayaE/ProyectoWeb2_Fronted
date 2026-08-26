import { useAuthStore } from "~/stores/auth"

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()

  if (!navigator.onLine) {
    const localSession =
      authStore.restoreLocalSession()

    if (localSession) {
      return
    }
  }

  const sessionValid =
    await authStore.verifySession()

  if (!sessionValid) {
    return navigateTo("/login")
  }
})