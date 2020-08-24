import {
  HttpStatus,
} from "../helpers/http";
import {
  resumesQuery,
  resumeQuery,
} from "../graphql/queries";
import {
  graphQlQuery,
} from "../helpers/axios";
import {
  compose,
  keysFromSnakeToCamelCase,
  mapArray,
} from "../helpers/object";
import {
  RoleNames,
} from "../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../helpers/route";

const router = new Router();
const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

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


  const fixResumes = compose(
    keysFromSnakeToCamelCase,
    fixResumeProps,
  );

  return fixResumes(resume);
};

authRouter.get("/list", async ({ authHeader }) => {
  const { resumes } = await graphQlQuery(resumesQuery(), authHeader);

  if (!resumes) {
    return [];
  }

  return resumes.map(fixResume);
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
