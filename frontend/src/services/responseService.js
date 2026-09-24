import { api } from "./api";

const normalizeResponse = (value) => {
  if (!value || typeof value !== "object") return value;

  const normalized = { ...value };
  if (normalized._id && !normalized.id) normalized.id = normalized._id;
  if (Array.isArray(normalized.answers)) {
    normalized.answers = normalized.answers.map((answer) => normalizeResponse(answer));
  }
  return normalized;
};

export const responseService = {
  submitResponse: async (surveyId, answers) => {
    const response = await api.post("/responses", {
      surveyId,
      answers,
    });

    return normalizeResponse(response.data.data);
  },

  getResponses: async (surveyId) => {
    const response = await api.get(`/responses/survey/${surveyId}`);

    return Array.isArray(response.data.data)
      ? response.data.data.map((item) => normalizeResponse(item))
      : [];
  },
};