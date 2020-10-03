import {
  AuthRouter,
} from "../../helpers/route";

const router = new AuthRouter({ fullUserData: true });

router.get("/", ({ authUser }) => {
  return authUser;
});

export default router;
