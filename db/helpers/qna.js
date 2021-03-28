import {
  generateInsertQuery,
  generateUpdateQuery,
} from "../query";

const table = "qna";

export const queryQnaCreate =
  ({
     question,
     answer,
     categoryId,
   }) =>
    generateInsertQuery({
      table,
      data: {
        question,
        answer,
        categoryId,
      },
    })
;

export const queryQnaGetAll =
  () => ({
    text: `
      select
        *
      from
        "${ table }"
      order by
        "order" desc,
        id asc
    `,
    values: [],
  })
;

export const queryQnaGetById =
  ({
     id,
   }) => ({
    text: `
      select
        *
      from
        "${ table }"
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryQnaUpdateById =
  (
    {
      id,
    },
    {
      question,
      answer,
      categoryId,
      order,
    },
  ) => generateUpdateQuery({
    table,
    data: {
      question,
      answer,
      categoryId,
      order,
    },
    where: {
      id,
    },
  })
;

export const queryQnaDeleteById =
  ({
     id,
   }) => ({
    text: `
      delete from
        "${ table }"
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;
