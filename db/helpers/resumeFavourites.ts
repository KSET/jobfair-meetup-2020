import type {
  SnakeCasedPropertiesDeep,
} from "type-fest";
import type {
  Company,
  Resume,
} from "../../api/graphql/types";
import type {
  Query,
} from "../methods";
import {
  generateInsertQuery,
} from "../query";

/* eslint-disable camelcase */

export interface ResumeFavouriteData {
  companyId: Company["id"];
  resumeId: Resume["id"];
}

export type ResumeFavourite = SnakeCasedPropertiesDeep<ResumeFavouriteData>;

/* eslint-enable camelcase */

export const queryResumeFavouritesGetByCompanyId =
  (
    {
      companyId,
    }: Pick<ResumeFavouriteData, "companyId">,
  ): Query => ({
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
    }: ResumeFavouriteData,
  ): Query => ({
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
    }: ResumeFavouriteData,
  ): Query => ({
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
    }: ResumeFavouriteData,
  ): Query => generateInsertQuery({
    table: "resume_favourites",
    data: {
      companyId,
      resumeId,
    },
  })
;
