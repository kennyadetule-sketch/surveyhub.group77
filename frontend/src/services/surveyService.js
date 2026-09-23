import { api } from "./api";

export const surveyService = {
  getSurveys: async () => {
    const response = await api.get("/surveys");

    return response.data.data;
  },

  getSurvey: async (surveyId, isPublic = false) => {
    const endpoint = isPublic
      ? `/surveys/public/${surveyId}`
      : `/surveys/${surveyId}`;

    const response = await api.get(endpoint);

    return response.data.data;
  },

  createSurvey: async (payload) => {
    const response = await api.post("/surveys", payload);

    return response.data.data;
  },

  updateSurvey: async (surveyId, payload) => {
    const response = await api.put(`/surveys/${surveyId}`, payload);

    return response.data.data;
  },

  deleteSurvey: async (surveyId) => {
    await api.delete(`/surveys/${surveyId}`);

    return true;
  },
};