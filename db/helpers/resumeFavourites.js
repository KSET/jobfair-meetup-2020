import {
  generateInsertQuery,
} from "../query";

export const queryResumeFavouritesGetByCompanyId =
  (
    {
      companyId,
    },
  ) => ({
    text: `
      select
        *
      from
        resume_favourites
      where
        "company_id" = $1
    `,
    values: [
      companyId,
    ],
  })
;

export const queryResumeFavouritesGetByCompanyIdAndResumeId =
  (
    {
      companyId,
      resumeId,
    },
  ) => ({
    text: `
      select
        *
      from
        resume_favourites
      where
            "company_id" = $1
        and "resume_id" = $2
    `,
    values: [
      companyId,
      resumeId,
    ],
  })
;

export const queryResumeFavouritesDeleteByCompanyIdAndResumeId =
  (
    {
      companyId,
      resumeId,
    },
  ) => ({
    text: `
      delete from
        resume_favourites
      where
            "company_id" = $1
        and "resume_id" = $2
    `,
    values: [
      companyId,
      resumeId,
    ],
  })
;

export const queryResumeFavouritesCreate =
  (
    {
      companyId,
      resumeId,
    },
  ) => generateInsertQuery({
    table: "resume_favourites",
    data: {
      companyId,
      resumeId,
    },
  })
;
