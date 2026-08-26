import type {
  CreateEventPayload,
  EventItem,
  EventPagination,
  ListEventsParams,
  UpdateEventPayload
} from "~/types/event"

export class EventServiceError extends Error {
  status: number
  isNetworkError: boolean

  constructor(
    status: number,
    message: string,
    isNetworkError = false
  ) {
    super(message)

    this.status = status
    this.isNetworkError = isNetworkError
    this.name = "EventServiceError"
  }
}

interface ApiSuccess<T> {
  success: true
  message?: string
  data: T
}

interface ListEventsData {
  events: EventItem[]
  pagination: EventPagination
}

interface SingleEventData {
  event: EventItem
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
    throw new EventServiceError(
      401,
      "Necesitás iniciar sesión para continuar."
    )
  }

  return {
    Authorization: `Bearer ${token}`
  }
}

function defaultMessageFor(
  status: number
): string {
  if (status === 401) {
    return "Tu sesión expiró o no iniciaste sesión. Volvé a iniciar sesión."
  }

  if (status === 403) {
    return "No tenés permisos para realizar esta acción."
  }

  if (status === 404) {
    return "La actividad no existe o no está disponible."
  }

  if (status === 400) {
    return "Los datos ingresados no son válidos."
  }

  return "Ocurrió un error al comunicarse con el servidor."
}

function normalizeError(
  error: unknown
): EventServiceError {
  if (error instanceof EventServiceError) {
    return error
  }

  const fetchError = error as {
    status?: number
    statusCode?: number
    message?: string
    response?: {
      status?: number
      _data?: {
        message?: string
      }
    }
  }

  const responseStatus =
    fetchError.response?.status

  const hasRealHttpResponse =
    typeof responseStatus === "number" &&
    responseStatus > 0

  if (!hasRealHttpResponse) {
    return new EventServiceError(
      0,
      "No hay conexión a Internet.",
      true
    )
  }

  const status = responseStatus

  const message =
    fetchError.response?._data?.message ??
    defaultMessageFor(status)

  return new EventServiceError(
    status,
    message,
    false
  )
}

export async function listEvents(
  params: ListEventsParams = {}
): Promise<ListEventsData> {
  const config = useRuntimeConfig()

  try {
    const response =
      await $fetch<ApiSuccess<ListEventsData>>(
        "/api/events",
        {
          baseURL: config.public.apiBase,

          headers: authHeaders(),

          query: {
            page: params.page,
            limit: params.limit,
            mine: params.mine,
            category: params.category,
            date: params.date,
            location: params.location,
            organizer: params.organizer,
            available: params.available,
            search: params.search
          }
        }
      )

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function getEvent(
  id: string
): Promise<EventItem> {
  const config = useRuntimeConfig()

  try {
    const response =
      await $fetch<ApiSuccess<SingleEventData>>(
        `/api/events/${id}`,
        {
          baseURL: config.public.apiBase,
          headers: authHeaders()
        }
      )

    return response.data.event
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function createEvent(
  data: CreateEventPayload
): Promise<EventItem> {
  const config = useRuntimeConfig()

  try {
    const response =
      await $fetch<ApiSuccess<SingleEventData>>(
        "/api/events",
        {
          method: "POST",
          baseURL: config.public.apiBase,
          headers: authHeaders(),
          body: data
        }
      )

    return response.data.event
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function updateEvent(
  id: string,
  data: UpdateEventPayload
): Promise<EventItem> {
  const config = useRuntimeConfig()

  try {
    const response =
      await $fetch<ApiSuccess<SingleEventData>>(
        `/api/events/${id}`,
        {
          method: "PUT",
          baseURL: config.public.apiBase,
          headers: authHeaders(),
          body: data
        }
      )

    return response.data.event
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function deleteEvent(
  id: string
): Promise<void> {
  const config = useRuntimeConfig()

  try {
    await $fetch(
      `/api/events/${id}`,
      {
        method: "DELETE",
        baseURL: config.public.apiBase,
        headers: authHeaders()
      }
    )
  } catch (error) {
    throw normalizeError(error)
  }
}