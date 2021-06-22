import _ from "lodash/fp";
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
  resumesOnlyResumeQuery,
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
  get,
  graphQlQuery,
} from "../helpers/axios";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
} from "../helpers/http";
import {
  getSetting,
} from "../helpers/settings";
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

const LanguageSkillLevel = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
} as const;

export function fixResume(resume: GraphQlResume): Resume;
export function fixResume(resume: GraphQlBasicResume): BasicResumeInfo;
export function fixResume(resume: unknown): unknown {
  type UCGraphQlResume = CamelCasedPropertiesDeep<GraphQlResume>;

  const getName = ({ name }) => name;

  const fixComputerSkills =
    ({ computerSkills }: UCGraphQlResume) =>
      mapArray(getName)(computerSkills)
  ;

  const fixSkills =
    ({ skills }: UCGraphQlResume) =>
      mapArray(getName)(skills)
  ;

  const fixAwards =
    ({ awards }: UCGraphQlResume) =>
      mapArray(_.pick([ "title", "year" ]))(awards)
  ;

  const fixLanguages =
    ({ languages }: UCGraphQlResume) =>
      mapArray(
        (
          {
            name,
            skillLevelId,
          },
        ) => ({
          name,
          skillLevel: LanguageSkillLevel[skillLevelId],
        }),
      )(languages)
  ;

  const fixWorkExperiences =
    ({ workExperiences }: UCGraphQlResume) =>
      mapArray(
        _.pick([
          "company",
          "years",
          "description",
          "currentEmployer",
        ]),
      )(workExperiences)
  ;

  const fixEducations =
    ({ educations }: UCGraphQlResume) =>
      mapArray(
        _.pick([
          "name",
          "year",
          "module",
          "awardedTitle",
        ]),
      )(educations)
  ;

  const fixResumeProps =
    (resume: UCGraphQlResume) =>
      Object.assign(resume, {
        computerSkills: fixComputerSkills(resume),
        skills: fixSkills(resume),
        awards: fixAwards(resume),
        languages: fixLanguages(resume),
        workExperiences: fixWorkExperiences(resume),
        educations: fixEducations(resume),
      })
  ;

  const trimValues =
    (resume: UCGraphQlResume) =>
      deepMap(
        ({ key, value }) => ({
          key,
          value: isString(value) ? String(value).trim() : value,
        }),
        resume,
      )
  ;

  const addFullName =
    (resume: UCGraphQlResume) =>
      Object.assign(resume, {
        fullName: `${ resume.firstName } ${ resume.lastName }`,
      });

  const fixResumes = pipe(
    trimValues,
    keysFromSnakeToCamelCase,
    fixResumeProps,
    addFullName,
    _.pickBy(_.identity),
  );

  return fixResumes(resume);
}

const gdprDate = new Date("2018-05-25T00:00:00Z");
const afterGdpr =
  ({ updatedAt }) =>
    new Date(updatedAt) >= gdprDate
;

const fetchListFullInfoCached = cachedFetcher(
  "resume-data",
  60 * 1000,
  async (authHeader: string) => {
    const graphQlUrl = await getSetting(
      "GraphQL Endpoint",
      process.env.JOBFAIR_GRAPHQL_ENDPOINT,
    );

    const { origin: baseUrl } = new URL(graphQlUrl);

    const [
      {
        resumes: resumeData,
      },
      proxyData,
    ] = await Promise.all([
      // eslint-disable-next-line camelcase
      graphQlQuery<{ resumes: { id: string, resume_file_data: string }[] }>(
        resumesOnlyResumeQuery(),
        authHeader,
      ),
      get<any>(
        `${ baseUrl }/api/v2/resumes/proxy`,
        {
          headers: {
            Authorization: authHeader,
          },
        },
      ),
    ]) || [ { resumes: null } ];

    if (!resumeData) {
      throw new ResumeServiceError("Data failed to fetch");
    }

    const fileData = Object.fromEntries(
      resumeData.map(({ id, resume_file_data: data }) => [ id, data ]),
    );

    const {
      resumes: rawResumes,
      ...rawResumeFields
    } = proxyData;

    const resumeFields = _.mapValues(_.groupBy("resume_id"))(rawResumeFields);
    const resumeFieldNames = Object.keys(resumeFields);

    return _.flow(
      _.map((resume) => {
        delete resume.resume_file_data;

        resume.id = String(resume.id);
        for (const field of resumeFieldNames) {
          resume[field] = resumeFields[field][resume.id];
        }
        resume.resumeFileData = fileData[resume.id];

        return fixResume(resume);
      }),
      _.filter(afterGdpr),
      _.sortBy(({ updatedAt }) => -new Date(updatedAt)),
    )(rawResumes);
  },
);

export class ResumeServiceError extends ServiceError {
}

export default class ResumeService {
  static async list(authHeader: string): Promise<BasicResumeInfo[]> {
    const fullData = await this.listWithFullInfo(authHeader);

    return _.map(
      _.pick([
        "id",
        "userId",
        "uid",
        "firstName",
        "lastName",
        "fullName",
        "email",
        "createdAt",
        "updatedAt",
      ]),
    )(fullData);
  }

  static async listWithFullInfo(authHeader: string): Promise<Resume[]> {
    return await fetchListFullInfoCached(authHeader) || [];
  }

  static async byUid(authHeader: string, uid: Resume["uid"]): Promise<BasicResumeInfo | null> {
    const resumes = await this.list(authHeader);

    const resume = resumes.find((r) => r.uid === uid);

    if (!resume) {
      return null;
    }

    return resume;
  }

  static async byId(authHeader: string, id: Resume["id"]): Promise<Resume> {
    const resumes = await this.listWithFullInfo(authHeader);

    const resume = resumes.find((r) => String(r.id) === String(id));

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
