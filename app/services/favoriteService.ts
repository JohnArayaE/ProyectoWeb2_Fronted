import type { Favorite } from "~/types/favorite"

interface RawFavorite {
  id: string
  user: string
  event: unknown
  createdAt: string
  updatedAt: string
}

function normalizeFavorite(raw: RawFavorite): Favorite {
  const rawEvent = raw.event as (Record<string, unknown> & { _id?: string, id?: string }) | string

  if (typeof rawEvent === "string" || !rawEvent) {
    return raw as unknown as Favorite
  }

  return {
    ...raw,
    event: {
      ...rawEvent,
      id: rawEvent.id ?? rawEvent._id
    }
  } as Favorite
}

export class FavoriteServiceError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "FavoriteServiceError"
  }
}

interface ApiSuccess<T> {
  success: true
  message?: string
  data: T
}

interface ListFavoritesData {
  favorites: Favorite[]
}

interface SingleFavoriteData {
  favorite: Favorite
}

function getAuthToken(): string {
  if (!import.meta.client) {
    return ""
  }

  return localStorage.getItem("auth_token") || ""
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()

  if (!token) {
    throw new FavoriteServiceError(
      401,
      "Necesitás iniciar sesión para continuar."
    )
  }

  return {
    Authorization: `Bearer ${token}`
  }
}

function defaultMessageFor(status: number): string {
  if (status === 401) {
    return "Tu sesión expiró o no iniciaste sesión. Volvé a iniciar sesión."
  }

  if (status === 404) {
    return "El evento no existe o no está en tus favoritos."
  }

  if (status === 400) {
    return "El evento no está disponible para agregar a favoritos."
  }

  if (status === 409) {
    return "El evento ya está en tus favoritos."
  }

  return "Ocurrió un error al comunicarse con el servidor."
}

function normalizeError(error: unknown): FavoriteServiceError {
  if (error instanceof FavoriteServiceError) {
    return error
  }

  const fetchError = error as {
    response?: { status?: number, _data?: { message?: string } }
  }

  const status = fetchError.response?.status ?? 500
  const message =
    fetchError.response?._data?.message ?? defaultMessageFor(status)

  return new FavoriteServiceError(status, message)
}

export async function listFavorites(): Promise<Favorite[]> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<ListFavoritesData>>(
      "/api/users/me/favorites",
      {
        baseURL: config.public.apiBase,
        headers: authHeaders()
      }
    )

    return response.data.favorites.map(favorite =>
      normalizeFavorite(favorite as unknown as RawFavorite)
    )
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function addFavorite(eventId: string): Promise<Favorite> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<SingleFavoriteData>>(
      `/api/events/${eventId}/favorite`,
      {
        method: "POST",
        baseURL: config.public.apiBase,
        headers: authHeaders()
      }
    )

    return response.data.favorite
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function removeFavorite(eventId: string): Promise<void> {
  const config = useRuntimeConfig()

  try {
    await $fetch(`/api/events/${eventId}/favorite`, {
      method: "DELETE",
      baseURL: config.public.apiBase,
      headers: authHeaders()
    })
  } catch (error) {
    throw normalizeError(error)
  }
}
