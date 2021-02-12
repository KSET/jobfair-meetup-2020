import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  participantEventsQuery,
} from "../graphql/queries";
import {
  graphQlQuery,
} from "../helpers/axios";
import {
  HttpStatus,
  internalRequest,
} from "../helpers/http";
import CompanyService from "./company-service";
import {
  ServiceError,
} from "./error-service";

const typeTransformer = (type) => {
  switch (type) {
    case "presentation":
    case "talk":
      return "presentations";
    case "workshop":
      return "workshops";
    default:
      return `${ type }s`;
  }
};

export class CompanyEventsError extends ServiceError {
}

export default class CompanyEventsServices {
  static async listAll() {
    const { companies, ...eventList } = await graphQlQuery(participantEventsQuery());

    const { data: panels } = await internalRequest("get", "/panels/list/with-info");

    const events = {
      panels,
      ...eventList,
    };

    return keysFromSnakeToCamelCase({
      companies: companies.map(CompanyService.fixCompany),
      ...events,
    });
  }

  static async listNotPassed() {
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

  static async listPanelsForCompany(id) {
    const { data: panel } = await internalRequest("get", `/panels/full-info/${ id }`);

    return {
      ...panel,
      occuresAt: panel.date,
    };
  }

  static async listEventsForCompany(id, type) {
    const transformedType = typeTransformer(type);

    const {
      companies,
      [transformedType]: objList,
    } = await graphQlQuery(participantEventsQuery());

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

    return keysFromSnakeToCamelCase({
      ...obj,
      company: CompanyService.fixCompany(companies.find(({ id }) => id === obj.company.id)),
    });
  }
}
