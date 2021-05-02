import type {
  UploadedFile,
} from "express-fileupload";
import _ from "lodash/fp";
import {
  EventType,
} from "../../components/student/event-status";
import type {
  Image,
} from "../../db/helpers/image";
import {
  PanelCompany,
  queryPanelsCreate,
  queryPanelsDeleteById,
  queryPanelsGetAll,
  queryPanelsGetById,
  queryPanelsUpdateById,
} from "../../db/helpers/panels";
import type {
  Panel as DbPanel,
  PanelCompany as DbPanelCompany,
} from "../../db/helpers/panels";
import {
  queryReservationsDeleteByEventId,
} from "../../db/helpers/reservations";
import type {
  EventReservation,
} from "../../db/helpers/reservations";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
} from "../helpers/http";
import {
  ApiError,
} from "../helpers/route";
import type {
  Company,
} from "./company-service";
import CompanyService from "./company-service";
import {
  ServiceError,
} from "./error-service";
import ImageService from "./image-service";
import type {
  ImageInfo,
} from "./image-service";

interface BasicCompanyInfo extends Omit<DbPanelCompany, "uploaderId"> {
  images?: ImageInfo[];
}

interface CompanyInfo extends Omit<BasicCompanyInfo, "companyId"> {
  info: Company;
}

export interface PanelCompanyEntry extends DbPanelCompany {
  imageFile?: UploadedFile;
}

export interface PanelEditableFields {
  title: string;
  description: string;
  occuresAt: string;
  companies: PanelCompanyEntry[];
}

export interface Panel {
  id: number;
  description: string;
  title: string;
  occuresAt: string;
  date: string;
  companies: BasicCompanyInfo[];
}

export interface PanelWithInfo extends Omit<Panel, "companies"> {
  companies: CompanyInfo[];
  type: EventType.panel;
  location: "KSET";
  company: Company;
}

type CompanyMap = Record<Company["id"], Company>;

const fixEntry: ((panel: DbPanel) => Panel) =
  _.flow(
    keysFromSnakeToCamelCase,
    _.omit([ "createdAt", "updatedAt" ]),
    (entry: Panel) => ({
      ...entry,
      companies: entry.companies.map(_.omit([ "uploaderId" ])),
      date: entry.occuresAt,
    }),
  )
;

const addInfo =
  (companyList: CompanyMap): ((arg: Panel) => PanelWithInfo) =>
    _.flow(
      ({ companies, ...panel }: Panel) => ({
        ...panel,
        companies: companies.map(({ companyId, ...rest }) => ({
          info: companyList[companyId],
          ...rest,
        })),
        type: EventType.panel,
        location: "KSET",
      }),
      (panel) => ({
        ...panel,
        company: panel.companies[0]?.info,
      }),
    )
;

const fetchCompanies = cachedFetcher<CompanyMap>(
  15 * 1000,
  async () => {
    const rawCompanies = await CompanyService.fetchListAll();

    return Object.fromEntries(rawCompanies.map((c) => [ c.id, c ]));
  },
);

export class PanelsServiceError extends ServiceError {
}

const getImageIds: (panels: DbPanel[]) => Image["id"][] =
  _.flow(
    _.flatMap(_.get("companies")),
    _.map(_.get("imageId")),
    _.uniq,
    _.compact,
  )
;

const getImages =
  async (panels: DbPanel[]): Promise<Record<Image["id"], ImageInfo[]>> =>
    await ImageService.listInfoAsObject(
      ...getImageIds(panels),
    )
;

const assignImagesToPanels =
  async (panels: DbPanel[]): Promise<DbPanel[]> => {
    const images = await getImages(panels);

    for (const entry of panels) {
      for (const company of entry.companies) {
        if (!company.imageId) {
          continue;
        }

        (company as BasicCompanyInfo).images = images[company.imageId];
      }
    }

    return panels;
  }
;

const assignImagesToPanel =
  (panel: DbPanel): Promise<DbPanel> =>
    assignImagesToPanels([ panel ])
      .then(([ newPanel ]) => newPanel)
;

const uploadCompanyImages =
  async (companies: PanelEditableFields["companies"], client: Client): Promise<void> => {
    const images: Record<PanelCompanyEntry["companyId"], Record<string, ImageInfo>> =
      await
        Promise
          .all(
            _.flow(
              _.filter(_.get("imageFile")),
              _.map(async (c: Required<PanelCompanyEntry>) => [
                c.companyId,
                await ImageService.upload(c.imageFile, c.uploaderId, client),
              ]),
            )(companies),
          )
          .then(_.fromPairs)
    ;

    for (const company of companies) {
      if (company.companyId in images) {
        company.imageId = images[company.companyId].default.imageId;
      }

      delete company.imageFile;
    }
  }
;

export default class PanelsService {
  static async list(): Promise<Panel[]> {
    const dbEntries = await Client.queryOnce<DbPanel>(queryPanelsGetAll()) || [];
    const entries = await assignImagesToPanels(dbEntries);

    return entries.map(fixEntry);
  }

  static async listWithInfo(): Promise<PanelWithInfo[]> {
    const [
      panels,
      companyList,
    ] = await Promise.all([
      this.list(),
      fetchCompanies(),
    ]);

    return panels.map(addInfo(companyList)) || [];
  }

  static async info(id: Panel["id"]): Promise<Panel> {
    const entry = await Client.queryOneOnce<DbPanel>(queryPanelsGetById({ id }));

    if (!entry) {
      throw new ApiError(
        "Panel not found",
        HttpStatus.Error.Client.NotFound,
      );
    }

    const entryWithImage = await assignImagesToPanel(entry);

    return fixEntry(entryWithImage);
  }

  static async fullInfo(id: Panel["id"]): Promise<PanelWithInfo> {
    const [
      entry,
      companyList,
    ] = await Promise.all([
      this.info(id),
      fetchCompanies(),
    ]);

    return addInfo(companyList)(entry);
  }

  static async create(
    {
      title,
      description,
      occuresAt,
      companies,
    }: PanelEditableFields,
  ): Promise<Panel> {
    const data = await Client.transaction<DbPanel>(async (client) => {
      await uploadCompanyImages(companies, client);

      const panel = await client.queryOne<DbPanel>(queryPanelsCreate({
        title,
        description,
        occuresAt,
        companies,
      }));

      if (!panel) {
        throw new PanelsServiceError("Something went wrong while creating panel");
      }

      return panel;
    });

    const dataWithImages = await assignImagesToPanel(data);

    return fixEntry(dataWithImages);
  }

  static async update(
    id: Panel["id"],
    {
      title,
      description,
      occuresAt,
      companies,
    }: PanelEditableFields,
  ): Promise<Panel> {
    return await Client.transaction<Panel>(async (client) => {
      const oldPanel = await this.info(id);

      if (!oldPanel) {
        throw new ApiError("Panel not found", HttpStatus.Error.Client.NotFound);
      }

      for (const company of companies) {
        delete (company as BasicCompanyInfo).images;

        company.imageId = Number(company.imageId);
        if (!_.isFinite(company.imageId)) {
          delete company.imageId;
        }
      }

      const getCompanyImages: (info: BasicCompanyInfo[]) => Extract<BasicCompanyInfo["imageId"], number>[] =
        _.flow(
          _.flatMap(_.get("imageId")),
          _.compact,
        )
      ;

      const oldCompanyImages = getCompanyImages(oldPanel.companies);
      const newCompanyImages = getCompanyImages(companies);

      const deletedImages: Extract<BasicCompanyInfo["imageId"], number>[] = _.difference(oldCompanyImages, newCompanyImages);

      await uploadCompanyImages(companies, client);

      const data = await client.queryOne<DbPanel>(queryPanelsUpdateById(
        oldPanel.id,
        {
          title,
          description,
          occuresAt,
          companies,
        },
      ));

      if (!data) {
        throw new ApiError("Something went wrong", HttpStatus.Error.Server.InternalServerError);
      }

      await Promise.all(
        deletedImages.map((id) => ImageService.remove(id, client)),
      );

      const dataWithImages = await assignImagesToPanel(data);

      return fixEntry(dataWithImages);
    });
  }

  static async delete(id: Panel["id"]): Promise<boolean> {
    return await Client.transaction(async (client) => {
      const oldPanel = await client.queryOne<DbPanel>(queryPanelsGetById({ id }));

      if (!oldPanel) {
        return true;
      }

      const deletedPanel = await client.queryOne<Pick<DbPanel, "id">>(queryPanelsDeleteById({ id }));

      if (!deletedPanel) {
        throw new ApiError("Something went wrong", HttpStatus.Error.Server.InternalServerError);
      }

      await Promise.all(
        oldPanel
          .companies
          .filter(({ imageId }) => imageId)
          .map((company: Required<PanelCompany>) => ImageService.remove(company.imageId, client))
        ,
      );

      await client.queryOne<Pick<EventReservation, "id">>(queryReservationsDeleteByEventId({
        eventType: EventType.panel,
        eventId: Number(id),
      }));

      return true;
    });
  }
}
