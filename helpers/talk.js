let topicId = 1;

export const TOPICS_BY_ID = {
  [topicId++]: "Career Ladder",
  [topicId++]: "Dangerous Dip",
  [topicId++]: "(Dis)Continued Tech",
};

export const TOPICS =
  Object
    .entries(TOPICS_BY_ID)
    .map(([ value, text ]) => ({ text, value }))
;
