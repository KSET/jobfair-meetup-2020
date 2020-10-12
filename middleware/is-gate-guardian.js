import {
  HttpStatus,
} from "~/api/helpers/http";

export default function({ store, error }) {
  const { user } = store.state.user;

  if (!user) {
    return error({
      statusCode: HttpStatus.Error.Client.NotFound,
    });
  }

  const { companies } = user;

  if (!companies.find(({ id }) => 428 === Number(id))) {
    return error({
      statusCode: HttpStatus.Error.Client.NotFound,
    });
  }
}
