const state = {
  users: [],
  surveys: [],
  questions: [],
  responses: [],
};

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const clone = (value) => JSON.parse(JSON.stringify(value));

const userById = (id) => state.users.find((user) => String(user._id) === String(id));

const createUser = (userData) => {
  const user = {
    ...userData,
    _id: userData._id || makeId("user"),
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: userData.updatedAt || new Date().toISOString(),
  };
  state.users.push(user);
  return clone(user);
};

const findUserByEmail = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return state.users.find((user) => String(user.email || "").trim().toLowerCase() === normalizedEmail) || null;
};

const findUserById = (id) => userById(id) || null;

const createSurvey = (surveyData) => {
  const survey = {
    ...surveyData,
    _id: surveyData._id || makeId("survey"),
    createdAt: surveyData.createdAt || new Date().toISOString(),
    updatedAt: surveyData.updatedAt || new Date().toISOString(),
  };
  state.surveys.push(survey);
  return clone(survey);
};

const getSurveysByCreator = (creatorId) =>
  clone(
    state.surveys
      .filter((survey) => String(survey.creator) === String(creatorId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );

const findSurveyById = (surveyId) => state.surveys.find((survey) => String(survey._id) === String(surveyId)) || null;

const updateSurvey = (surveyId, creatorId, updates) => {
  const survey = state.surveys.find(
    (item) => String(item._id) === String(surveyId) && String(item.creator) === String(creatorId)
  );

  if (!survey) return null;

  Object.assign(survey, updates, { updatedAt: new Date().toISOString() });
  return clone(survey);
};

const deleteSurvey = (surveyId, creatorId) => {
  const index = state.surveys.findIndex(
    (survey) => String(survey._id) === String(surveyId) && String(survey.creator) === String(creatorId)
  );

  if (index === -1) return false;

  state.surveys.splice(index, 1);
  state.questions = state.questions.filter((question) => String(question.survey) !== String(surveyId));
  state.responses = state.responses.filter((response) => String(response.survey) !== String(surveyId));

  return true;
};

const createQuestion = (questionData) => {
  const question = {
    ...questionData,
    _id: questionData._id || makeId("question"),
    createdAt: questionData.createdAt || new Date().toISOString(),
    updatedAt: questionData.updatedAt || new Date().toISOString(),
  };
  state.questions.push(question);
  return clone(question);
};

const getQuestionsBySurvey = (surveyId) =>
  clone(
    state.questions
      .filter((question) => String(question.survey) === String(surveyId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  );

const updateQuestion = (questionId, updates) => {
  const question = state.questions.find((item) => String(item._id) === String(questionId));

  if (!question) return null;

  Object.assign(question, updates, { updatedAt: new Date().toISOString() });
  return clone(question);
};

const deleteQuestion = (questionId) => {
  const index = state.questions.findIndex((question) => String(question._id) === String(questionId));

  if (index === -1) return false;

  state.questions.splice(index, 1);
  state.responses = state.responses.map((response) => ({
    ...response,
    answers: response.answers.filter((answer) => String(answer.question) !== String(questionId)),
  }));

  return true;
};

const createResponse = (responseData) => {
  const response = {
    ...responseData,
    _id: responseData._id || makeId("response"),
    createdAt: responseData.createdAt || new Date().toISOString(),
    updatedAt: responseData.updatedAt || new Date().toISOString(),
  };
  state.responses.push(response);
  return clone(response);
};

const getResponsesBySurvey = (surveyId) =>
  clone(
    state.responses
      .filter((response) => String(response.survey) === String(surveyId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );

const getPublicSurveyById = (surveyId) => {
  const survey = findSurveyById(surveyId);
  if (!survey || survey.visibility !== "public" || survey.status !== "published") return null;
  return clone(survey);
};

module.exports = {
  state,
  createUser,
  findUserByEmail,
  findUserById,
  createSurvey,
  getSurveysByCreator,
  findSurveyById,
  updateSurvey,
  deleteSurvey,
  createQuestion,
  getQuestionsBySurvey,
  updateQuestion,
  deleteQuestion,
  createResponse,
  getResponsesBySurvey,
  getPublicSurveyById,
};
