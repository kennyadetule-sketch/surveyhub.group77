import { api } from "./api";

export const authService = {
  login: async ({ email, password }) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data.data;
  },

  register: async ({ fullName, email, password, profileImage }) => {
    const payload = { fullName, email, password };

    if (profileImage) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
      if (profileImage instanceof File) {
        formData.append("profileImage", profileImage);
      } else {
        formData.append("profileImage", profileImage);
      }

      const response = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    }

    const response = await api.post("/auth/register", payload);
    return response.data.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");

    return response.data.data.user;
  },
};