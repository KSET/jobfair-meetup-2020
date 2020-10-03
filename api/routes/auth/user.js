import {
  internalRequest,
} from "../../helpers/http";
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

router.get("/", async ({ authUser }) => {
  const user = keysFromSnakeToCamelCase(authUser);
  const { data: rawParticipants } = await internalRequest("get", "/companies/participants");
  const { companies = [] } = user;
  const participantIds = new Set(rawParticipants.map(({ id }) => id));

  if (companies) {
    user.companies = companies.filter(({ id }) => participantIds.has(id)).map(fixCompany);
  }

  return user;
});

export default router;
