import {
  HttpStatus,
} from "../api/helpers/http";
import {
  isStudent,
} from "../api/helpers/permissions";

export default function({ store, error }) {
  const { user } = store.state.user;

  if (!user || !isStudent(user.role)) {
    error({
      statusCode: HttpStatus.Error.Client.NotFound,
    });
  }
}
