// Создание пользователя
export interface UserCreateRequest {
  login: string;
  password: string;
  name?: string | null; // необязательное поле
  role?: string; // необязательное поле
}

export interface UserUpdateRequest {
  login?: string;
  password?: string;
  name?: string | null;
  role?: string;
}
