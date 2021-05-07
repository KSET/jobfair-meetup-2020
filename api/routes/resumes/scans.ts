import {
  ApiNotFoundError,
  ApiError,
  AuthRouter,
} from "../../helpers/route";
import ResumeScanService from "../../services/resume-scan-service";

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

authRouter.post("/scan", async ({ body, company, authHeader }) => {
  const { uid } = body;

  if (!uid) {
    throw new ApiError("No user provided");
  }

  return await ResumeScanService.create(authHeader, company.id, uid);
});

authRouter.get("/list", async ({ company }) => {
  return await ResumeScanService.listFor(company.id);
});

export default authRouter;
