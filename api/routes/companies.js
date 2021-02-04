import qs from "qs";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
} from "../helpers/http";
import {
  ApiError,
  Router,
} from "../helpers/route";
import CompanyService from "../services/company-service";
import CompanyEventsService from "../services/company-events-service";
import VatValidator from "../services/vat-validator";

const router = new Router();

const cacheForMs = 15 * 1000;

router.post("/application/submit", (req) => {
  const body =
    qs.parse(
      Object
        .entries(req.body)
        .map(([ key, value ]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`)
        .join("&")
      ,
    )
  ;

  return body;
});

router.get("/participants", cachedFetcher(cacheForMs, async () => {
  return await CompanyService.fetchListAll();
}));

router.get("/industries", cachedFetcher(cacheForMs, async () => {
  return await CompanyService.fetchIndustries();
}));

router.get("/events/all", cachedFetcher(cacheForMs, async () => {
  return await CompanyEventsService.listAll();
}));

router.get("/events", cachedFetcher(cacheForMs, async () => {
  return await CompanyEventsService.listNotPassed();
}));

router.get("/events/panel/:id", cachedFetcher(cacheForMs, async ({ params }) => {
  const { id } = params;

  return await CompanyEventsService.listPanelsForCompany(id);
}, ({ params }) => {
  return params.id;
}));

router.get("/events/:type/:id", cachedFetcher(cacheForMs, async ({ params }) => {
  const { type, id } = params;

  if (!type || !id) {
    throw new ApiError("no-params", HttpStatus.Error.Client.Forbidden, [
      "Type and ID are required params",
    ]);
  }

  return await CompanyEventsService.listEventsForCompany(id, type);
}, ({ params }) => {
  const { type, id } = params;

  return `${ type }::${ id }`;
}));

router.get("/info/:id", cachedFetcher(cacheForMs, async ({ params }) => {
  const { id } = params;

  return await CompanyService.fetchInfo(id);
}, ({ params }) => {
  return params.id;
}));

router.post("/vat/check", async ({ body }) => {
  const { vat } = body;

  if (!vat) {
    throw new ApiError("no-vat", HttpStatus.Error.Client.UnprocessableEntity);
  }

  return await VatValidator.validate(vat);
});

router.post("/vat/info/existing", async ({ body }) => {
  const { vat } = body;

  if (!vat) {
    throw new ApiError("no-vat", HttpStatus.Error.Client.UnprocessableEntity);
  }

  return await CompanyService.fetchInfoFromVat(vat);
});

router.post("/vat/info/remote", async ({ body }) => {
  const { vat } = body;

  if (!vat) {
    throw new ApiError("no-vat", HttpStatus.Error.Client.UnprocessableEntity);
  }

  return await VatValidator.remoteInfo(vat);
});

router.post("/vat/info/any", async ({ body }) => {
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
