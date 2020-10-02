import {
  pipe,
  keysFromSnakeToCamelCase,
  mapArray,
  deepMap,
  withoutKeys,
} from "../../helpers/object";
import {
  isString,
} from "../../helpers/string";
import {
  HttpStatus,
} from "../helpers/http";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  resumesQuery,
  resumeQuery,
} from "../graphql/queries";
import {
  get,
  graphQlQuery,
} from "../helpers/axios";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../helpers/route";

const router = new Router();
const authRouter = AuthRouter.boundToRouter(router, {});

const fixResume = (resume) => {
  const fixComputerSkills =
    ({ computerSkills }) =>
      mapArray(
        computerSkills,
        ({ name }) => name,
      )
  ;

  const fixSkills =
    ({ skills }) =>
      mapArray(
        skills,
        ({ name }) => name,
      )
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
};

const listCacheTimeoutMs = 10 * 1000;
const fetchListCached = cachedFetcher(
  listCacheTimeoutMs,
  async (authHeader) => {
    const { resumes } = await graphQlQuery(resumesQuery(), authHeader);

    if (!resumes) {
      return [];
    }

    return resumes.map(fixResume);
  },
);

authRouter.get("/list", async ({ authHeader }) => {
  return await fetchListCached(authHeader);
});

authRouter.get("/for-user/:uid", cachedFetcher(listCacheTimeoutMs, async ({ authHeader, params }) => {
  const resumes = await fetchListCached(authHeader);

  const [ resume ] = resumes.filter(({ uid }) => uid === params.uid);

  if (!resume) {
    throw new ApiError("Resume not found", HttpStatus.Error.Client.NotFound);
  }

  return resume;
}, ({ params }) => {
  return params.uid;
}));

authRouter.getRaw("/info/:id.pdf", async ({ authHeader, params, headers: reqHeaders }, res) => {
  const { id } = params;

  try {
    const { resume } = await graphQlQuery(resumeQuery(Number(id)), authHeader);

    if (!resume) {
      throw new ApiError("Resume not found", HttpStatus.Error.Client.NotFound);
    }

    const { resumeFileData } = fixResume(resume);

    const headers = withoutKeys([ "cookie", "host", "referer", "connection" ], reqHeaders);
    const response = await get(resumeFileData, {
      responseType: "stream",
      headers,
    });

    res.header(response.headers);

    response.pipe(res);
    response.on("end", () => resume.end());
  } catch (e) {
    res.status(HttpStatus.Error.Client.NotFound);
    return res.end();
  }
});

authRouter.get("/info/:id", async ({ authHeader, params }) => {
  const { id } = params;

  const { resume } = await graphQlQuery(resumeQuery(Number(id)), authHeader);

  if (!resume) {
    throw new ApiError("Resume not found", HttpStatus.Error.Client.NotFound);
  }

  return fixResume(resume);
});

export default authRouter;
