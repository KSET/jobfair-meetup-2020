import {
  RoleNames,
} from "../../helpers/permissions";
import {
  AuthRouter,
} from "../../helpers/route";
import EventReservationsService from "../../services/event-reservations-service";

const moderatorRouter = new AuthRouter({
  role: RoleNames.MODERATOR,
});

moderatorRouter.get("/", async ({ authHeader }) => {
  return await EventReservationsService.listAll(authHeader);
});

export default moderatorRouter;
