import * as Sentry from "@sentry/node";
import qs from "qs";
import {
  companyExtrasFormLabels,
  companyExtrasFormValidations,
  companyFormLabels,
  companyFormValidations,
} from "../../helpers/company-applications";
import {
  pipe,
  withoutKeys,
} from "../../helpers/object";
import {
  sendCsv,
} from "../helpers/csv";
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
import CompanyApplicationTokenService from "../services/company-application-token-service";
import CompanyEventsService, {
  CompanyEventsError,
} from "../services/company-events-service";
import CompanyService, {
  CompanyError,
} from "../services/company-service";
import {
  ServiceError,
} from "../services/error-service";
import EventReservationsService from "../services/event-reservations-service";
import SlackNotificationService from "../services/slack-notification-service";
import VatValidator from "../services/vat-validator";

const router = new Router();

router.post("/application/submit", async (req) => {
  const { body, files } = req;

  const applicationsEnabled = await CompanyApplicationService.areApplicationsEnabled();

  if (!applicationsEnabled) {
    if (!body.token) {
      throw new ApiError(
        "Prijave su zatvorene",
        HttpStatus.Error.Client.Forbidden,
      );
    }

    const tokenValid = await CompanyApplicationTokenService.isApplicationTokenValid(body.token);

    if (!tokenValid) {
      throw new ApiError(
        "Predani token za prijavu nije valjan",
        HttpStatus.Error.Client.Forbidden,
      );
    }
  } else {
    delete body.token;
  }

  const application =
    qs.parse(
      Object
        .entries(body)
        .map(([ key, value ]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(String(value)) }`)
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

  const formLabels = {
    ...companyFormLabels(),
    ...companyExtrasFormLabels(),
  };

  const mainValidations = withoutKeys(
    [
      "logo",
      "vectorLogo",
    ],
    companyFormValidations(),
  );
  const partsValidations = pipe(
    Object.entries,
    (entries) => entries.map(([ k, v ]) => [ k, v.form ]),
    Object.fromEntries,
  )(companyExtrasFormValidations());

  const validateField = (validations, group) => (...path) => {
    const field = path.reduce((acc, a) => acc[a], application);
    const label = path.reduce((acc, a) => acc[a], formLabels);

    for (const [ validation, validate ] of Object.entries(validations)) {
      const isValid = (validate as any)(field);

      if (!isValid) {
        throw new ApiError(
          "Greška u predanim podatcima.",
          HttpStatus.Error.Client.ExpectationFailed,
          {
            validation,
            label,
            group,
            path,
          },
        );
      }
    }
  };

  for (const [ fieldName, validations ] of Object.entries(mainValidations)) {
    validateField(validations, "main")(fieldName);
  }

  for (const [ part, validationObject ] of Object.entries(partsValidations)) {
    if (!(part in application)) {
      continue;
    }

    for (const [ fieldName, validations ] of Object.entries(validationObject as any)) {
      validateField(validations, "parts")(part, fieldName);
    }
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
          extra: req,
        } as any,
      );

      throw new ApiError(
        "Nešto je pošlo krivo. Molimo probajte ponovno.",
        HttpStatus.Error.Server.InternalServerError,
        e.message,
      );
    }
  }
});

router.post("/application/token/verify", async ({ body }) => {
  const { token } = body;

  if (!token) {
    throw new ApiError(
      "Token se mora predati",
      HttpStatus.Error.Client.UnprocessableEntity,
    );
  }

  return await CompanyApplicationTokenService.isApplicationTokenValid(token);
});

router.get("/application/by-vat/:vat", async ({ params }) => {
  const { vat } = params;

  return await CompanyApplicationService.fetchApplicationsByVat(vat) || [];
});

router.get("/participants", async () => {
  return await CompanyService.fetchListAll();
});

router.get("/industries", async () => {
  return await CompanyService.fetchIndustries();
});

router.get("/events/all", async () => {
  return await CompanyEventsService.listAll();
});

router.get("/events", async () => {
  return await CompanyEventsService.listNotPassed();
});

router.get("/events/panel/:id", async ({ params }) => {
  const { id } = params;

  return await CompanyEventsService.listPanelsForCompany(id);
});

router.get("/events/:type/:id", async ({ params }) => {
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
});

router.get("/info/:id", async ({ params }) => {
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

authRouter.post("/application/token", async ({ body, authUser }) => {
  const createdBy = authUser.id;
  const { note } = body;

  return await CompanyApplicationTokenService.createApplicationToken(createdBy, note);
});

authRouter.delete("/application/token/:id", async ({ params }) => {
  const { id } = params;

  return await CompanyApplicationTokenService.deleteApplicationTokenById(id);
});

authRouter.get("/application/token/list", async () => {
  return await CompanyApplicationTokenService.listApplicationTokens();
});

authRouter.get("/event-info/:eventType/reservations", async ({ authHeader, params }) => {
  return await EventReservationsService.listFormattedFor(authHeader, params.eventType);
});

authRouter.getRaw("/event-info/:eventType/reservations.csv", async ({ authHeader, params }, res) => {
  const events = await EventReservationsService.listFormattedFor(authHeader, params.eventType);

  const headers = [
    "Workshop name",
    "Company name",
    "Participant name and email",
  ];

  const rows =
    events
      .map(
        (
          {
            title,
            company,
            users,
          },
        ) =>
          users.map(
            ({ name, email }) =>
              [
                title,
                company,
                `${ name } <${ email }>`,
              ]
            ,
          )
        ,
      )
      .flat()
  ;

  return sendCsv(
    res,
    {
      fileName: `${ params.eventType }-reservations.csv`,
      headers,
      rows,
    },
  );
});

export default authRouter;
