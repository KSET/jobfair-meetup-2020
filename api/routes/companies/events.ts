import {
  HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  Router,
} from "../../helpers/route";
import CompanyEventsService from "../../services/company-events-service";

const router = new Router();

router.get("/all", async () => {
  return await CompanyEventsService.listAll();
});

router.get("/", async () => {
  return await CompanyEventsService.listNotPassed();
});

router.get("/:type/:id", async ({ params }) => {
  const { type, id } = params;

  if (!type || !id) {
    throw new ApiError("no-params", HttpStatus.Error.Client.Forbidden, [
      "Type and ID are required params",
    ]);
  }

  return await CompanyEventsService.listEventOfTypeForCompany(id, type);
});

export default router;
