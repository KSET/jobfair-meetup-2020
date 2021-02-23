import * as Sentry from "@sentry/node";
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
import CompanyEventsService, {
 CompanyEventsError,
} from "../services/company-events-service";
import CompanyService, {
 CompanyError,
} from "../services/company-service";
import {
 ServiceError,
} from "../services/error-service";
import SlackNotificationService from "../services/slack-notification-service";
import VatValidator from "../services/vat-validator";

const router = new Router();

const cacheForMs = 15 * 1000;

router.post("/application/submit", async (req) => {
  const { body, files } = req;

  const application =
    qs.parse(
      Object
        .entries(body)
        .map(([ key, value ]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`)
        .join("&")
      ,
    )
  ;

  const { talk, workshop } = application;

  if (!(talk || workshop)) {
    throw new ApiError(
      "Potrebno je izbrati bar jednu aktivnost (talk i/ili radionicu)",
      HttpStatus.Error.Client.BadRequest,
    );
  }

  try {
    const company = await CompanyApplicationService.submitApplication(application, files);

    try {
      const {
        brandName,
        legalName,
        website,
        contactEmail,
        contactName,
        contactPhone,
        talkId,
        workshopId,
        panelInterested,
      } = company;

      await SlackNotificationService.notifyOfNewApplication({
        companyNameDisplay: brandName,
        companyNameLegal: legalName,
        companyHomepage: website,
        contactName,
        contactEmail,
        contactPhone,
        talk: Boolean(talkId),
        workshop: Boolean(workshopId),
        panel: Boolean(panelInterested),
      });
    } catch {
    }

    return company;
  } catch (e) {
    if (e instanceof ServiceError) {
      throw new ApiError(
        e.message,
        e.statusCode || HttpStatus.Error.Client.UnprocessableEntity,
        e.data,
      );
    } else {
      Sentry.captureException(
        e,
        {
          req,
        },
      );

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

  return await CompanyApplicationService.fetchApplicationsByVat(vat) || [];
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

  try {
    return await CompanyEventsService.listEventsForCompany(id, type);
  } catch (e) {
    if (e instanceof CompanyEventsError) {
      throw new ApiError(e.message, HttpStatus.Error.Client.NotFound);
    }

    throw e;
  }
}, ({ params }) => {
  const { type, id } = params;

  return `${ type }::${ id }`;
}));

router.get("/info/:id", cachedFetcher(cacheForMs, async ({ params }) => {
  const { id } = params;

  try {
    return await CompanyService.fetchInfo(id);
  } catch (e) {
    if (e instanceof CompanyError) {
      throw new ApiError(e.message, HttpStatus.Error.Client.NotFound);
    }

    throw e;
  }
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

  try {
    return await CompanyService.fetchInfoFromVat(vat);
  } catch (e) {
    if (e instanceof CompanyError) {
      throw new ApiError(e.message, HttpStatus.Error.Client.NotFound);
    }

    throw e;
  }
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
