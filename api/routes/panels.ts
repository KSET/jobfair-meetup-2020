import {
  FileArray,
} from "express-fileupload";
import qs from "qs";
import type {
  User,
} from "../graphql/types";
import {
  HttpStatus,
} from "../helpers/http";
import {
  RoleNames,
} from "../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../helpers/route";
import PanelsService from "../services/panels-service";
import type {
  PanelEditableFields,
} from "../services/panels-service";

const router = new Router();

router.get("/list", async () => {
  return await PanelsService.list();
});

router.get("/list/with-info", async () => {
  return await PanelsService.listWithInfo();
});

router.get("/full-info/:id", async ({ params }) => {
  const { id } = params;

  return await PanelsService.fullInfo(id);
});

router.get("/info/:id", async ({ params }) => {
  const { id } = params;

  return await PanelsService.info(id);
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

const fixupPanelPostBody =
  (
    userId: User["id"],
    body: Record<string, unknown>,
    files?: FileArray,
  ): PanelEditableFields => {
    const data =
      qs.parse(
        Object
          .entries(body)
          .map(([ key, value ]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(String(value)) }`)
          .join("&")
        ,
      ) as unknown as PanelEditableFields
    ;

    if (!files) {
      return data;
    }

    for (const [ i, company ] of Object.entries(data?.companies || {})) {
      const file = files[`companies[${ i }][imageFile]`];

      company.uploaderId = userId;
      company.imageFile =
        Array.isArray(file)
        ? file.pop()
        : file
      ;
    }

    return data;
  }
;


authRouter.post("/", async ({ body, files, authUser }) => {
  const data = fixupPanelPostBody(
    authUser.id,
    body,
    files,
  );

  return await PanelsService.create(data);
});

authRouter.patch("/:id", async ({ body, params, files, authUser }) => {
  const { id } = params;

  if (!id) {
    throw new ApiError("Missing id", HttpStatus.Error.Client.UnprocessableEntity);
  }

  return await PanelsService.update(
    id,
    fixupPanelPostBody(
      authUser.id,
      body,
      files,
    ),
  );
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  return await PanelsService.delete(id);
});

export default authRouter;
