import {
  verify,
} from "jsonwebtoken";
import UserService from "../services/user-service";

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
      (resolve) =>
        verify(
          token,
          secret,
          options,
          (err, data) => {
            if (err) {
              resolve(null);
            } else {
              resolve(data);
            }
          },
        ),
    )
;

export const getJwtSecret = () => `jobfair-meetup-secret-${ process.env.JWT_SECRET || "very secret :)" }`;

export const fetchAuthenticatedUser = async (reqOrToken, _fullUser = false) => {
  const auth =
    "string" === typeof reqOrToken
    ? reqOrToken
    : extractAuthorizationToken(reqOrToken)
  ;

  if (!auth) {
    return null;
  }

  // Should be a string of format `jwt $AUTH_TOKEN`
  const token = auth.substr("jwt ".length);
  const secret = getJwtSecret();

  const jwtData = await verifiedJwt({
    token,
    secret,
  });

  if (!jwtData?.uid) {
    return null;
  }

  return await UserService.infoBy("uid", jwtData.uid);
};
