import { api } from "./api";

const buildPayload = (question, surveyId) => ({
  ...(surveyId ? { surveyId } : {}),
  questionText: question.text,
  type: question.type,
  required: Boolean(question.required),
  options: question.options || [],
});

export const questionService = {
  createQuestion: async (surveyId, question) => {
    const response = await api.post("/questions", buildPayload(question, surveyId));
    return response.data.data;
  },

  updateQuestion: async (questionId, question) => {
    const response = await api.put(`/questions/${questionId}`, buildPayload(question));
    return response.data.data;
  },

  deleteQuestion: async (questionId) => {
    await api.delete(`/questions/${questionId}`);
    return true;
  },
};