import {
  generateInsertQuery,
  generateUpdateQuery,
} from "../query";

const table = "project_friends";


export const queryProjectFriendsGetAll =
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

export const queryProjectFriendsGetById =
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

export const queryProjectFriendsCreate =
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

export const queryProjectFriendsUpdate =
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

export const queryProjectFriendsGetLatest =
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

export const queryProjectFriendsDeleteById =
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
