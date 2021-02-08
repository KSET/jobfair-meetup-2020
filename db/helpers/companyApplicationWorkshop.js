import {
 generateInsertQuery,
} from "../query";
import {
 table as applicationTable,
} from "./companyApplication";

export const table = `${ applicationTable }_workshops`;

export const queryCompanyApplicationWorkshopCreate =
  ({
     title,
     description,
     goal,
     biography,
     notes,
   }) =>
    generateInsertQuery({
      table,
      data: {
        title,
        description,
        goal,
        biography,
        notes,
      },
    })
;
