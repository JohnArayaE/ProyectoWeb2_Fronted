import { useAuthStore } from "~/stores/auth"

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()

  const sessionValid = await authStore.verifySession()

  if (!sessionValid) {
    return navigateTo("/login", {
      external: true
    })
  }
})