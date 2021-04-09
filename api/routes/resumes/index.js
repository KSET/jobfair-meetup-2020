import {
  deepMap,
  keysFromSnakeToCamelCase,
  mapArray,
  pipe,
  withoutKeys,
} from "../../../helpers/object";
import {
  isString,
} from "../../../helpers/string";
import {
  resumeQuery,
  resumesQuery,
} from "../../graphql/queries";
import {
  get,
  graphQlQuery,
} from "../../helpers/axios";
import {
  cachedFetcher,
} from "../../helpers/fetchCache";
import {
  HttpStatus,
  internalRequest,
} from "../../helpers/http";
import {
  ApiError,
  AuthRouter,
} from "../../helpers/route";

const authRouter = new AuthRouter({});

export const fixResume = (resume) => {
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
};

const gdprDate = new Date("2018-05-25T00:00:00Z");
const afterGdpr =
  ({ updatedAt }) =>
    new Date(updatedAt) >= gdprDate
;

const listCacheTimeoutMs = 10 * 1000;
const fetchListCached = cachedFetcher(
  listCacheTimeoutMs,
  async (authHeader) => {
    const { resumes } = await graphQlQuery(resumesQuery(), authHeader);

    if (!resumes) {
      return [];
    }

    return resumes.map(fixResume).filter(afterGdpr);
  },
);

authRouter.get("/list", async ({ authHeader }) => {
  return await fetchListCached(authHeader);
});

authRouter.get("/for-user/:uid", cachedFetcher(listCacheTimeoutMs, async ({ authHeader, params }) => {
  const { data: resumes } = await internalRequest("get", "/resumes/list", {
    headers: {
      Authorization: authHeader,
    },
  }) || [];

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
