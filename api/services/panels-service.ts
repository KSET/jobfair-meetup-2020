import _ from "lodash/fp";
import {
  queryPanelsCreate,
  queryPanelsDeleteById,
  queryPanelsGetAll,
  queryPanelsGetById,
  queryPanelsUpdateById,
} from "../../db/helpers/panels";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  HttpStatus,
} from "../helpers/http";
import {
  ApiError,
} from "../helpers/route";
import {
  queryReservationsDeleteByEventId,
} from "../../db/helpers/reservations";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import CompanyService from "./company-service";
import type {
  Company,
} from "./company-service";

type ID = number | string;

interface CompanyInfo {
  info: Company;
  aboutPanelist: string;
}

interface BasicCompanyInfo {
  companyId: string;
  aboutPanelist: string;
}

interface PanelEditableFields {
  title: string;
  description: string;
  occuresAt: string;
  companies: string[];
}

export interface Panel {
  id: ID;
  description: string;
  title: string;
  occuresAt: string;
  date: string;
  companies: BasicCompanyInfo[];
}

export interface PanelWithInfo {
  id: ID;
  description: string;
  title: string;
  occuresAt: string;
  date: string;
  companies: CompanyInfo[];
  type: "panel";
  location: string;
  company: Company;
}

type CompanyMap = Record<Company["id"], Company>;

const fixEntry: ((unknown: unknown) => Panel) =
  _.flow(
    keysFromSnakeToCamelCase,
    _.omit([ "createdAt", "updatedAt" ]),
    (entry) => ({
      ...entry,
      date: entry.occuresAt,
    }),
  )
;

const addInfo =
  (companyList: CompanyMap): ((arg: unknown) => PanelWithInfo) =>
    _.flow(
      ({ companies, ...panel }) => ({
        ...panel,
        companies: companies.map(({ companyId, ...rest }) => ({
          info: companyList[companyId],
          ...rest,
        })),
        type: "panel",
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

export default class PanelsService {
  static async list(): Promise<Panel[]> {
    const entries = await Client.queryOnce(queryPanelsGetAll());

    return entries?.map(fixEntry) || [];
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

  static async info(id: ID): Promise<Panel> {
    const entry = await Client.queryOneOnce(queryPanelsGetById({ id }));

    if (!entry) {
      throw new ApiError(
        "Panel not found",
        HttpStatus.Error.Client.NotFound,
      );
    }

    return fixEntry(entry);
  }

  static async fullInfo(id: ID): Promise<PanelWithInfo> {
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
    const data = await Client.queryOneOnce(queryPanelsCreate({
      title,
      description,
      occuresAt,
      companies,
    }));

    return fixEntry(data);
  }

  static async update(
    id: ID,
    {
      title,
      description,
      occuresAt,
      companies,
    }: Partial<PanelEditableFields>,
  ): Promise<Panel> {
    const client = await Client.inTransaction();

    try {
      const oldPanel = await this.info(id);

      if (!oldPanel) {
        throw new ApiError("Panel not found", HttpStatus.Error.Client.NotFound);
      }

      const data = await client.queryOne(queryPanelsUpdateById(
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

      await client.commit();

      return fixEntry(data);
    } catch (e) {
      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }

  static async delete(id: ID): Promise<boolean> {
    const client = await Client.inTransaction();

    try {
      const oldPanel = await client.queryOne(queryPanelsGetById({ id }));

      if (!oldPanel) {
        return true;
      }

      const deletedPanel = await client.queryOne(queryPanelsDeleteById({ id }));

      if (!deletedPanel) {
        throw new ApiError("Something went wrong", HttpStatus.Error.Server.InternalServerError);
      }

      await client.queryOne(queryReservationsDeleteByEventId({
        eventType: "panel",
        eventId: id,
      }));

      await client.commit();

      return true;
    } catch (e) {
      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }
}
