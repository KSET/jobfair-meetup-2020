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

export const queryCompanyApplicationWorkshopGetByIds =
  (...ids) => ({
    text: `
      select
        *
      from
        ${ table }
      where
        id = ANY($1::int[])
    `,
    values: [
      ids.flat(),
    ],
  })
;
