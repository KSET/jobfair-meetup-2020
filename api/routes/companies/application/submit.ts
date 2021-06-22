import * as Sentry from "@sentry/node";
import qs from "qs";
import {
  companyExtrasFormLabels,
  companyExtrasFormValidations,
  companyFormLabels,
  companyFormValidations,
} from "../../../../helpers/company-applications";
import {
  pipe,
  withoutKeys,
} from "../../../../helpers/object";
import {
 HttpStatus,
} from "../../../helpers/http";
import {
  ApiError,
  Router,
} from "../../../helpers/route";
import CompanyApplicationService from "../../../services/company-application-service";
import CompanyApplicationTokenService from "../../../services/company-application-token-service";
import {
 ServiceError,
} from "../../../services/error-service";
import SlackNotificationService from "../../../services/slack-notification-service";

const router = new Router();

router.post("/", async (req) => {
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

export default router;
