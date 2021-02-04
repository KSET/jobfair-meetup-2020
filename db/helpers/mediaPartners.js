import {
  generateInsertQuery,
  generateUpdateQuery,
} from "../query";

const table = "media_partners";


export const queryMediaPartnersGetAll =
  () => ({
    text: `
      select
        *
      from
        ${ table }
      order by
        "order" asc
    `,
  })
;

export const queryMediaPartnersGetById =
  ({
     id,
   }) => ({
    text: `
      select
        *
      from
        ${ table }
      where
        "id" = $1
      limit 1
    `,
    values: [
      id,
    ],
  })
;

export const queryMediaPartnersCreate =
  ({
     name,
     link,
     imageId,
     order,
   }) => generateInsertQuery({
    table,
    data: {
      name,
      link,
      imageId,
      order,
    },
  })
;

export const queryMediaPartnersUpdate =
  (
    id,
    {
      order,
    },
  ) => generateUpdateQuery({
    table,
    data: {
      order,
    },
    where: {
      id,
    },
  })
;

export const queryMediaPartnersGetLatest =
  () => ({
    text: `
      select
        *
      from
        ${ table }
      order by
        "order" desc
      limit 1
    `,
  })
;

export const queryMediaPartnersDeleteById =
  (
    {
      id,
    },
  ) => ({
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
