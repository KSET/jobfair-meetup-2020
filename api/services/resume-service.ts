import type {
  UploadedFile,
} from "express-fileupload";
import _ from "lodash/fp";
import {
  customAlphabet,
} from "nanoid/async";
import {
  queryResumesCreate,
  queryResumesSectionCreateByResumeId,
  queryResumesSectionDeleteByResumeId,
  queryResumesSectionGetByResumeId,
  queryResumesUpdate,
  queryResumesGetAll,
  ResumeData,
  ResumeCreateData,
  queryResumesDeleteByUserUid,
  queryResumesGetBy,
} from "../../db/helpers/resumes";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import type {
  Resume as DbResume,
} from "../../db/helpers/resumes";
import {
  ServiceError,
} from "./error-service";
import FileService from "./file-service";
import UserService, {
  User,
} from "./user-service";

export interface Award {
  title: string;
  year: string;
}

export type ComputerSkill = string;

export interface Education {
  name: string;
  year: string;
  module: string;
}

type LanguageSkillLevel =
  "A1" |
  "A2" |
  "B1" |
  "B2" |
  "C1" |
  "C2"
  ;

export interface Language {
  name: string;
  skillLevel: LanguageSkillLevel;
}

export type Skill = string;

export interface WorkExperience {
  company: string;
  years: string;
  description: string;
  currentEmployer: boolean;
}

interface BasicResumeInfo {
  uid: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface ResumeInfo extends BasicResumeInfo {
  city: string;
  birthday: string;
  linkedinUrl: string;
  githubUrl: string;
  suggestion: string;
  resumeFileId: number;
}

interface ResumeSections {
  awards: Award[];
  computerSkills: ComputerSkill[];
  educations: Education[];
  languages: Language[];
  skills: Skill[];
  workExperiences: WorkExperience[];
}

export type Resume =
  ResumeInfo
  & Partial<ResumeSections>
  ;

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  31,
);

const formatSections = (sections: unknown[]): Partial<ResumeSections> => {
  const getName = ({ name }: { name: string }): string => name;

  const sectionFormatter = (section: keyof ResumeSections) => {
    switch (section) {
      case "skills":
        return getName;
      case "computerSkills":
        return getName;
    }

    return (section) => section;
  };

  const formatSection =
    (section: keyof ResumeSections) =>
      _.flow(
        _.omit([ "resumeId" ]),
        sectionFormatter(section),
      )
  ;

  const format =
    ([
       section,
       entries,
     ]) => ([
      section,
      entries.map(formatSection(section)),
    ])
  ;

  return _.flow(
    keysFromSnakeToCamelCase,
    _.map(format),
    _.fromPairs,
  )(sections);
};

const resumeBasicKeys: (keyof BasicResumeInfo)[] = [
  "uid",
  "email",
  "fullName",
  "createdAt",
  "updatedAt",
];
const formatBaseResume: (resume: DbResume) => BasicResumeInfo =
  _.flow(
    keysFromSnakeToCamelCase,
    _.pick(resumeBasicKeys),
  )
;

const resumeKeys: (keyof Resume)[] = [
  ...resumeBasicKeys,
  "city",
  "birthday",
  "linkedinUrl",
  "githubUrl",
  "suggestion",
  "resumeFileId",
];
const formatResume: (resume: DbResume) => ResumeInfo =
  _.flow(
    keysFromSnakeToCamelCase,
    _.pick(resumeKeys),
  )
;

export class ResumeServiceError extends ServiceError {
}

export default class ResumeService {
  static async submit(userUid: User["uid"], data: ResumeData, resumeFile: UploadedFile | undefined): Promise<Resume> {
    const resumeSectionTransformer = {
      workExperiences: (e: Record<string, string>) => ({
        ...e,
        currentEmployer: "false" !== e.currentEmployer,
      }),
    };

    return await Client.transaction<Resume>(async (client) => {
      const user = await UserService.fullInfoBy("uid", userUid);

      if (!user) {
        throw new ResumeServiceError(
          "Nešto je pošlo po krivu. Molimo probajte ponovno.",
        );
      }

      if (resumeFile) {
        const file = await FileService.upload(resumeFile, user.id);

        data.resumeFileId = file.id;
      }
      const resume = await this._insertOrUpdateResume(client, userUid, data);

      if (!resume) {
        throw new ResumeServiceError(
          "Nešto je pošlo po krivu. Molimo probajte ponovno.",
        );
      }

      const resumeId = resume.id;

      await Promise.all(
        Object
          .values(queryResumesSectionDeleteByResumeId)
          .map((queryDeleteSectionByResumeId) => client.query(queryDeleteSectionByResumeId(resumeId))),
      );

      const createPromises: Promise<unknown>[] = [];

      for (const [ section, queryCreateSection ] of Object.entries(queryResumesSectionCreateByResumeId)) {
        if (!(section in data)) {
          continue;
        }

        const transformer =
          section in resumeSectionTransformer
          ? resumeSectionTransformer[section]
          : (a: unknown) => a
        ;

        for (const sectionData of data[section]) {
          createPromises.push(client.query(queryCreateSection(transformer({
            ...sectionData,
            resumeId,
          }))));
        }
      }

      await Promise.all(createPromises);

      return await this._infoBy(client, "userUid", userUid) as Resume;
    });
  }

  static async list(): Promise<ResumeInfo[]> {
    const resumes = await Client.queryOnce<DbResume[]>(queryResumesGetAll());

    return _.map(formatBaseResume, resumes) || [];
  }

  static async info(userUid: User["uid"]): Promise<Resume | null> {
    return await this.infoBy("userUid", userUid);
  }

  static async infoBy(key: keyof DbResume, value: unknown): Promise<Resume | null> {
    return await Client.once((client) => this._infoBy(client, key, value));
  }

  static async baseInfoBy(key: keyof DbResume, value: unknown): Promise<ResumeInfo | null> {
    const resume = await Client.queryOneOnce<DbResume>(queryResumesGetBy({ [key]: value }));

    if (!resume) {
      return null;
    }

    return formatResume(resume);
  }

  static async delete(userId: User["uid"]): Promise<void> {
    await Client.queryOnce(queryResumesDeleteByUserUid(userId));
  }

  static async _infoBy(client: Client, key: keyof DbResume, value: unknown): Promise<Resume | null> {
    const resume = await client.queryOne<DbResume>(queryResumesGetBy({ [key]: value }));

    if (!resume) {
      return null;
    }

    const sectionsQueries =
      Object
        .entries(queryResumesSectionGetByResumeId)
        .map(async ([ section, querySelectSectionByResumeId ]) => [
          section,
          await client.query(querySelectSectionByResumeId(resume.id)),
        ])
    ;

    const sections = await Promise.all(sectionsQueries);

    return {
      ...formatResume(resume),
      ...formatSections(sections),
    };
  }

  static async _insertOrUpdateResume(client: Client, userUid: User["uid"], data: ResumeData): Promise<DbResume | null> {
    const oldResume = await client.queryOne<DbResume>(queryResumesGetBy({ userUid }));

    if (oldResume) {
      return await client.queryOne<DbResume>(queryResumesUpdate(
        {
          id: oldResume.id,
        },
        {
          ...data,
          updatedAt: new Date(),
        },
      ));
    } else {
      const createData: ResumeCreateData = {
        ...data,
        userUid,
        uid: await nanoid(),
      };

      return await client.queryOne<DbResume>(queryResumesCreate(createData));
    }
  }
}
