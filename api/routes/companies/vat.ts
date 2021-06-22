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
import VatValidator from "../../services/vat-validator";

const router = new Router();

router.post("/check", async ({ body }) => {
  const { vat } = body;

  if (!vat) {
    throw new ApiError("no-vat", HttpStatus.Error.Client.UnprocessableEntity);
  }

  return await VatValidator.validate(vat);
});

router.post("/info/existing", async ({ body }) => {
  const { vat } = body;

  if (!vat) {
    throw new ApiError("no-vat", HttpStatus.Error.Client.UnprocessableEntity);
  }

  try {
    return await CompanyService.fetchInfoFromVat(vat);
  } catch (e) {
    if (e instanceof CompanyError) {
      throw new ApiError(e.message, HttpStatus.Error.Client.NotFound);
    }

    throw e;
  }
});

router.post("/info/remote", async ({ body }) => {
  const { vat } = body;

  if (!vat) {
    throw new ApiError("no-vat", HttpStatus.Error.Client.UnprocessableEntity);
  }

  return await VatValidator.remoteInfo(vat);
});

router.post("/info/any", async ({ body }) => {
  const { vat } = body;

  if (!vat) {
    throw new ApiError("no-vat", HttpStatus.Error.Client.UnprocessableEntity);
  }

  try {
    return await CompanyService.fetchInfoFromVat(vat);
  } catch {
  }

  return await VatValidator.remoteInfo(vat);
});

export default router;
