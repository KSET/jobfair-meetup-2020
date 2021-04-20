import {
  AuthRouter,
} from "../../helpers/route";
import UserService from "../../services/user-service";

const router = new AuthRouter({});

router.get("/", ({ authUser }) => {
  return authUser;
});

router.get("/full", async ({ authUser }) => {
  return await UserService.infoBy("uid", authUser.uid);
});

export default router;
