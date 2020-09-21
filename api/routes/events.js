import {
  MAX_PARTICIPANTS,
  eventListFromStatus,
  EventStatus,
} from "../../components/student/event-status";
import {
  queryReservationsCountVisitorsForEvent,
  queryReservationsCountVisitorsByEvent,
  queryReservationsCreate,
  queryReservationsGetByEventAndUserId,
  queryReservationsGetByEventId,
  queryReservationsGetByUserId,
  queryReservationsUpdateStatusByEventIdAndUserId,
} from "../../db/helpers/reservations";

import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
  pickKeys,
  pipe,
} from "../../helpers/object";
import {
  HttpStatus,
  internalRequest,
} from "../helpers/http";
import {
  RoleNames,
} from "../helpers/permissions";
import {
  ApiError,
  AuthRouter,
} from "../helpers/route";


const router = new AuthRouter({
  role: RoleNames.STUDENT,
});

router.post("/status", async ({ body, authUser }) => {
  const { id: rawId, status: rawStatus } = body;
  const id = String(rawId);
  const status = Number(rawStatus);

  const { data } = await internalRequest(
    "get",
    "/companies/events",
  );
  const { workshops, presentations } = data;
  const events = [ ...workshops, ...presentations ];
  const event = events.find((event) => String(event.id) === String(id));

  if (!event) {
    throw new ApiError("Event not found", HttpStatus.Error.Client.NotFound);
  }

  const client = new Client();

  try {
    await client.connect();
    await client.startTransaction();
    const key = { userId: authUser.id, eventId: id };

    const event = await client.queryOne(queryReservationsGetByEventAndUserId(key));
    const rawParticipants = await client.query(queryReservationsCountVisitorsForEvent(key));
    const participants = {};

    for (const { status, count } of rawParticipants) {
      for (const selected of eventListFromStatus(status)) {
        if (!(selected in participants)) {
          participants[selected] = 0;
        }

        participants[selected] += Number(count);
      }
    }

    if (event) {
      // eslint-disable-next-line no-bitwise
      const statusAdded = (event.status ^ status) & status;
      const newProps = eventListFromStatus(statusAdded);

      for (const prop of newProps) {
        if (participants[prop] + 1 >= MAX_PARTICIPANTS) {
          throw new ApiError("Too many participants");
        }
      }

      await client.queryOne(queryReservationsUpdateStatusByEventIdAndUserId(key, { status }));
    } else {
      await client.queryOne(queryReservationsCreate({ ...key, status }));
    }

    await client.commit();

    return { eventId: id, status };
  } catch (e) {
    await client.rollback();

    if (e instanceof ApiError) {
      throw e;
    }

    console.log("|> EVENT REGISTER ERROR", e);

    throw new ApiError("Something went wrong");
  } finally {
    await client.end();
  }
});

router.get("/mine", async ({ authUser }) => {
  const rawEvents = await Client.queryOnce(queryReservationsGetByUserId({ userId: authUser.id }));

  const fixEvent =
    pipe(
      keysFromSnakeToCamelCase,
      pickKeys.bind(null, [ "eventId", "status" ]),
    )
  ;

  return rawEvents.map(fixEvent);
});

router.get("/participants", async () => {
  const rawEvents = await Client.queryOnce(queryReservationsCountVisitorsByEvent());
  const events = {};

  for (const { event_id: id, status, count } of rawEvents) {
    if (!(id in events)) {
      events[id] =
        Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]))
      ;
    }

    for (const selected of eventListFromStatus(status)) {
      events[id][selected] += Number(count);
    }
  }

  return events;
});

router.get("/participants/:eventId", async ({ params }) => {
  const { eventId } = params;

  const rawEvents = await Client.queryOnce(queryReservationsGetByEventId({ eventId }));
  const events = Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]));

  for (const { status } of rawEvents) {
    for (const selected of eventListFromStatus(status)) {
      events[selected] += 1;
    }
  }

  return events;
});

export default router;
