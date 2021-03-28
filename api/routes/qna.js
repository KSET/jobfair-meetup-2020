import {
  RoleNames,
} from "../helpers/permissions";
import {
  AuthRouter,
  Router,
} from "../helpers/route";
import QnaService from "../services/qna-service";

const router = new Router();

router.get("/company-applications", async () => {
  return await QnaService.list();
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

authRouter.post("/", async (req) => {
  const { body } = req;

  const {
    question,
    answer,
    categoryId,
  } = body;

  return await QnaService.create({
    question,
    answer,
    categoryId,
  });
});

authRouter.patch("/change-order/:id", async ({ params, body }) => {
  const { id } = params;
  const { by = 1 } = body;

  return await QnaService.updateOrder(id, by);
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  return await QnaService.remove(id);
});

export default authRouter;
