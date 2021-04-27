import {
  eventListFromStatus,
} from "../../../components/student/event-status";
import {
  queryReservationsGetByUserId,
  queryReservationsListUserIdsByEvent,
} from "../../../db/helpers/reservations";
import {
  Client,
} from "../../../db/methods";
import {
  keysFromSnakeToCamelCase,
  pickKeys,
  pipe,
} from "../../../helpers/object";
import {
  internalRequest,
} from "../../helpers/http";
import {
  Role,
} from "../../helpers/permissions";
import {
  AuthRouter,
} from "../../helpers/route";
import {
  cachedFetcher,
} from "../../helpers/fetchCache";
import {
  requireCv,
} from "./_helpers";

const router = new AuthRouter({
  role: Role.base,
});

router.get("/mine", requireCv, async ({ authUser }) => {
  const rawEvents = await Client.queryOnce(queryReservationsGetByUserId({ userId: authUser.id })) as any[];

  const fixEvent =
    pipe(
      keysFromSnakeToCamelCase,
      pickKeys.bind(null, [ "eventId", "eventType", "status" ]),
    )
  ;

  return rawEvents.map(fixEvent).reduce((acc, { eventType, ...el }) => {
    if (!(eventType in acc)) {
      acc[eventType] = [];
    }

    acc[eventType].push(el);

    return acc;
  }, {});
});


const moderatorRouter = AuthRouter.boundToRouter(router, {
  role: Role.admin,
});

const timeoutMs = 1.5 * 1000;

moderatorRouter.get("/users", cachedFetcher(timeoutMs, async ({ authHeader }) => {
  const auth = {
    headers: {
      Authorization: authHeader,
    },
  };

  const resumes = await internalRequest("get", "/resumes/list", auth).then(({ data: resumes }) => Object.fromEntries(resumes.map((resume) => [ resume.userId, resume ])));
  const rawEvents = await Client.queryOnce(queryReservationsListUserIdsByEvent()) as any[];
  const userList = new Set();

  const events = rawEvents.map(keysFromSnakeToCamelCase).reduce((acc, event) => {
    const { eventType, eventId, status, userIds } = event;

    if (!(eventType in acc)) {
      acc[eventType] = {};
    }

    if (!(eventId in acc[eventType])) {
      acc[eventType][eventId] = Object.fromEntries(eventListFromStatus(-1).map((type) => [ type, [] ]));
    }

    for (const type of eventListFromStatus(status)) {
      for (const id of userIds.split(",")) {
        userList.add(id);
        acc[eventType][eventId][type].push(id);
      }
    }

    return acc;
  }, {});

  const users =
    Array
      .from(userList)
      .reduce(
        (acc, id: string) =>
          Object.assign(
            acc,
            {
              [id]: resumes[id],
            },
          )
        ,
        {},
      )
  ;

  return {
    events,
    users,
  };
}));

export default moderatorRouter;
