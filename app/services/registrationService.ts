import type {
  Registration,
  RegistrationParticipant,
  RegistrationStatus
} from "~/types/registration"

interface RawRegistration {
  id: string
  user: string
  event: unknown
  status: RegistrationStatus
  registeredAt: string
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

function normalizeRegistration(raw: RawRegistration): Registration {
  const rawEvent = raw.event as (Record<string, unknown> & { _id?: string, id?: string }) | string

  if (typeof rawEvent === "string" || !rawEvent) {
    return raw as unknown as Registration
  }

  return {
    ...raw,
    event: {
      ...rawEvent,
      id: rawEvent.id ?? rawEvent._id
    }
  } as Registration
}

interface RawParticipant {
  id: string
  user: unknown
  event: string
  status: RegistrationStatus
  registeredAt: string
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

function normalizeParticipant(raw: RawParticipant): RegistrationParticipant {
  const rawUser = raw.user as (Record<string, unknown> & { _id?: string, id?: string }) | string

  if (typeof rawUser === "string" || !rawUser) {
    return raw as unknown as RegistrationParticipant
  }

  return {
    ...raw,
    user: {
      ...rawUser,
      id: rawUser.id ?? rawUser._id
    }
  } as unknown as RegistrationParticipant
}

export class RegistrationServiceError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "RegistrationServiceError"
  }
}

interface ApiSuccess<T> {
  success: true
  message?: string
  data: T
}

interface ListRegistrationsData {
  registrations: RawRegistration[]
}

interface SingleRegistrationData {
  registration: RawRegistration
}

interface ListParticipantsData {
  registrations: RawParticipant[]
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
    throw new RegistrationServiceError(
      401,
      "Necesitás iniciar sesión para continuar."
    )
  }

  return {
    Authorization: `Bearer ${token}`
  }
}

type ErrorContext = "register" | "cancel" | "participants" | "list"

function defaultMessageFor(status: number, context: ErrorContext): string {
  if (status === 401) {
    return "Tu sesión expiró o no iniciaste sesión. Volvé a iniciar sesión."
  }

  if (status === 403) {
    return "No tenés permisos para ver los participantes de esta actividad."
  }

  if (status === 400) {
    return "Este evento no está disponible para inscripciones."
  }

  if (status === 409) {
    return context === "cancel"
      ? "Esa inscripción ya se encuentra cancelada."
      : "Ya estás inscripto en este evento, o el evento ya no tiene cupo disponible."
  }

  if (status === 404) {
    if (context === "cancel") {
      return "No estás inscripto en este evento."
    }

    return "El evento no existe o no está disponible."
  }

  return "Ocurrió un error al comunicarse con el servidor."
}

function normalizeError(error: unknown, context: ErrorContext): RegistrationServiceError {
  if (error instanceof RegistrationServiceError) {
    return error
  }

  const fetchError = error as {
    response?: { status?: number, _data?: { message?: string } }
  }

  const status = fetchError.response?.status ?? 500
  const message =
    fetchError.response?._data?.message ?? defaultMessageFor(status, context)

  return new RegistrationServiceError(status, message)
}

export async function listMyRegistrations(): Promise<Registration[]> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<ListRegistrationsData>>(
      "/api/users/me/registrations",
      {
        baseURL: config.public.apiBase,
        headers: authHeaders()
      }
    )

    return response.data.registrations.map(normalizeRegistration)
  } catch (error) {
    throw normalizeError(error, "list")
  }
}

export async function register(eventId: string): Promise<Registration> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<SingleRegistrationData>>(
      `/api/events/${eventId}/register`,
      {
        method: "POST",
        baseURL: config.public.apiBase,
        headers: authHeaders()
      }
    )

    return normalizeRegistration(response.data.registration)
  } catch (error) {
    throw normalizeError(error, "register")
  }
}

export async function cancelRegistration(eventId: string): Promise<Registration> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<SingleRegistrationData>>(
      `/api/events/${eventId}/register`,
      {
        method: "DELETE",
        baseURL: config.public.apiBase,
        headers: authHeaders()
      }
    )

    return normalizeRegistration(response.data.registration)
  } catch (error) {
    throw normalizeError(error, "cancel")
  }
}

export async function getEventParticipants(
  eventId: string,
  status?: RegistrationStatus
): Promise<RegistrationParticipant[]> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<ListParticipantsData>>(
      `/api/events/${eventId}/registrations`,
      {
        baseURL: config.public.apiBase,
        headers: authHeaders(),
        query: status ? { status } : undefined
      }
    )

    return response.data.registrations.map(normalizeParticipant)
  } catch (error) {
    throw normalizeError(error, "participants")
  }
}
