import {
  Router,
} from "express";
import {
  apiRoute,
} from "../../helpers/route";
import {
  requireAuth,
} from "../../helpers/middleware";

const router = Router();

router.get("/", requireAuth({ fullUserData: true }), apiRoute((req) => {
  return req.authUser;
}));

export default router;
