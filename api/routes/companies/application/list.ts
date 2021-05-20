import {
 RoleNames,
} from "../../../helpers/permissions";
import {
 AuthRouter,
} from "../../../helpers/route";
import CompanyApplicationService from "../../../services/company-application-service";

const authRouter = new AuthRouter({
  role: RoleNames.ADMIN,
});

authRouter.get("/all", async () => {
  return await CompanyApplicationService.fetchApplicationsFull();
});

export default authRouter;
