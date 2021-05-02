import {
 Router,
} from "../../helpers/route";
import NewsService from "../../services/news-service";

const router = new Router();

router.get("/", async () => {
  return await NewsService.list();
});

export default router;
