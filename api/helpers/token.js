import {
  verify,
} from "jsonwebtoken";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  basicUserQuery,
  currentUserQuery,
} from "../graphql/queries";
import CompanyService from "../services/company-service";
import isLive from "./health";
import {
  getSetting,
} from "./settings";
import {
  graphQlQuery,
} from "./axios";
import {
  internalRequest,
} from "./http";

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

export const verifiedJwt =
  (
    {
      token,
      secret,
      options = {},
    },
  ) =>
    new Promise(
      (resolve, reject) =>
        verify(
          token,
          secret,
          options,
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          },
        ),
    )
;

export const fetchAuthenticatedUser = async (reqOrToken, fullUser = false) => {
  const auth =
    "string" === typeof reqOrToken
    ? reqOrToken
    : extractAuthorizationToken(reqOrToken)
  ;

  if (!auth) {
    return null;
  }

  try {
    // Should be a string of format `jwt $AUTH_TOKEN`
    const token = auth.substr("jwt ".length);
    const secret = await getSetting("JWT Secret", process.env.JWT_SECRET);

    const data = await verifiedJwt({
      token,
      secret,
    });

    if (!("role" in data)) {
      return null;
    }

    if (false === fullUser) {
      return data;
    }
  } catch (e) {
    console.log("Failed local JWT verification:", e.message);
  }

  if (!isLive()) {
    return null;
  }

  try {
    const { current_user: rawUser } = await graphQlQuery(
      fullUser ? currentUserQuery() : basicUserQuery(),
      auth,
    ) || {};

    const user = keysFromSnakeToCamelCase({
      uid: rawUser.resume && rawUser.resume.uid,
      ...rawUser,
    });

    delete user.resume;

    const { companies = [] } = user;

    if (companies) {
      const { data: rawParticipants = [] } = await internalRequest("get", "/companies/participants");
      const participantIds = new Set(rawParticipants.map(({ id }) => id));

      user.companies = companies.filter(({ id }) => participantIds.has(id)).map(CompanyService.fixCompany);
    }

    return user;
  } catch (e) {
    return null;
  }
};
