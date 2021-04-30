import _ from "lodash/fp";
import type {
  CamelCasedPropertiesDeep,
} from "type-fest";
import {
  EventType,
} from "../../components/student/event-status";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  participantEventsQuery,
} from "../graphql/queries";
import type {
  Company as GraphQlCompany,
  Presentation as GraphQlPresentation,
  Workshop as GraphQlWorkshop,
  Participants as GraphQlParticipants,
} from "../graphql/types";
import {
  graphQlQuery,
} from "../helpers/axios";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
} from "../helpers/http";
import type {
  Company,
} from "./company-service";
import CompanyService from "./company-service";
import {
  ServiceError,
} from "./error-service";
import PanelsService, {
  Panel,
  PanelWithInfo,
} from "./panels-service";

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

type EventsWithoutPanels = Omit<Events, "panels">;

type CompanyWithoutId = Omit<Company, "id">;

export interface PresentationWithInfo extends Presentation {
  type: EventType.talk;
  company: CompanyWithoutId;
}

export interface WorkshopWithInfo extends Omit<Workshop, "name"> {
  type: EventType.workshop;
  title: Workshop["name"]
  topic: "Workshop";
  company: CompanyWithoutId;
}

export type FixedEvent = Omit<PresentationWithInfo | WorkshopWithInfo | PanelWithInfo, "occuresAt"> & { date: Date };

const typeTransformer = (type: string): keyof Events => {
  switch (type) {
    case "presentation":
    case EventType.talk:
      return "presentations";
    case EventType.workshop:
      return "workshops";
    case EventType.panel:
      return "panels";
    default:
      return "panels";
  }
};

const cacheTimeoutMs = 15 * 1000;
const fetchParticipantsCached: () => Promise<EventsWithoutPanels> =
  cachedFetcher<EventsWithoutPanels>(
    cacheTimeoutMs,
    async (): Promise<EventsWithoutPanels> => {
      const {
        companies,
        ...eventList
      }: GraphQlParticipants = await graphQlQuery(participantEventsQuery());

      return keysFromSnakeToCamelCase({
        companies: companies.map(CompanyService.fixCompany),
        ...eventList,
      });
    },
  )
;

export class CompanyEventsError extends ServiceError {
}

export default class CompanyEventsServices {
  static async listAll(): Promise<Events> {
    const [
      participants,
      panels,
    ] = await Promise.all([
      fetchParticipantsCached(),
      PanelsService.listWithInfo(),
    ]);

    return {
      ...participants,
      panels,
    };
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

  static Format(data: Events): FixedEvent[] {
    const {
      companies: rawCompanies,
      presentations: rawPresentations = [],
      workshops: rawWorkshops = [],
      panels: rawPanels = [],
    } = data;

    if (!rawCompanies || !rawPresentations || !rawWorkshops) {
      return [];
    }

    const companies: Record<Company["id"], Company> =
      Object.fromEntries(
        rawCompanies
          .map((c) => [ c.id, c ]),
      )
    ;

    const presentations: PresentationWithInfo[] =
      rawPresentations
        .map(
          ({ company, ...rest }) => ({
            ...rest,
            company: companies[company.id],
            type: EventType.talk,
          }),
        )
    ;

    const workshops: WorkshopWithInfo[] =
      rawWorkshops
        .map(
          ({ company, name, ...rest }) => ({
            ...rest,
            company: companies[company.id],
            type: EventType.workshop,
            title: name,
            topic: "Workshop",
          }),
        )
    ;

    const fixPanel: (panel: PanelWithInfo) => PanelWithInfo =
      _.flow(
        ({ companies: rawCompanies, ...panel }: Panel): Omit<PanelWithInfo, "company"> => ({
          ...panel,
          companies: rawCompanies.map(({ companyId, ...rest }) => ({
            info: companies[companyId],
            ...rest,
          })) as unknown as PanelWithInfo["companies"],
          type: EventType.panel,
          location: "KSET",
          occuresAt: panel.date,
        }),
        (panel: Omit<PanelWithInfo, "company">): PanelWithInfo => ({
          ...panel,
          company: panel.companies[0].info,
        }),
      )
    ;
    const panels = rawPanels.map((panel) => fixPanel(panel));

    return (
      [
        ...presentations,
        ...workshops,
        ...panels,
      ]
        .map(
          <T extends { occuresAt: string | Date }>({ occuresAt, ...rest }: T): Omit<T, "occuresAt"> & { date: Date } =>
            ({ ...rest, date: new Date(occuresAt) })
          ,
        )
        .sort(
          (a, b) =>
            Number(b.date) - Number(a.date)
          ,
        )
    );
  }
}
