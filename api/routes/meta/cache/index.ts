import {
 RoleNames,
} from "../../../helpers/permissions";
import {
 AuthRouter,
} from "../../../helpers/route";

const authRouter = new AuthRouter(
  {
    role: RoleNames.ADMIN,
  },
);

export default authRouter;
