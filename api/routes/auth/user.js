import {
 AuthRouter,
} from "~/api/helpers/route";

const router = new AuthRouter({ fullUserData: true });

router.get("/", (req) => {
  return req.authUser;
});

export default router;
