import {
  ApiNotFoundError,
  AuthRouter,
} from "../../helpers/route";
import ResumeFavouritesService from "../../services/resume-favourites-service";

const authRouter = new AuthRouter({ fullUserData: true });

authRouter.use((req, _res, next) => {
  const { authUser } = req;

  if (!authUser.companies.length) {
    throw new ApiNotFoundError();
  }

  const [ company ] = authUser.companies;
  req.company = company;

  return next();
});

authRouter.get("/list", async ({ company }) => {
  return await ResumeFavouritesService.listFor(company.id);
});

authRouter.post("/add", async ({ company, body }) => {
  const { resumeId } = body;

  return await ResumeFavouritesService.create(company.id, resumeId);
});

authRouter.delete("/remove/:resumeId", async ({ company, params }) => {
  const { resumeId } = params;

  return await ResumeFavouritesService.remove(company.id, resumeId);
});

export default authRouter;
