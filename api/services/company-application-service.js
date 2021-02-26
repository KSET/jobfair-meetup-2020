// import {
//   async as StreamZipAsync,
// } from "node-stream-zip";
import {
  queryCompanyApplicationCreate,
  queryCompanyApplicationGetAll,
  queryCompanyApplicationGetByVat,
} from "../../db/helpers/companyApplication";
import {
  queryCompanyApplicationTalkCreate,
  queryCompanyApplicationTalkGetByIds,
} from "../../db/helpers/companyApplicationTalk";
import {
  queryCompanyApplicationWorkshopCreate,
  queryCompanyApplicationWorkshopGetByIds,
} from "../../db/helpers/companyApplicationWorkshop";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
  pipe,
  withoutKeys,
} from "../../helpers/object";
import {
  HttpStatus,
} from "../helpers/http";
import CompanyApplicationTokenService from "./company-application-token-service";
import {
  ServiceError,
} from "./error-service";
import FileService from "./file-service";
import ImageService from "./image-service";
import SettingsService from "./settings-service";

export class CompanyApplicationError extends ServiceError {
}

export default class CompanyApplicationService {
  static get ALLOWED_VECTOR_LOGO_FORMATS() {
    return {
      "application/eps": "eps",
      "application/pdf": "pdf",
      "application/postscript": "ai",
    };
  };

  static async areApplicationsEnabled() {
    const setting = await SettingsService.getValue("Company Applications Enabled", "no");

    return "yes" === String(setting).toLowerCase();
  }

  static async submitApplication(application, files) {
    const client = await Client.inTransaction();
    const uploadedFiles = [];
    try {
      const { panel, talk, workshop, token, ...company } = application;

      // let zip;
      // try {
      //   zip = new StreamZipAsync({
      //     file: files.vectorLogo.tempFilePath,
      //   });
      //
      //   if (4 < await zip.entriesCount) {
      //     throw new CompanyApplicationError("Najviše 4 stavke dopuštene unutar ZIP datoteke s vektorskim logom");
      //   }
      //
      //   const allowedExtensions =
      //     Object
      //       .values(this.ALLOWED_VECTOR_LOGO_FORMATS)
      //       .map((ext) => `.${ ext }`)
      //   ;
      //
      //   for (const { name } of Object.values(await zip.entries())) {
      //     if (!allowedExtensions.some((ext) => name.endsWith(ext))) {
      //       const [ ext, ...exts ] = allowedExtensions;
      //
      //       throw new CompanyApplicationError(`ZIP s vektorskim logom smije sadržavati samo ${ exts.join(", ") } i ${ ext } datoteke`);
      //     }
      //   }
      // } catch (e) {
      //   if (e instanceof CompanyApplicationError) {
      //     throw e;
      //   }
      //
      //   throw new CompanyApplicationError(
      //     "Dogodila se greška pri procesiranju ZIP datoteke. Molimo provjerite je li ZIP valjan i probajte ponovno. Ako se greška ponovi probajte stvoriti novu ZIP datoteku.",
      //     e.message,
      //   );
      // } finally {
      //   try {
      //     if (zip) {
      //       await zip.close();
      //     }
      //   } catch {
      //   }
      // }

      if (panel) {
        company.panelInterested = true;
      }

      if (talk) {
        if (!("talk[image]" in files)) {
          throw new CompanyApplicationError("Nedostaje slika za talk");
        }

        const { default: image } = await ImageService.upload(files["talk[image]"], 0);
        const { imageId } = image;
        uploadedFiles.push({
          id: imageId,
          fn: ImageService.remove,
        });

        talk.presenterPhotoId = imageId;
        talk.presenterDescription = talk.biography;
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

      if (token) {
        const tokenConsumed = await CompanyApplicationTokenService.consumeApplicationToken(
          {
            token: application.token,
            applicationId: newApplication.id,
          },
          client,
        );

        if (!tokenConsumed) {
          throw new CompanyApplicationError(
            "Nije moguće obraditi prijavu s predanim tokenom",
            null,
            HttpStatus.Error.Client.UnprocessableEntity,
          );
        }
      }

      await client.commit();

      return this.FixApplication(newApplication);
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

  static async fetchApplicationsByVat(vat) {
    const data = await Client.queryOnce(queryCompanyApplicationGetByVat({ vat }));

    return data.map(this.FixApplication);
  }

  static async fetchApplications() {
    const data = await Client.queryOnce(queryCompanyApplicationGetAll());

    return data.map(this.FixApplication);
  }

  static async fetchApplicationsFull() {
    const applications = await this.fetchApplications();

    const getIds = (key) => applications.map(({ [`${ key }Id`]: id }) => id).filter((a) => a);

    const logoIds = getIds("logoImage");
    const fileIds = getIds("vectorLogoFile");
    const talkIds = getIds("talk");
    const workshopIds = getIds("workshop");

    const files = await FileService.listInfoAsObject(...fileIds);
    const talksList = await Client.queryOnce(queryCompanyApplicationTalkGetByIds(talkIds));
    const workshopsList = await Client.queryOnce(queryCompanyApplicationWorkshopGetByIds(workshopIds));
    const talks = Object.fromEntries(
      talksList
        .map((talk) => [
          talk.id,
          keysFromSnakeToCamelCase(talk),
        ])
      ,
    );
    const workshops = Object.fromEntries(
      workshopsList
        .map((workshop) => [
          workshop.id,
          keysFromSnakeToCamelCase(workshop),
        ])
      ,
    );

    const talkPresenterPhotoIds = talksList.map(({ presenter_photo_id: presenterPhotoId }) => presenterPhotoId).filter((a) => a);

    const images = await ImageService.listInfoAsObject(logoIds, talkPresenterPhotoIds);

    const imageObject =
      (imageId) =>
        Object.fromEntries(
          images[imageId]
            .map((img) => [ img.name, img ])
          ,
        )
    ;
    const assignImages = (application) => {
      application.logo = imageObject(application.logoImageId);

      if (application.talk) {
        application.talk.presenterPhoto = imageObject(application.talk.presenterPhotoId);

        delete application.talk.presenterPhotoId;
      }

      return application;
    };

    const assignFile = (application) => {
      application.vectorLogo = files[application.vectorLogoFileId];

      return application;
    };

    const assignTalk = (application) => {
      application.talk = talks[application.talkId];

      return application;
    };

    const assignWorkshop = (application) => {
      application.workshop = workshops[application.workshopId];

      return application;
    };

    const formatApplication = pipe(
      assignFile,
      assignTalk,
      assignWorkshop,
      assignImages,
      withoutKeys.bind(null, [ "talkId", "workshopId", "logoImageId", "vectorLogoFileId" ]),
    );

    return applications.map(formatApplication);
  }

  static FixApplication(application) {
    return keysFromSnakeToCamelCase(application);
  }
}
