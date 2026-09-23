export const users = [
  {
    id: 'u-1',
    fullName: 'Ava Thompson',
    email: 'ava@surveyhub.com',
    password: 'password123',
    role: 'Creator',
    avatar: 'AT',
  },
  {
    id: 'u-2',
    fullName: 'Daniel Brooks',
    email: 'daniel@surveyhub.com',
    password: 'password123',
    role: 'Administrator',
    avatar: 'DB',
  },
];

export const surveys = [
  {
    id: 's-1',
    title: 'Course Experience Feedback',
    description: 'Help us understand how students feel about the course experience and learning support.',
    status: 'Published',
    visibility: 'Public',
    createdAt: '2026-09-10',
    creatorId: 'u-1',
    questions: [
      {
        id: 'q-1',
        type: 'multiple-choice',
        text: 'How would you rate this course overall?',
        required: true,
        options: ['Excellent', 'Good', 'Average', 'Poor'],
      },
      {
        id: 'q-2',
        type: 'short-text',
        text: 'What did you find most useful?',
        required: false,
      },
      {
        id: 'q-3',
        type: 'yes-no',
        text: 'Would you recommend this course to a friend?',
        required: true,
      },
    ],
  },
  {
    id: 's-2',
    title: 'Quarterly Team Pulse',
    description: 'A quick pulse survey to understand team sentiment, workload, and communication quality.',
    status: 'Draft',
    visibility: 'Private',
    createdAt: '2026-09-14',
    creatorId: 'u-1',
    questions: [
      {
        id: 'q-4',
        type: 'rating',
        text: 'How satisfied are you with the team communication this quarter?',
        required: true,
      },
      {
        id: 'q-5',
        type: 'checkbox',
        text: 'Which areas need the most support?',
        required: true,
        options: ['Prioritization', 'Training', 'Tools', 'Mentorship'],
      },
    ],
  },
  {
    id: 's-3',
    title: 'Product Feedback',
    description: 'Share your experience improving the platform and what you want to see next.',
    status: 'Closed',
    visibility: 'Public',
    createdAt: '2026-08-26',
    creatorId: 'u-1',
    questions: [
      {
        id: 'q-6',
        type: 'long-text',
        text: 'What improvements would make the product more useful?',
        required: true,
      },
    ],
  },
];

export const responses = [
  {
    id: 'r-1',
    surveyId: 's-1',
    submittedAt: '2026-09-15T14:00:00.000Z',
    respondent: 'Anonymous',
    answers: {
      'q-1': 'Excellent',
      'q-2': 'The practical activities were the most useful.',
      'q-3': 'Yes',
    },
  },
  {
    id: 'r-2',
    surveyId: 's-1',
    submittedAt: '2026-09-18T10:32:00.000Z',
    respondent: 'Anonymous',
    answers: {
      'q-1': 'Good',
      'q-2': 'The course was well organized and easy to follow.',
      'q-3': 'Yes',
    },
  },
  {
    id: 'r-3',
    surveyId: 's-1',
    submittedAt: '2026-09-19T08:15:00.000Z',
    respondent: 'Anonymous',
    answers: {
      'q-1': 'Average',
      'q-2': 'Some topics needed more examples.',
      'q-3': 'No',
    },
  },
];

export const resultsBySurvey = {
  's-1': {
    totalResponses: 3,
    completionRate: 92,
    summaries: [
      {
        questionId: 'q-1',
        type: 'multiple-choice',
        text: 'How would you rate this course overall?',
        results: {
          Excellent: 1,
          Good: 1,
          Average: 1,
          Poor: 0,
        },
      },
      {
        questionId: 'q-2',
        type: 'short-text',
        text: 'What did you find most useful?',
        results: [
          'The practical activities were the most useful.',
          'The course was well organized and easy to follow.',
          'Some topics needed more examples.',
        ],
      },
      {
        questionId: 'q-3',
        type: 'yes-no',
        text: 'Would you recommend this course to a friend?',
        results: { Yes: 2, No: 1 },
      },
    ],
  },
};
