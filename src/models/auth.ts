export type ApiResponse<T> = {
  response: boolean
  message: string
  Data: T | null
}

export type UserApiDTO = {
  userID: number
  name: string
  departmentID: number
  department: string
  roll: string
  roles: string[]
  token: string
  expiration: number
}
