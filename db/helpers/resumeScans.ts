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
  generateUpdateQuery,
} from "../query";

/* eslint-disable camelcase */

export interface ResumeScanData {
  companyId: Company["id"];
  resumeId: Resume["id"];
}

export interface ResumeScan extends SnakeCasedPropertiesDeep<ResumeScanData> {
  scanned_at: string;
}

/* eslint-enable camelcase */

export const queryResumeScansGetByCompanyId =
  (
    {
      companyId,
    }: Pick<ResumeScanData, "companyId">,
  ): Query => ({
    text: `
      select
        *
      from
        resume_scans
      where
        "company_id" = $1
      order by
        "scanned_at"
    `,
    values: [
      companyId,
    ],
  })
;

export const queryResumeScansGetByCompanyIdAndResumeId =
  (
    {
      companyId,
      resumeId,
    }: ResumeScanData,
  ): Query => ({
    text: `
      select
        *
      from
        resume_scans
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

export const queryResumeScansDeleteByCompanyIdAndResumeId =
  (
    {
      companyId,
      resumeId,
    }: ResumeScanData,
  ): Query => ({
    text: `
      delete from
        resume_scans
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

export const queryResumeScansCreate =
  (
    {
      companyId,
      resumeId,
    }: ResumeScanData,
  ): Query => generateInsertQuery({
    table: "resume_scans",
    data: {
      companyId,
      resumeId,
    },
  })
;

export const queryResumeScansUpdate =
  (
    {
      companyId,
      resumeId,
    }: ResumeScanData,
  ) => generateUpdateQuery({
    table: "resume_scans",
    data: {
      scannedAt: new Date(),
    },
    where: {
      companyId,
      resumeId,
    },
  })
;
