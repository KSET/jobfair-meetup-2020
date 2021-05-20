import {
  Router,
} from "../../helpers/route";
import CompanyService from "../../services/company-service";

const router = new Router();

router.get("/", async () => {
  return await CompanyService.fetchListAll();
});

export default router;
