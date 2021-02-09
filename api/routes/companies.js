import qs from "qs";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
} from "../helpers/http";
import {
  RoleNames,
} from "../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../helpers/route";
import CompanyApplicationService from "../services/company-application-service";
import CompanyEventsService from "../services/company-events-service";
import CompanyService from "../services/company-service";
import VatValidator from "../services/vat-validator";

const router = new Router();

const cacheForMs = 15 * 1000;

router.post("/application/submit", async ({ body, files }) => {
  const application =
    qs.parse(
      Object
        .entries(body)
        .map(([ key, value ]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`)
        .join("&")
      ,
    )
  ;

  const { panel, talk, workshop } = application;

  if (!(panel || talk || workshop)) {
    throw new ApiError(
      "Potrebno je izbrati bar jednu aktivnost (talk, radionicu i/ili panel)",
      HttpStatus.Error.Client.BadRequest,
    );
  }

  try {
    return await CompanyApplicationService.submitApplication(application, files);
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    } else {
      throw new ApiError(
        "Nešto je pošlo krivo. Molimo probajte ponovno.",
        HttpStatus.Error.Server.InternalServerError,
        e.message,
      );
    }
  }
});

router.get("/application/by-vat/:vat", async ({ params }) => {
  const { vat } = params;

  const applications = await CompanyApplicationService.fetchApplicationsByVat(vat) || [];

  if (!applications || !applications.length) {
    throw new ApiError(
      "No applications for company",
      HttpStatus.Error.Client.NotFound,
    );
  }

  return applications;
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

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

authRouter.get("/application/list/all", async () => {
  return await CompanyApplicationService.fetchApplicationsFull();
});

export default authRouter;
