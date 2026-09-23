import { api } from "./api";

export const responseService = {
  submitResponse: async (surveyId, answers) => {
    const response = await api.post("/responses", {
      surveyId,
      answers,
    });

    return response.data.data;
  },

  getResponses: async (surveyId) => {
    const response = await api.get(
      `/responses/survey/${surveyId}`
    );

    return response.data.data;
  },
};