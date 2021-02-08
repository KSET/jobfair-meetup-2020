import {
 generateInsertQuery,
} from "../query";
import {
 table as applicationTable,
} from "./companyApplication";

export const table = `${ applicationTable }_talks`;

export const queryCompanyApplicationTalkCreate =
  ({
     title,
     description,
     topic,
     presenterPhotoId,
     presenterDescription,
   }) =>
    generateInsertQuery({
      table,
      data: {
        title,
        description,
        topic,
        presenterPhotoId,
        presenterDescription,
      },
    })
;
