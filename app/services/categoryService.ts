import type {
  Category,
  CategoryPagination,
  CreateCategoryPayload,
  ListCategoriesParams,
  UpdateCategoryPayload
} from "~/types/category"

export class CategoryServiceError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "CategoryServiceError"
  }
}

interface ApiSuccess<T> {
  success: true
  message?: string
  data: T
}

interface ListCategoriesData {
  categories: Category[]
  pagination: CategoryPagination
}

interface SingleCategoryData {
  category: Category
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new CategoryServiceError(
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

  if (status === 403) {
    return "No tenés permisos de administrador para realizar esta acción."
  }

  if (status === 404) {
    return "La categoría no existe."
  }

  if (status === 409) {
    return "Ya existe una categoría con ese nombre."
  }

  return "Ocurrió un error al comunicarse con el servidor."
}

function normalizeError(error: unknown): CategoryServiceError {
  if (error instanceof CategoryServiceError) {
    return error
  }

  const fetchError = error as {
    response?: { status?: number, _data?: { message?: string } }
  }

  const status = fetchError.response?.status ?? 500
  const message =
    fetchError.response?._data?.message ?? defaultMessageFor(status)

  return new CategoryServiceError(status, message)
}

export async function listCategories(
  params: ListCategoriesParams = {}
): Promise<ListCategoriesData> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<ListCategoriesData>>(
      "/api/categories",
      {
        baseURL: config.public.apiBase,
        headers: authHeaders(),
        query: {
          page: params.page,
          limit: params.limit,
          includeInactive: params.includeInactive
        }
      }
    )

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function getCategory(id: string): Promise<Category> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<SingleCategoryData>>(
      `/api/categories/${id}`,
      {
        baseURL: config.public.apiBase,
        headers: authHeaders()
      }
    )

    return response.data.category
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function createCategory(
  data: CreateCategoryPayload
): Promise<Category> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<SingleCategoryData>>(
      "/api/categories",
      {
        method: "POST",
        baseURL: config.public.apiBase,
        headers: authHeaders(),
        body: data
      }
    )

    return response.data.category
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryPayload
): Promise<Category> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<ApiSuccess<SingleCategoryData>>(
      `/api/categories/${id}`,
      {
        method: "PUT",
        baseURL: config.public.apiBase,
        headers: authHeaders(),
        body: data
      }
    )

    return response.data.category
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const config = useRuntimeConfig()

  try {
    await $fetch(`/api/categories/${id}`, {
      method: "DELETE",
      baseURL: config.public.apiBase,
      headers: authHeaders()
    })
  } catch (error) {
    throw normalizeError(error)
  }
}
