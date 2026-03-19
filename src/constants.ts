import { Level, SyllabusData } from './types';

const createEmptyUnit = (id: number): any => ({
  id,
  title: `Unit ${id}`,
  vocabulary: [
    { term: 'ancestor', definition: 'A person in your family who lived a long time ago.', example: 'My ancestors came from Italy.' },
    { term: 'aunt', definition: 'Your mother or father\'s sister.', example: 'My aunt gives me cookies when I visit her.' },
    { term: 'connect', definition: 'To join or bring together.', example: 'I use my phone to connect with my family.' },
    { term: 'cousin', definition: 'The child of your aunt or uncle.', example: 'I play games with my cousin on weekends.' },
    { term: 'daughter', definition: 'A female child.', example: 'My parents have one daughter and one son.' },
    { term: 'die', definition: 'To stop living.', example: 'My fish died last year.' },
    { term: 'friendly', definition: 'Kind and nice to others.', example: 'My grandmother is very friendly.' },
    { term: 'funny', definition: 'Makes you laugh.', example: 'My uncle tells funny jokes.' },
    { term: 'granddaughter', definition: 'Your son’s or daughter’s daughter.', example: 'My grandmother loves her granddaughter.' },
    { term: 'grandfather', definition: 'The father of your mother or father.', example: 'My grandfather reads me stories.' },
    { term: 'grandmother', definition: 'The mother of your mother or father.', example: 'My grandmother cooks delicious food.' },
    { term: 'grandson', definition: 'Your son’s or daughter’s son.', example: 'The man is playing with his grandson.' },
    { term: 'husband', definition: 'A man who is married.', example: 'My mother’s husband is my father.' },
    { term: 'information', definition: 'Facts or things you learn.', example: 'I need more information about my family tree.' },
    { term: 'married', definition: 'When two people become husband and wife.', example: 'My sister is married and has a baby.' },
    { term: 'mean', definition: 'Not kind or nice.', example: 'Don’t be mean to your brother.' },
    { term: 'messy', definition: 'Not clean or tidy.', example: 'My brother’s room is messy.' },
    { term: 'noisy', definition: 'Making a lot of sound.', example: 'My family is noisy during dinner.' },
    { term: 'older', definition: 'More years than someone else.', example: 'My sister is older than me.' },
    { term: 'parents', definition: 'Your mother and father.', example: 'I live with my parents.' },
    { term: 'roots', definition: 'Where your family comes from.', example: 'I want to learn about my roots in Japan.' },
    { term: 'son', definition: 'A male child.', example: 'My parents have one son and two daughters.' },
    { term: 'stepfather', definition: 'Your mother’s husband (not your real father).', example: 'My stepfather takes me to school.' },
    { term: 'travel', definition: 'To go to another place.', example: 'My family wants to travel to Korea.' },
    { term: 'uncle', definition: 'Your mother or father’s brother.', example: 'My uncle lives in Canada.' },
    { term: 'wife', definition: 'A woman who is married.', example: 'My father’s wife is my mother.' },
    { term: 'younger', definition: 'Fewer years than someone else.', example: 'My younger brother is five years old.' }
  ],
  grammar: [
    { title: 'Grammar Point 1', description: 'Description will be added later.', examples: ['Example 1', 'Example 2'] },
    { title: 'Grammar Point 2', description: 'Description will be added later.', examples: ['Example 1', 'Example 2'] }
  ],
  presentations: [
    {
      id: 'project-a',
      title: `Unit ${id} - Project A`,
      task: 'Presentation task details for Project A will be added later.',
      scaffolding: ['Step 1: Introduction', 'Step 2: Main Body', 'Step 3: Conclusion']
    },
    {
      id: 'project-b',
      title: `Unit ${id} - Project B`,
      task: 'Presentation task details for Project B will be added later.',
      scaffolding: ['Step 1: Introduction', 'Step 2: Main Body', 'Step 3: Conclusion']
    },
    {
      id: 'project-c',
      title: `Unit ${id} - Project C`,
      task: 'Presentation task details for Project C will be added later.',
      scaffolding: ['Step 1: Introduction', 'Step 2: Main Body', 'Step 3: Conclusion']
    }
  ],
  rubric: [
    { name: 'Fluency', description: 'Speaks smoothly without too many pauses.', maxPoints: 5 },
    { name: 'Vocabulary', description: 'Uses words learned in the unit correctly.', maxPoints: 5 },
    { name: 'Grammar', description: 'Uses the target grammar points accurately.', maxPoints: 5 },
    { name: 'Delivery', description: 'Eye contact, volume, and body language.', maxPoints: 5 },
  ]
});

export const E_JUNIOR_LEVELS: Level[] = [
  {
    id: 1,
    name: '1 E-Junior',
    units: Array.from({ length: 8 }, (_, i) => createEmptyUnit(i + 1))
  },
  {
    id: 2,
    name: '2 E-Junior',
    units: Array.from({ length: 8 }, (_, i) => createEmptyUnit(i + 1))
  },
  {
    id: 3,
    name: '3 E-Junior',
    units: Array.from({ length: 8 }, (_, i) => createEmptyUnit(i + 1))
  }
];

export const DEFAULT_SYLLABUS: SyllabusData = {
  id: 'main-syllabus',
  title: 'Course Syllabus',
  description: 'Welcome to the E-Junior Special Course. This syllabus outlines our learning journey across the three levels.',
  sections: [
    {
      id: 'objectives',
      title: 'Course Objectives',
      content: 'The E-Junior course is designed to build a strong foundation in English communication. Students will focus on vocabulary acquisition, practical grammar usage, and public speaking through unit-end presentations.',
      icon: 'Target'
    },
    {
      id: 'structure',
      title: 'Structure',
      content: 'Each level consists of 8 comprehensive units. Each unit integrates vocabulary, two key grammar points, and a scaffolded presentation task to ensure balanced skill development.',
      icon: 'Calendar'
    },
    {
      id: 'assessment',
      title: 'Assessment',
      content: 'Students are assessed based on their participation, unit quizzes, and most importantly, their final unit presentations using our standardized rubric.',
      icon: 'Award'
    },
    {
      id: 'progression',
      title: 'Level Progression',
      content: '• 1 E-Junior: Foundations & Basic Interaction\n• 2 E-Junior: Intermediate Communication\n• 3 E-Junior: Advanced Expression & Fluency',
      icon: 'Info'
    }
  ]
};
