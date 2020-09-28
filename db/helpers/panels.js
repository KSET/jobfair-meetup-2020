import {
  generateInsertQuery,
  generateUpdateQuery,
} from "../../db/query";

export const queryPanelsGetAll =
  () => ({
    text: `
      select
        *
      from
        panels
      order by
        occures_at
    `,
  })
;

export const queryPanelsGetById =
  ({
     id,
   }) => ({
    text: `
      select
        *
      from
        panels
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryPanelsDeleteById =
  ({
     id,
   }) => ({
    text: `
      delete from
        panels
      where
        "id" = $1
      returning id
    `,
    values: [
      id,
    ],
  })
;

export const queryPanelsCreate =
  ({
     title,
     description,
     occuresAt,
     companies,
   }) => generateInsertQuery({
    table: "panels",
    data: {
      title,
      description,
      occuresAt,
      companies: JSON.stringify(companies),
    },
  })
;

export const queryPanelsUpdateById =
  (
    id,
    {
      title,
      description,
      occuresAt,
      companies,
    },
  ) => generateUpdateQuery(
    {
      table: "panels",
      data: {
        title,
        description,
        occuresAt,
        companies: JSON.stringify(companies),
        updatedAt: new Date(),
      },
      where: {
        id,
      },
    },
  )
;
