import {
  queryResumeScansCreate,
  queryResumeScansGetByCompanyId,
  queryResumeScansGetByCompanyIdAndResumeId,
  queryResumeScansUpdate,
} from "../../../db/helpers/resumeScans";
import {
  ApiNotFoundError,
  ApiError,
  AuthRouter,
} from "../../helpers/route";
import {
  Client,
} from "../../../db/methods";
import {
  internalRequest,
} from "../../helpers/http";

const authRouter = new AuthRouter({ fullUserData: true });

authRouter.use((req, res, next) => {
  const { authUser } = req;

  if (!authUser.companies.length) {
    throw new ApiNotFoundError();
  }

  const [ company ] = authUser.companies;
  req.company = company;

  return next();
});

authRouter.post("/scan", async ({ body, company, authHeader }) => {
  const { uid } = body;

  if (!uid) {
    throw new ApiError("No user provided");
  }

  const { data: resume } = await internalRequest(
    "get",
    `/resumes/for-user/${ encodeURIComponent(uid) }`,
    {
      headers: {
        Authorization: authHeader,
      },
    },
  ) || {};

  if (!resume) {
    throw new ApiError("User resume not found");
  }

  const client = await Client.inTransaction();
  const key = {
    companyId: company.id,
    resumeId: resume.id,
  };

  try {
    const hasScan = await client.queryOne(queryResumeScansGetByCompanyIdAndResumeId(key));

    if (hasScan) {
      await client.queryOne(queryResumeScansUpdate(key));
    } else {
      await client.queryOne(queryResumeScansCreate(key));
    }

    await client.commit();
  } catch (e) {
    await client.rollback();

    throw new ApiError("Something went wrong. Please try again.");
  } finally {
    await client.end();
  }

  return resume;
});

authRouter.get("/list", async ({ company }) => {
  const rawResumeIds = await Client.queryOnce(queryResumeScansGetByCompanyId({
    companyId: company.id,
  }));

  // eslint-disable-next-line camelcase
  return rawResumeIds.map(({ resume_id }) => resume_id);
});

export default authRouter;
