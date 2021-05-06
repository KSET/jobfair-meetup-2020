import {
  queryResumeFavouritesCreate,
  queryResumeFavouritesDeleteByCompanyIdAndResumeId,
  queryResumeFavouritesGetByCompanyId,
} from "../../db/helpers/resumeFavourites";
import type {
  ResumeFavouriteData,
  ResumeFavourite,
} from "../../db/helpers/resumeFavourites";
import {
  Client,
} from "../../db/methods";
import {
  ServiceError,
} from "./error-service";

export class ResumeFavouritesServiceError extends ServiceError {
}

export default class ResumeFavouritesService {
  public static async listFor(companyId: ResumeFavouriteData["companyId"]): Promise<ResumeFavourite["resume_id"][]> {
    const rawResumeIds = await Client.queryOnce<ResumeFavourite>(queryResumeFavouritesGetByCompanyId({
      companyId,
    }));

    if (!rawResumeIds) {
      return [];
    }

    return rawResumeIds.map(({ resume_id: id }) => id);
  }

  public static async create(companyId: ResumeFavouriteData["companyId"], resumeId: ResumeFavouriteData["resumeId"]): Promise<true> {
    try {
      await Client.queryOneOnce(queryResumeFavouritesCreate({
        companyId,
        resumeId,
      }));
    } catch (e) {
      if ("resume_favourites_pk" !== e.constraint) {
        throw new ResumeFavouritesServiceError("Something went wrong");
      }
    }

    return true;
  }

  public static async remove(companyId: ResumeFavouriteData["companyId"], resumeId: ResumeFavouriteData["resumeId"]): Promise<true> {
    await Client.queryOneOnce(queryResumeFavouritesDeleteByCompanyIdAndResumeId({
      companyId,
      resumeId,
    }));

    return true;
  }
}
