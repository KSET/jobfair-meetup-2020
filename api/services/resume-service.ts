import type {
  CamelCasedPropertiesDeep,
} from "type-fest";
import {
  deepMap,
  keysFromSnakeToCamelCase,
  mapArray,
  pipe,
} from "../../helpers/object";
import {
  isString,
} from "../../helpers/string";
import {
  resumesFullDataQuery,
  resumesQuery,
} from "../graphql/queries";
import type {
  BasicResume as GraphQlBasicResume,
  Resume as GraphQlResume,
  ResumeInfo as GraphQlResumeInfo,
  ResumeAward as GraphQlAward,
  ResumeEducation as GraphQlEducation,
  ResumeLanguage as GraphQlLanguage,
  ResumeWorkExperience as GraphQlWorkExperience,
} from "../graphql/types";
import {
  graphQlQuery,
} from "../helpers/axios";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
} from "../helpers/http";
import {
  ServiceError,
} from "./error-service";

export interface BasicResumeInfo extends CamelCasedPropertiesDeep<GraphQlBasicResume> {
  fullName: string;
}

export interface ResumeSections {
  awards: CamelCasedPropertiesDeep<GraphQlAward>[];
  computerSkills: string[];
  educations: CamelCasedPropertiesDeep<GraphQlEducation>[];
  languages: CamelCasedPropertiesDeep<GraphQlLanguage>[];
  skills: string[];
  workExperiences: CamelCasedPropertiesDeep<GraphQlWorkExperience>[];
}

export type Resume =
  CamelCasedPropertiesDeep<GraphQlResumeInfo>
  & BasicResumeInfo
  & Partial<ResumeSections>
  ;

export function fixResume(resume: GraphQlResume): Resume;
export function fixResume(resume: GraphQlBasicResume): BasicResumeInfo;
export function fixResume(resume: unknown): unknown {
  const getName = ({ name }) => name;

  const fixComputerSkills =
    ({ computerSkills }) =>
      mapArray(getName)(computerSkills)
  ;

  const fixSkills =
    ({ skills }) =>
      mapArray(getName)(skills)
  ;

  const fixResumeProps =
    (resume) =>
      Object.assign(resume, {
        computerSkills: fixComputerSkills(resume),
        skills: fixSkills(resume),
      })
  ;

  const trimValues =
    (resume) =>
      deepMap(
        ({ key, value }) => ({
          key,
          value: isString(value) ? String(value).trim() : value,
        }),
        resume,
      )
  ;

  const addFullName =
    (resume) =>
      Object.assign(resume, {
        fullName: `${ resume.firstName } ${ resume.lastName }`,
      });

  const fixResumes = pipe(
    trimValues,
    keysFromSnakeToCamelCase,
    fixResumeProps,
    addFullName,
  );

  return fixResumes(resume);
}

const gdprDate = new Date("2018-05-25T00:00:00Z");
const afterGdpr =
  ({ updatedAt }) =>
    new Date(updatedAt) >= gdprDate
;

const fetchListCached: (authHeader: string) => Promise<BasicResumeInfo[]> =
  cachedFetcher<BasicResumeInfo[]>(
    "resumes",
    5 * 1000,
    async (authHeader: string): Promise<BasicResumeInfo[]> => {
      const {
        resumes,
      }: {
        resumes: GraphQlBasicResume[];
      } = await graphQlQuery(resumesQuery(), authHeader);

      if (!resumes) {
        return [];
      }

      return resumes.map(fixResume).filter(afterGdpr);
    },
  )
;

const fetchListFullInfoCached = cachedFetcher<Resume[]>(
  "resumes-full-data",
  60 * 1000,
  async (authHeader: string) => {
    const {
      resumes,
    }: {
      resumes: GraphQlResume[];
    } = await graphQlQuery(resumesFullDataQuery(), authHeader);

    if (!resumes) {
      return [];
    }

    return resumes.map((r) => fixResume(r)).filter(afterGdpr);
  },
);

export class ResumeServiceError extends ServiceError {
}

export default class ResumeService {
  static async list(authHeader: string): Promise<BasicResumeInfo[]> {
    return await fetchListCached(authHeader);
  }

  static async listWithFullInfo(authHeader: string): Promise<Resume[]> {
    return await fetchListFullInfoCached(authHeader);
  }

  static async byUid(authHeader: string, uid: Resume["uid"]): Promise<BasicResumeInfo> {
    const resumes = await this.list(authHeader);

    const resume = resumes.find((r) => r.uid === uid);

    if (!resume) {
      throw new ResumeServiceError(
        "Resume not found",
        null,
        HttpStatus.Error.Client.NotFound,
      );
    }

    return resume;
  }

  static async byId(authHeader: string, id: Resume["id"]): Promise<Resume> {
    const resumes = await this.listWithFullInfo(authHeader);

    const resume = resumes.find((r) => r.id === id);

    if (!resume) {
      throw new ResumeServiceError(
        "Resume not found",
        null,
        HttpStatus.Error.Client.NotFound,
      );
    }

    return resume;
  }
}
