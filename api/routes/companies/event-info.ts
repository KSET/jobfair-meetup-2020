import {
 sendCsv,
} from "../../helpers/csv";
import {
 RoleNames,
} from "../../helpers/permissions";
import {
 AuthRouter,
} from "../../helpers/route";
import EventReservationsService from "../../services/event-reservations-service";

const authRouter = new AuthRouter({
  role: RoleNames.ADMIN,
});

authRouter.get("/:eventType/reservations", async ({ authHeader, params }) => {
  return await EventReservationsService.listFormattedFor(authHeader, params.eventType);
});

authRouter.getRaw("/:eventType/reservations.csv", async ({ authHeader, params }, res) => {
  const events = await EventReservationsService.listFormattedFor(authHeader, params.eventType);

  const headers = [
    "Workshop name",
    "Company name",
    "Participant name and email",
  ];

  const rows =
    events
      .map(
        (
          {
            title,
            company,
            users,
          },
        ) =>
          users.map(
            ({ name, email }) =>
              [
                title,
                company,
                `${ name } <${ email }>`,
              ]
            ,
          )
        ,
      )
      .flat()
  ;

  return sendCsv(
    res,
    {
      fileName: `${ params.eventType }-reservations.csv`,
      headers,
      rows,
    },
  );
});

export default authRouter;
