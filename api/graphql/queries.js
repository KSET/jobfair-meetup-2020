import {
  userData,
  basicUserData,
} from "./data";
import {
  createObject,
} from "./helpers";

export const basicUserQuery = () => ({
  query: `{ ${ createObject({
    // eslint-disable-next-line camelcase
    current_user: basicUserData,
  }) } }`,
});

export const currentUserQuery = () => ({
  query: `{ ${ createObject({
    // eslint-disable-next-line camelcase
    current_user: userData,
  }) } }`,
});
