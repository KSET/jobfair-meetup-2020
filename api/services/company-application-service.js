import {
  queryCompanyApplicationCreate,
  queryCompanyApplicationGetAll,
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
  keysFromSnakeToCamelCase,
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

  static FixApplication(application) {
    return keysFromSnakeToCamelCase(application);
  }
}
