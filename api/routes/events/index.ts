import {
  RoleNames,
} from "../../helpers/permissions";
import {
  AuthRouter,
} from "../../helpers/route";
import EventReservationsService from "../../services/event-reservations-service";
import {
  requireCv,
} from "./_helpers";

const router = new AuthRouter({
  role: RoleNames.BASE,
});

router.get("/mine", requireCv, async ({ authUser }) => {
  return await EventReservationsService.forUser(authUser.id);
});

export default router;
