import _ from "lodash/fp";
import type {
  AsyncReturnType,
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
  Presentation as GraphQlPresentation,
  Workshop as GraphQlWorkshop,
  Participants as GraphQlParticipants,
  Participant as GraphQlParticipant,
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
type Participants = CamelCasedPropertiesDeep<GraphQlParticipants>;
type Participant = CamelCasedPropertiesDeep<GraphQlParticipant>;

export type Event = Participant | PanelWithInfo;

export interface Events extends Omit<Participants, "companies"> {
  companies: Company[];
  panels: PanelWithInfo[];
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

const typeTransformer = (type: string): keyof Omit<Events, "companies"> | null => {
  switch (type) {
    case "presentation":
    case EventType.talk:
      return "presentations";
    case EventType.workshop:
      return "workshops";
    case EventType.panel:
      return "panels";
    default:
      return null;
  }
};

const fetchParticipantsCached: () => Promise<EventsWithoutPanels | null> =
  cachedFetcher<EventsWithoutPanels>(
    "participant-events",
    45 * 1000,
    async (): Promise<EventsWithoutPanels> => {
      const {
        companies,
        ...eventList
      }: GraphQlParticipants = await graphQlQuery(participantEventsQuery()) || {};

      return keysFromSnakeToCamelCase({
        companies: companies?.map(CompanyService.fixCompany),
        ...eventList,
      });
    },
  )
;

export class CompanyEventsError extends ServiceError {
}

export default class CompanyEventsService {
  static async listAll(): Promise<Events> {
    const [
      participants,
      panels,
    ] = await Promise.all([
      fetchParticipantsCached(),
      PanelsService.listWithInfo(),
    ]);

    const noParticipants: AsyncReturnType<typeof fetchParticipantsCached> = {
      companies: [],
      presentations: [],
      workshops: [],
    };

    return {
      ...(participants || noParticipants),
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

  static async listEventOfTypeForCompany(companyId: Company["id"], type: string): Promise<Event> {
    if ("panel" === type) {
      return await CompanyEventsService.listPanelsForCompany(companyId);
    } else {
      return await CompanyEventsService.listEventsForCompany(companyId, type);
    }
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

  private static async listPanelsForCompany(id: Company["id"]): Promise<PanelWithInfo> {
    const panel = await PanelsService.fullInfo(Number(id));

    return {
      ...panel,
      occuresAt: panel.date,
    };
  }

  private static async listEventsForCompany(id: Company["id"], type: string): Promise<Participant & { company: Company }> {
    const transformedType = typeTransformer(type);

    if (!transformedType) {
      throw new CompanyEventsError(
        `Nepoznat tip eventa: ${ type }`,
        null,
        HttpStatus.Error.Client.Forbidden,
      );
    }

    const data: AsyncReturnType<typeof fetchParticipantsCached> | Record<string, never> = await fetchParticipantsCached() || {};
    const { companies = [], ...events } = data;

    const objList: Participant[] = events[transformedType];

    if (!objList) {
      throw new CompanyEventsError(
        `Nepoznat tip eventa: ${ type }`,
        null,
        HttpStatus.Error.Client.Forbidden,
      );
    }

    const obj = objList.find(({ id: i }) => String(i) === String(id));

    if (!obj) {
      throw new CompanyEventsError("Event nije pronađen");
    }

    const company = companies.find(({ id }) => id === obj.company.id);

    if (!company) {
      throw new CompanyEventsError("Event nije pronađen");
    }

    return {
      ...obj,
      company,
    };
  }
}
