import { api } from "./api";

const normalizeId = (value) => {
  if (!value || typeof value !== "object") return value;

  const normalized = { ...value };

  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id;
  }

  if (Array.isArray(normalized.questions)) {
    normalized.questions = normalized.questions.map((question) => normalizeId(question));
  }

  return normalized;
};

export const surveyService = {
  getSurveys: async () => {
    const response = await api.get("/surveys");

    return Array.isArray(response.data.data)
      ? response.data.data.map((survey) => normalizeId(survey))
      : [];
  },

  getSurvey: async (surveyId, isPublic = false) => {
    const endpoint = isPublic
      ? `/surveys/public/${surveyId}`
      : `/surveys/${surveyId}`;

    const response = await api.get(endpoint);

    return normalizeId(response.data.data);
  },

  createSurvey: async (payload) => {
    const response = await api.post("/surveys", payload);

    return normalizeId(response.data.data);
  },

  updateSurvey: async (surveyId, payload) => {
    const response = await api.put(`/surveys/${surveyId}`, payload);

    return normalizeId(response.data.data);
  },

  deleteSurvey: async (surveyId) => {
    await api.delete(`/surveys/${surveyId}`);

    return true;
  },
};