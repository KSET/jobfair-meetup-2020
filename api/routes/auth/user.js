import {
 fixCompany,
} from "../companies";
import {
 keysFromSnakeToCamelCase,
} from "../../../helpers/object";
import {
 AuthRouter,
} from "../../helpers/route";

const router = new AuthRouter({ fullUserData: true });

router.get("/", (req) => {
  const user = keysFromSnakeToCamelCase(req.authUser);
  const { companies = [] } = user;

  if (companies) {
    user.companies = companies.map(fixCompany);
  }

  return user;
});

export default router;
