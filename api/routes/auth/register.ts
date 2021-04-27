import {
  HttpStatus,
} from "../../helpers/http";
import {
  Role,
} from "../../helpers/permissions";
import {
  ApiError,
  Router,
} from "../../helpers/route";
import {
  registerFormValidations,
} from "../../../helpers/auth/register";
import AuthService from "../../services/auth-service";

const router = new Router();

router.post("/", async ({ body }) => {
  const {
    email,
    name,
    password,
    phone,
  } = body;

  const formValidations = registerFormValidations();

  interface Error {
    field: string;
    validation: string;
  }

  const errors: Error[] = [];

  for (const [ field, validations ] of Object.entries(formValidations)) {
    for (const [ validation, isValid ] of Object.entries(validations)) {
      if (!isValid(body[field], body)) {
        errors.push({
          field,
          validation,
        });
      }
    }
  }

  if (0 < errors.length) {
    throw new ApiError(
      "Greška u predanim podatcima.",
      HttpStatus.Error.Client.ExpectationFailed,
      errors,
    );
  }

  return await AuthService.register({
    email,
    name,
    password,
    phone,
    role: Role.student,
  });
});

export default router;
