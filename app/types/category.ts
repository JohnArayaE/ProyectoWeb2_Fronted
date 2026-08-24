export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryPagination {
  page: number
  limit: number
  totalCategories: number
  totalPages: number
}

export interface ListCategoriesParams {
  page?: number
  limit?: number
  includeInactive?: boolean
}

export interface CreateCategoryPayload {
  name: string
  description?: string
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
  isActive?: boolean
}
