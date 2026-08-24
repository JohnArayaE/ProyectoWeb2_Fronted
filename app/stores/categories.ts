import { defineStore } from "pinia"
import {
  CategoryServiceError,
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "~/services/categoryService"
import type {
  Category,
  CategoryPagination,
  CreateCategoryPayload,
  ListCategoriesParams,
  UpdateCategoryPayload
} from "~/types/category"

interface CategoriesState {
  categories: Category[]
  pagination: CategoryPagination | null
  loading: boolean
  error: string | null
  errorStatus: number | null
  lastParams: ListCategoriesParams
}

export const useCategoriesStore = defineStore("categories", {
  state: (): CategoriesState => ({
    categories: [],
    pagination: null,
    loading: false,
    error: null,
    errorStatus: null,
    lastParams: {}
  }),

  actions: {
    async fetchCategories(params: ListCategoriesParams = {}) {
      this.lastParams = params
      this.loading = true
      this.error = null
      this.errorStatus = null

      try {
        const data = await listCategories(params)
        this.categories = data.categories
        this.pagination = data.pagination
      } catch (error) {
        const serviceError = error as CategoryServiceError
        this.error = serviceError.message
        this.errorStatus = serviceError.status
      } finally {
        this.loading = false
      }
    },

    async createCategory(payload: CreateCategoryPayload) {
      try {
        await createCategory(payload)
        await this.fetchCategories(this.lastParams)
        return { success: true as const }
      } catch (error) {
        const serviceError = error as CategoryServiceError
        return { success: false as const, message: serviceError.message, status: serviceError.status }
      }
    },

    async updateCategory(id: string, payload: UpdateCategoryPayload) {
      try {
        await updateCategory(id, payload)
        await this.fetchCategories(this.lastParams)
        return { success: true as const }
      } catch (error) {
        const serviceError = error as CategoryServiceError
        return { success: false as const, message: serviceError.message, status: serviceError.status }
      }
    },

    async deactivateCategory(id: string) {
      try {
        await deleteCategory(id)
        await this.fetchCategories(this.lastParams)
        return { success: true as const }
      } catch (error) {
        const serviceError = error as CategoryServiceError
        return { success: false as const, message: serviceError.message, status: serviceError.status }
      }
    }
  }
})
