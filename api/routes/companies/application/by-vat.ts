import {
 Router,
} from "../../../helpers/route";
import CompanyApplicationService from "../../../services/company-application-service";

const router = new Router();

router.get("/by-vat/:vat", async ({ params }) => {
  const { vat } = params;

  return await CompanyApplicationService.fetchApplicationsByVat(vat) || [];
});

export default router;
