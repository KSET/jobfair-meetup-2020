import {
 HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  Router,
} from "../../helpers/route";
import CompanyService, {
 CompanyError,
} from "../../services/company-service";

const router = new Router();

router.get("/:id", async ({ params }) => {
  const { id } = params;

  try {
    return await CompanyService.fetchInfo(id);
  } catch (e) {
    if (e instanceof CompanyError) {
      throw new ApiError(e.message, HttpStatus.Error.Client.NotFound);
    }

    throw e;
  }
});


export default router;
