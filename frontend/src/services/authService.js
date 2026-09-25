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
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);

    if (profileImage instanceof File) {
      formData.append("profileImage", profileImage);
    }

    const response = await api.post("/auth/register", formData);
    return response.data.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");

    return response.data.data.user;
  },
};
