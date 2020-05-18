import {
  currentUserQuery,
} from "../graphql/queries";
import {
  error,
} from "./route";
import {
  post,
} from "./axios";

export const getAuthorizationToken = (req) => {
  const header = req.get("Authorization");
  req.authHeader = null;

  if (header) {
    req.authHeader = header;

    return req.authHeader;
  }

  const rawToken = req.cookies[process.env.JOBFAIR_COOKIE_NAME];

  if (!rawToken) {
    return null;
  }

  try {
    const { token } = JSON.parse(rawToken);

    req.authHeader = `jwt ${ token }`;

    return req.authHeader;
  } catch {
    return null;
  }
};

export const requireAuth = async (req, res, next) => {
  const auth = getAuthorizationToken(req);

  if (!auth) {
    res.status(401);
    return res.json(error({
      reason: "authorization-header-missing",
      status: 401,
    }));
  }

  try {
    const { data } = await post(
      "https://jobfair.fer.unizg.hr/api/v2/graphql",
      currentUserQuery(),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      },
    );

    const user = data.current_user;

    if (user) {
      req.authUser = user;

      return next();
    }
  } catch (e) {
  }

  res.status(401);
  return res.json(error({
    reason: "authorization-required",
    status: 401,
  }));
};
