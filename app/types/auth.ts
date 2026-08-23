export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  profilePicture: string | null
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthData {
  token: string
  user: AuthUser
}

export interface AuthResponse {
  success: boolean
  message: string
  data: AuthData
}

export interface MeResponse {
  success: boolean
  data: {
    user: AuthUser
  }
}