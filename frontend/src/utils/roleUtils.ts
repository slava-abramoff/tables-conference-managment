/** Значения ролей на сервере */
export const ROLE_API = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  VIEWER: "viewer",
} as const;

export type RoleApi = (typeof ROLE_API)[keyof typeof ROLE_API];

/** Подписи для отображения: Админ, Модер, Зритель */
const API_TO_LABEL: Record<string, string> = {
  [ROLE_API.ADMIN]: "Админ",
  [ROLE_API.MODERATOR]: "Модер",
  [ROLE_API.VIEWER]: "Зритель",
};

/** Варианты для селекта роли в таблице и модалке создания */
export const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: ROLE_API.ADMIN, label: "Админ" },
  { value: ROLE_API.MODERATOR, label: "Модер" },
  { value: ROLE_API.VIEWER, label: "Зритель" },
];

/**
 * Серверная роль → подпись для UI.
 */
export function roleApiToLabel(apiRole: string): string {
  return API_TO_LABEL[apiRole] ?? apiRole;
}

/**
 * Подпись из UI (или уже API-значение) → значение для сервера.
 */
export function roleLabelToApi(labelOrApi: string): string {
  const reverse: Record<string, string> = {
    Админ: ROLE_API.ADMIN,
    Модер: ROLE_API.MODERATOR,
    Зритель: ROLE_API.VIEWER,
  };
  return reverse[labelOrApi] ?? labelOrApi;
}
