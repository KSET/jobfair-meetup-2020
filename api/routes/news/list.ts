import {
  Router,
} from "../../helpers/route";
import NewsService from "../../services/news-service";

const router = new Router();

router.get("/", async () => {
  const list = await NewsService.list();

  const now = new Date();

  return list.filter(({ date }) => date <= now);
});

router.get("/all", async () => {
  return await NewsService.list();
});

export default router;
