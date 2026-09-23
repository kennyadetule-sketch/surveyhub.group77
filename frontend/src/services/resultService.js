import { api } from "./api";

export const resultService = {
  getResults: async (surveyId) => {
    const response = await api.get(
      `/surveys/${surveyId}/results`
    );

    return response.data.data;
  },
};