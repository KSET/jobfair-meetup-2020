import {
  generateInsertQuery,
} from "../query";

export const table = "company_applications_tokens";

export const queryCompanyApplicationTokenCreate =
  ({
     token,
     note = "",
     createdBy,
   }) =>
    generateInsertQuery({
      table,
      data: {
        token,
        note,
        createdBy,
      },
    })
;

export const queryCompanyApplicationTokenGetByToken =
  ({
     token,
   }) => ({
    text: `
      select
        *
      from
        ${ table }
      where
        "token" = $1
    `,
    values: [
      token,
    ],
  })
;

export const queryCompanyApplicationTokenDeleteById =
  ({
     id,
   }) => ({
    text: `
      delete from
        ${ table }
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryCompanyApplicationTokenGetAll =
  () => ({
    text: `
      select
        *
      from
        ${ table }
      order by
        "id" desc
    `,
    values: [],
  })
;

export const queryCompanyApplicationTokenConsume =
  (
    id,
    usedFor,
  ) => ({
    text: `
      update
        ${ table }
      set
        used = true,
        used_at = NOW(),
        used_for = $1
      where
        "id" = $2
    `,
    values: [
      usedFor,
      id,
    ],
  })
;
