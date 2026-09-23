import { api } from "./api";

export const authService = {
  login: async ({ email, password }) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data.data;
  },

  register: async ({ fullName, email, password }) => {
    const response = await api.post("/auth/register", {
      fullName,
      email,
      password,
    });

    return response.data.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");

    return response.data.data.user;
  },
};