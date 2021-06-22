import {
  queryResumeScansCreate,
  queryResumeScansGetByCompanyId,
  queryResumeScansGetByCompanyIdAndResumeId,
  queryResumeScansUpdate,
} from "../../db/helpers/resumeScans";
import type {
  ResumeScanData,
  ResumeScan,
} from "../../db/helpers/resumeScans";
import {
  Client,
} from "../../db/methods";
import {
  ServiceError,
} from "./error-service";
import ResumeService from "./resume-service";
import type {
  BasicResumeInfo,
} from "./resume-service";


export class ResumeScanServiceError extends ServiceError {
}

export default class ResumeScanService {
  public static async create(authHeader: string, companyId: ResumeScanData["companyId"], uid: ResumeScanData["resumeId"]): Promise<BasicResumeInfo | null> {
    const resume = await ResumeService.byUid(authHeader, uid);

    if (!resume) {
      return null;
    }

    return await Client.transaction(async (client) => {
      const key: ResumeScanData = {
        companyId,
        resumeId: resume.id,
      };

      const hasScan = await client.queryOne<ResumeScan>(queryResumeScansGetByCompanyIdAndResumeId(key));

      if (hasScan) {
        await client.queryOne(queryResumeScansUpdate(key));
      } else {
        await client.queryOne(queryResumeScansCreate(key));
      }

      return resume;
    });
  }

  public static async listFor(companyId: ResumeScanData["companyId"]): Promise<ResumeScan["resume_id"][]> {
    const rawResumeIds = await Client.queryOnce<ResumeScan>(queryResumeScansGetByCompanyId({
      companyId,
    }));

    if (!rawResumeIds) {
      return [];
    }

    return rawResumeIds.map(({ resume_id: id }) => id);
  }
}
