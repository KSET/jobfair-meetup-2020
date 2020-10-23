import {
 Router,
} from "../helpers/route";

const router = new Router();

let number = 0;

router.get("/count", () => {
  return number;
});

router.post("/increment", () => {
  number += 1;

  return number;
});

router.post("/decrement", () => {
  number -= 1;

  return number;
});

export default router;
