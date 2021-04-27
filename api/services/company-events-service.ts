import type {
  CamelCasedPropertiesDeep,
} from "type-fest";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  participantEventsQuery,
} from "../graphql/queries";
import type {
  Company as GraphQlCompany,
  Workshop as GraphQlWorkshop,
  Presentation as GraphQlPresentation,
} from "../graphql/types";
import {
  graphQlQuery,
} from "../helpers/axios";
import {
  HttpStatus,
} from "../helpers/http";
import PanelsService, {
  PanelWithInfo,
} from "./panels-service";
import CompanyService, {
  Company,
} from "./company-service";
import {
  ServiceError,
} from "./error-service";

type Workshop = CamelCasedPropertiesDeep<GraphQlWorkshop>;
type Presentation = CamelCasedPropertiesDeep<GraphQlPresentation>

interface CompanyId {
  company: {
    id: string;
  };
}

export type Event = PanelWithInfo | (Presentation & CompanyId) | (Workshop & CompanyId);

export interface Events {
  companies: Company[];
  panels: PanelWithInfo[];
  presentations: (Presentation & CompanyId)[];
  workshops: (Workshop & CompanyId)[]
}

const typeTransformer = (type: string): keyof Events => {
  switch (type) {
    case "presentation":
    case "talk":
      return "presentations";
    case "workshop":
      return "workshops";
    case "panel":
      return "panels";
    default:
      return "panels";
  }
};

export class CompanyEventsError extends ServiceError {
}

export default class CompanyEventsServices {
  cacheForMs: number = 15 * 1000;

  static async listAll(): Promise<Events> {
    const [
      { companies, ...eventList },
      panels,
    ] = await Promise.all([
      graphQlQuery(participantEventsQuery()),
      PanelsService.listWithInfo(),
    ]);

    const events: Omit<Events, "companies"> = {
      panels,
      ...eventList,
    };

    return keysFromSnakeToCamelCase({
      companies: companies.map(CompanyService.fixCompany),
      ...events,
    } as Events);
  }

  static async listNotPassed(): Promise<Events> {
    const { companies, ...events } = await this.listAll();

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const eventHasNotPassed =
      (
        {
          date,
          occuresAt,
          occures_at: occuresAtOther,
        },
      ) =>
        new Date(date || occuresAt || occuresAtOther) >= oneHourAgo
    ;

    const removePassedEvents =
      (
        [
          key,
          events,
        ],
      ) =>
        [
          key,
          events.filter(eventHasNotPassed),
        ]
    ;

    const filteredEvents = Object.fromEntries(
      Object
        .entries(events)
        .map(removePassedEvents)
      ,
    );

    return {
      companies,
      ...filteredEvents,
    };
  }

  static async listPanelsForCompany(id: string | number): Promise<PanelWithInfo> {
    const panel = await PanelsService.fullInfo(id);

    return {
      ...panel,
      occuresAt: panel.date,
    };
  }

  static async listEventsForCompany(id: string | number, type: string): Promise<Event & { company: Company }> {
    const transformedType = typeTransformer(type);

    const data = await graphQlQuery(participantEventsQuery());
    const { companies }: { companies: GraphQlCompany[] } = data;
    const objList: Event[] = data[transformedType];

    if (!objList) {
      throw new CompanyEventsError(
        `Nepoznat tip eventa: ${ transformedType }`,
        null,
        HttpStatus.Error.Client.Forbidden,
      );
    }

    const obj = objList.find(({ id: i }) => Number(i) === Number(id));

    if (!obj) {
      throw new CompanyEventsError("Event nije pronađen");
    }

    const company = companies.find(({ id }) => id === obj.company.id);

    if (!company) {
      throw new CompanyEventsError("Event nije pronađen");
    }

    return keysFromSnakeToCamelCase({
      ...obj,
      company: CompanyService.fixCompany(company),
    });
  }
}
