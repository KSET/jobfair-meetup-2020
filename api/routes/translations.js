import {
  Router,
} from "express";
import {
  apiRoute,
} from "../helpers/route";

const router = Router();

router.get("/all", apiRoute(() => {
  return {
    "index.heroDate": "19. - 23.10. | FER, Zagreb",
  };
}));

export default router;
