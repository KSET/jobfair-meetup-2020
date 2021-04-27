/* eslint-disable camelcase */
import _ from "lodash/fp";
import type {
  Query,
} from "../methods";
import {
  generateDeleteQuery,
  generateInsertQuery,
  generateSelectQuery,
  insertQuery,
  updateQuery,
} from "../query";
import type {
  File,
} from "./file";
import type {
  User,
} from "./user";

export interface ResumeData {
  city: string;
  birthday: string;
  linkedinUrl: string;
  githubUrl: string;
  suggestion: string;
  resumeFileId: File["id"];
  updatedAt: string | Date;
}

export interface ResumeCreateData extends ResumeData {
  uid: string;
  userUid: User["uid"];
}

export interface Resume {
  id: number;
  uid: string;
  userUid: User["uid"];
  city: string;
  birthday: string;
  linkedinUrl: string;
  githubUrl: string;
  suggestion: string;
  resumeFileId: File["id"];
  createdAt: string | Date;
  updatedAt: string | Date;
}

type ResumeSection =
  "awards"
  | "computerSkills"
  | "educations"
  | "languages"
  | "skills"
  | "workExperiences"
  ;

const RESUME_SECTIONS = [
  "awards",
  "computer skills",
  "educations",
  "languages",
  "skills",
  "work experiences",
];

const allowedResumeKeysUpdate: (keyof ResumeData)[] = [
  "city",
  "birthday",
  "linkedinUrl",
  "githubUrl",
  "suggestion",
  "resumeFileId",
  "updatedAt",
];

const allowedResumeKeysCreate: (keyof ResumeCreateData)[] = [
  "uid",
  "userUid",
  ...allowedResumeKeysUpdate,
];

const table = "resumes";

export const queryResumesGetAll =
  (): Query =>
    `
      select
        u."name" as full_name,
        u."email",
        r.*
      from
        resumes r
      left join users u
        on u."uid" = r.user_uid
    `
;

export const queryResumesGetBy =
  (
    where: Partial<Resume>,
  ) =>
    generateSelectQuery({
      table,
      where: {
        ...where,
      },
    })
;

export const queryResumesCreate =
  insertQuery<ResumeCreateData>(table)({
    allowedKeys: allowedResumeKeysCreate,
  })
;

export const queryResumesUpdate =
  updateQuery<ResumeData>(table)({
    allowedWhereKeys: [
      "id",
    ],
    allowedKeys: allowedResumeKeysUpdate,
  })
;

export const queryResumesDeleteByUserUid =
  (
    userUid: User["uid"],
  ): Query =>
    ({
      text: `
        delete from
          ${ table }
        where
          "user_uid" = $1
      `,
      values: [
        userUid,
      ],
    })
;

const resumeSectionsAction =
  <T>(fn: (section: ResumeSection) => (...args: unknown[]) => T): Record<ResumeSection, (...args: unknown[]) => T> =>
    _.flow(
      _.map((section) => [
          _.camelCase(section),
          fn(section),
        ],
      ),
      _.fromPairs,
    )(RESUME_SECTIONS)
;

export const queryResumesSectionGetByResumeId: Record<ResumeSection, (resumeId: Resume["id"]) => Query> =
  resumeSectionsAction((section: ResumeSection) => (resumeId: number): Query => generateSelectQuery({
    table: `${ table }_${ _.snakeCase(section) }`,
    where: {
      resumeId,
    },
  }))
;

export const queryResumesSectionGetAll: Record<ResumeSection, () => Query> =
  resumeSectionsAction((section: ResumeSection) => (): Query => ({
      text: `
        select
          *
        from
          ${ table }_${ section }
      `,
    }),
  )
;

export const queryResumesSectionCreateByResumeId: Record<ResumeSection, (data: Record<string, unknown>) => Query> =
  resumeSectionsAction((section: ResumeSection) => (data: Record<string, unknown>) => generateInsertQuery({
    table: `${ table }_${ _.snakeCase(section) }`,
    data: _.omit([ "id" ], data),
  }))
;

export const queryResumesSectionDeleteByResumeId: Record<ResumeSection, (resumeId: Resume["id"]) => Query> =
  resumeSectionsAction((section: ResumeSection) => (resumeId: Resume["id"]) => generateDeleteQuery({
    table: `${ table }_${ _.snakeCase(section) }`,
    where: {
      resumeId,
    },
  }))
;
