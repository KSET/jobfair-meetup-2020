import {
  queryCompanyApplicationCreate,
  queryCompanyApplicationGetByVat,
} from "../../db/helpers/companyApplication";
import {
 queryCompanyApplicationTalkCreate,
} from "../../db/helpers/companyApplicationTalk";
import {
 queryCompanyApplicationWorkshopCreate,
} from "../../db/helpers/companyApplicationWorkshop";
import {
 Client,
} from "../../db/methods";
import {
 dotGet,
} from "../../helpers/data";
import {
 keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  industriesQuery,
  participantsQuery,
} from "../graphql/queries";
import {
  graphQlQuery,
  post,
} from "../helpers/axios";
import {
 HttpStatus,
} from "../helpers/http";
import {
 ApiError,
} from "../helpers/route";
import {
 getSetting,
} from "../helpers/settings";
import CompanyEventsService from "./company-events-service";
import FileService from "./file-service";
import ImageService from "./image-service";

export default class CompanyService {
  static async fetchListAll() {
    const { companies } = await graphQlQuery(participantsQuery());

    if (!companies) {
      return [];
    }

    return companies.map(this.fixCompany);
  }

  static async fetchIndustries() {
    const { industries } = await graphQlQuery(industriesQuery());

    if (!industries) {
      return [];
    }

    return industries.sort((a, b) => Number(a.id) - Number(b.id));
  }

  static async fetchInfo(id) {
    const { companies, ...rawEvents } = await CompanyEventsService.listAll() || {};

    const company = companies.find(({ id: i }) => String(i) === String(id));

    if (!company) {
      throw new ApiError("Company not found", HttpStatus.Error.Client.NotFound);
    }

    const newType = (key) => {
      switch (key) {
        case "presentations":
          return "talk";
        case "workshops":
          return "workshop";
        default:
          return key.replace(/s$/, "");
      }
    };

    const events =
      Object
        .entries(rawEvents)
        .flatMap(
          ([ type, events ]) =>
            events.map(
              (event) =>
                Object.assign(
                  event,
                  {
                    type: newType(type),
                    title: event.title || event.name,
                    topic: event.topic || "Workshop",
                  },
                ),
            ),
        )
        .filter(({ company, companies }) => {
          if (String(company.id) === String(id)) {
            return true;
          }

          if (!companies) {
            return false;
          }

          return companies.find(({ info }) => String(info.id) === String(id));
        })
    ;

    return { ...company, events };
  }

  static async fetchInfoFromVat(vat) {
    const graphQlUrl = await getSetting(
      "GraphQL Endpoint",
      process.env.JOBFAIR_GRAPHQL_ENDPOINT,
    );

    const { origin: baseUrl } = new URL(graphQlUrl);

    const { data: company } =
      await post(
        `${ baseUrl }/api/v1/companies/info`,
        {
          vat,
        },
      ) || {}
    ;

    if (!company) {
      throw new ApiError(
        "vat-not-found",
        HttpStatus.Error.Client.NotFound,
        "VAT not found",
      );
    }

    return this.fixCompany(company);
  }

  static async submitApplication(application, files) {
    const client = await Client.inTransaction();
    const uploadedFiles = [];
    try {
      const { panel, talk, workshop, ...company } = application;

      if (panel) {
        company.panelInterested = true;
      }

      if (talk) {
        if (!("talk[image]" in files)) {
          throw new ApiError("Nedostaje slika za talk");
        }

        const { default: image } = await ImageService.upload(files["talk[image]"], 0);
        const { imageId } = image;
        uploadedFiles.push({
          id: imageId,
          fn: ImageService.remove,
        });

        talk.presenterPhotoId = imageId;
        talk.presenterDescription = talk.description;
        const { id } = await client.queryOne(queryCompanyApplicationTalkCreate(talk));

        company.talkId = id;
      }

      if (workshop) {
        const { id } = await client.queryOne(queryCompanyApplicationWorkshopCreate(workshop));

        company.workshopId = id;
      }

      const { default: image } = await ImageService.upload(files.logo, 0);
      const { imageId } = image;
      uploadedFiles.push({
        id: imageId,
        fn: ImageService.remove,
      });
      company.logoImageId = imageId;

      const { id: fileId } = await FileService.upload(files.vectorLogo, 0);
      company.vectorLogoFileId = fileId;

      company.website = company.homepageUrl;

      const newApplication = await client.queryOne(queryCompanyApplicationCreate(company));

      await client.commit();

      return newApplication;
    } catch (e) {
      await client.rollback();

      for (const { id, fn } of uploadedFiles) {
        await fn(id);
      }

      throw e;
    } finally {
      await client.end();
    }
  }

  static async fetchApplications(vat) {
    const data = await Client.queryOnce(queryCompanyApplicationGetByVat({ vat }));

    return data.map(keysFromSnakeToCamelCase);
  }

  static fixCompany(company) {
    const {
      name,
      brandName,
      shortDescription: description,
      logo,
      ...rest
    } = keysFromSnakeToCamelCase(company);

    return ({
      name: brandName || name,
      legalName: name,
      brandName,
      description,
      image: dotGet(logo, "large.url"),
      thumbnail: dotGet(logo, "small.url"),
      images: logo,
      ...rest,
    });
  }
}
