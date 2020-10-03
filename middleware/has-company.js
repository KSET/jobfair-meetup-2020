import {
  HttpStatus,
} from "../api/helpers/http";

export default function({ store, error }) {
  const { user } = store.state.user;

  if (user) {
    const { companies } = user;

    if (companies && companies.length) {
      return;
    }
  }

  error({
    statusCode: HttpStatus.Error.Client.NotFound,
  });
}
