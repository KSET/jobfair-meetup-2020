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
  ApiError,
} from "../helpers/route";
import FileService from "./file-service";
import ImageService from "./image-service";

export default class CompanyApplicationService {
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
