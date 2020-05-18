import {
  userData,
} from "./data";
import {
  createObject,
} from "./helpers";

export const currentUserQuery = () => ({
  query: `{ ${ createObject({
    // eslint-disable-next-line camelcase
    current_user: userData,
  }) } }`,
});
