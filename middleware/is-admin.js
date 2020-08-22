import {
 HttpStatus,
} from "../api/helpers/http";
import {
 isAdmin,
} from "~/api/helpers/permissions";

export default function({ store, error }) {
  const { user } = store.state.user;

  if (!user || !isAdmin(user.role)) {
    error({
      statusCode: HttpStatus.Error.NotFound,
    });
  }
}
