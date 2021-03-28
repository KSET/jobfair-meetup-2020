let topicId = 1;

export const TOPICS_BY_NAME = {
  companyApplications: {
    inGeneral: topicId++,
    aboutApplications: topicId++,
    talksWorkshopsPanelsDiscussions: topicId++,
  },
};

export const TOPIC_NAMES_BY_ID =
  Object.fromEntries(
    Object
      .entries(TOPICS_BY_NAME)
      .map(([ category, topicsByName ]) => [
        category,
        Object.fromEntries(
          Object
            .entries(topicsByName)
            .map(([ name, id ]) => [ id, name ])
          ,
        ),
      ])
    ,
  )
;
