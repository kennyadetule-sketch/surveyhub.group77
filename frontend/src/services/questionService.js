import { api } from "./api";

export const questionService = {
  createQuestion: async (surveyId, question) => {
    const response = await api.post("/questions", {
      surveyId,
      questionText: question.text,
      type: question.type,
      required: question.required,
      options: question.options || [],
    });

    return response.data.data;
  },

  updateQuestion: async (questionId, question) => {
    const response = await api.put(`/questions/${questionId}`, {
      questionText: question.text,
      type: question.type,
      required: question.required,
      options: question.options || [],
    });

    return response.data.data;
  },

  deleteQuestion: async (questionId) => {
    await api.delete(`/questions/${questionId}`);

    return true;
  },
};