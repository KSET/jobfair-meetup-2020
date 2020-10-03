import {
  ApiError,
  ApiNotFoundError,
  AuthRouter,
} from "../../helpers/route";
import {
  queryResumeFavouritesCreate,
  queryResumeFavouritesDeleteByCompanyIdAndResumeId,
  queryResumeFavouritesGetByCompanyId,
} from "../../../db/helpers/resumeFavourites";
import {
  Client,
} from "../../../db/methods";

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

authRouter.get("/list", async ({ company }) => {
  const rawResumeIds = await Client.queryOnce(queryResumeFavouritesGetByCompanyId({
    companyId: company.id,
  }));

  // eslint-disable-next-line camelcase
  return rawResumeIds.map(({ resume_id }) => resume_id);
});

authRouter.post("/add", async ({ company, body }) => {
  const { resumeId } = body;

  try {
    await Client.queryOneOnce(queryResumeFavouritesCreate({
      companyId: company.id,
      resumeId,
    }));
  } catch (e) {
    if ("resume_favourites_pk" !== e.constraint) {
      throw new ApiError("Something went wrong");
    }
  }

  return true;
});

authRouter.delete("/remove/:resumeId", async ({ company, params }) => {
  const { resumeId } = params;

  await Client.queryOneOnce(queryResumeFavouritesDeleteByCompanyIdAndResumeId({
    companyId: company.id,
    resumeId,
  }));

  return true;
});

export default authRouter;
