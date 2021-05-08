import CompanyEventsService from "../services/company-events-service";
import CompanyService from "../services/company-service";
import ResumeService from "../services/resume-service";
import type {
  CacheKey,
} from "./fetchCache";
import {
  expireCacheKey,
  getCache,
} from "./fetchCache";

export const refreshCacheItems =
  async (authHeader = "") => {
    const items: ((authHeader?: string) => unknown)[] = [
      CompanyEventsService.listAll,
      CompanyService.fetchListAll,
      CompanyService.fetchIndustries,
    ];

    const authItems: ((authHeader: string) => unknown)[] = [
      ResumeService.list,
      ResumeService.listWithFullInfo,
    ];

    for (const key of Object.keys(getCache())) {
      expireCacheKey(key as CacheKey);
    }

    if (authHeader) {
      for (const item of authItems) {
        items.push(item);
      }
    }

    await Promise.all(items.map((fn) => fn(authHeader)));
  }
;
