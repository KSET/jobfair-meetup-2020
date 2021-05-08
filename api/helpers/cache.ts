import CompanyEventsService from "../services/company-events-service";
import CompanyService from "../services/company-service";
import ResumeService from "../services/resume-service";
import type {
  CacheKey,
} from "./fetchCache";
import {
  expireCacheKey,
} from "./fetchCache";

const cachedFetchers = {
  "participant-events": {
    auth: false,
    handler: CompanyEventsService.listAll,
  },
  participants: {
    auth: false,
    handler: CompanyService.fetchListAll,
  },
  industries: {
    auth: false,
    handler: CompanyService.fetchIndustries,
  },
  resumes: {
    auth: true,
    handler: ResumeService.list,
  },
  "resumes-full-data": {
    auth: true,
    handler: ResumeService.listWithFullInfo,
  },
};

export const refreshCacheItems =
  async (authHeader = ""): Promise<void> => {
    const entries = Object.values(cachedFetchers);
    const items: {
      auth: boolean;
      handler: (authHeader?: string) => unknown;
    }[] = entries.filter(({ auth }) => !auth);
    const authItems = entries.filter(({ auth }) => !auth);

    for (const key of Object.keys(cachedFetchers)) {
      expireCacheKey(key as CacheKey);
    }

    if (authHeader) {
      for (const item of authItems) {
        items.push(item);
      }
    }

    await Promise.all(items.map(({ handler }) => handler(authHeader)));
  }
;

export const refreshCacheItem =
  async (key: CacheKey, authHeader = ""): Promise<void> => {
    const entry = cachedFetchers[key.replace(/:default$/i, "").replace(/^cache:/i, "")];

    if (!entry) {
      return;
    }

    expireCacheKey(key);

    if (entry.auth && authHeader) {
      await entry.handler(authHeader);
      return;
    }

    if (!entry.auth) {
      await entry.handler();
    }
  }
;
