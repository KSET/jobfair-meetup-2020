import {
 HttpStatus,
} from "../api/helpers/http";
import {
  isModerator,
} from "~/api/helpers/permissions";

export default function({ store, error }) {
  const { user } = store.state.user;

  if (!user || !isModerator(user.role)) {
    error({
      statusCode: HttpStatus.Error.NotFound,
    });
  }
}
