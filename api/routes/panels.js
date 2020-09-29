import {
  queryReservationsDeleteByEventId,
} from "../../db/helpers/reservations";
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
  pipe,
  withoutKeys,
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
  Router,
} from "../helpers/route";


const router = new Router();

const fixEntry = pipe(
  keysFromSnakeToCamelCase,
  withoutKeys.bind(null, [ "createdAt", "updatedAt" ]),
  ({ occuresAt, ...panel }) => ({
    ...panel,
    occuresAt,
    date: occuresAt,
  }),
);

const addInfo =
  (companyList) =>
    pipe(
      fixEntry,
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
        company: panel.companies[0].info,
      }),
    )
;

router.get("/list", async () => {
  const entries = await Client.queryOnce(queryPanelsGetAll());

  return entries.map(fixEntry);
});

router.get("/list/with-info", async () => {
  const rawPanels = await Client.queryOnce(queryPanelsGetAll());
  const { data: rawCompanies } = await internalRequest("get", "/companies/participants");
  const companyList = Object.fromEntries(rawCompanies.map((c) => [ c.id, c ]));

  return rawPanels.map(addInfo(companyList));
});

router.get("/full-info/:id", async ({ params }) => {
  const { id } = params;
  const entry = await Client.queryOneOnce(queryPanelsGetById({ id }));
  const { data: rawCompanies } = await internalRequest("get", "/companies/participants");
  const companyList = Object.fromEntries(rawCompanies.map((c) => [ c.id, c ]));

  if (!entry) {
    throw new ApiError("Panel not found", HttpStatus.Error.Client.NotFound);
  }

  return addInfo(companyList)(entry);
});

router.get("/info/:id", async ({ params }) => {
  const { id } = params;
  const entry = await Client.queryOneOnce(queryPanelsGetById({ id }));

  if (!entry) {
    throw new ApiError("Panel not found", HttpStatus.Error.Client.NotFound);
  }

  return fixEntry(entry);
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.ADMIN });

authRouter.post("/", async ({ body }) => {
  const { date, ...rest } = body;

  const data = await Client.queryOneOnce(queryPanelsCreate({ ...rest, occuresAt: date }));

  return fixEntry(data);
});

authRouter.patch("/:id", async ({ body, params }) => {
  const { date, ...rest } = body;

  if (!params.id) {
    throw new ApiError("Missing id", HttpStatus.Error.Client.UnprocessableEntity);
  }

  const client = await Client.inTransaction();

  try {
    const oldPanel = await client.queryOne(queryPanelsGetById({ id: params.id }));

    if (!oldPanel) {
      throw new ApiError("Panel not found", HttpStatus.Error.Client.NotFound);
    }

    const data = await client.queryOne(queryPanelsUpdateById(oldPanel.id, { ...rest, occuresAt: date }));

    if (!data) {
      throw new ApiError("Something went wrong", HttpStatus.Error.Server.InternalServerError);
    }

    await client.commit();

    return fixEntry(data);
  } catch (e) {
    await client.rollback();

    if (!(e instanceof ApiError)) {
      console.log(e);
    }

    throw e;
  } finally {
    await client.end();
  }
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  const client = await Client.inTransaction();

  try {
    const oldPanel = await client.queryOne(queryPanelsGetById({ id }));

    if (!oldPanel) {
      return true;
    }

    const deletedPanel = await client.queryOne(queryPanelsDeleteById({ id }));

    console.log("|> DELETED PANEL", deletedPanel);

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

    if (!(e instanceof ApiError)) {
      console.log(e);
    }

    throw e;
  } finally {
    await client.end();
  }
});

export default authRouter;
