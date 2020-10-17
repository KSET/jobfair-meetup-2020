import {
  HttpStatus,
} from "~/api/helpers/http";
import {
 isGateGuardian,
} from "~/helpers/auth";

export default function({ store, error }) {
  const { user } = store.state.user;

  if (!user) {
    return error({
      statusCode: HttpStatus.Error.Client.NotFound,
    });
  }

  if (!isGateGuardian(user)) {
    return error({
      statusCode: HttpStatus.Error.Client.NotFound,
    });
  }
}
