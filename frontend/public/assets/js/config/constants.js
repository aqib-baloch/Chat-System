export const ROUTES = {
  LOGIN: "#/login",
  REGISTER: "#/register",
  FORGOT_PASSWORD: "#/forgot-password",
  RESET_PASSWORD: "#/reset-password",
  CHANGE_PASSWORD: "#/change-password",
  CHAT: "#/chat",
};

export const LIMITS = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_WORKSPACE_NAME_LENGTH: 50,
  MAX_CHANNEL_NAME_LENGTH: 50,
};

export const STORAGE_KEYS = {
  TOKEN: "chat_token",
  USER: "chat_user",
};
