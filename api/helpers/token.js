import {
  basicUserQuery,
  currentUserQuery,
} from "../graphql/queries";
import {
  graphQlQuery,
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

export const fetchAuthenticatedUser = async (reqOrToken, fullUser = false) => {
  const auth =
    "string" === typeof reqOrToken
    ? reqOrToken
    : extractAuthorizationToken(reqOrToken)
  ;

  try {
    const { current_user: rawUser } = await graphQlQuery(
      fullUser ? currentUserQuery() : basicUserQuery(),
      auth,
    );

    const user = {
      uid: rawUser.resume && rawUser.resume.uid,
      ...rawUser,
    };

    delete user.resume;

    return user;
  } catch (e) {
    return null;
  }
};
