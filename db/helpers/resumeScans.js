import {
  generateInsertQuery,
  generateUpdateQuery,
} from "../query";

export const queryResumeScansGetByCompanyId =
  (
    {
      companyId,
    },
  ) => ({
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
    },
  ) => ({
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
    },
  ) => ({
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
    },
  ) => generateInsertQuery({
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
    },
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
