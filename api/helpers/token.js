import {
  currentUserQuery,
} from "../graphql/queries";
import {
  post,
} from "./axios";

export const extractAuthorizationToken = (req) => {
  const header = req.get("Authorization");

  if (header) {
    return header;
  }

  const rawToken = req.cookies[process.env.JOBFAIR_COOKIE_NAME];

  if (!rawToken) {
    return null;
  }

  try {
    const { token } = JSON.parse(rawToken);

    if (!token) {
      return null;
    }

    return `jwt ${ token }`;
  } catch {
    return null;
  }
};

export const fetchAuthenticatedUser = async (reqOrToken) => {
  const auth =
    "string" === typeof reqOrToken
    ? reqOrToken
    : extractAuthorizationToken(reqOrToken)
  ;

  try {
    const { data } = await post(
      process.env.JOBFAIR_GRAPHQL_ENDPOINT,
      currentUserQuery(),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      },
    );

    return data.current_user;
  } catch (e) {
    return null;
  }
};
