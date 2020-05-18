import {
  extractAuthorizationToken,
  fetchAuthenticatedUser,
} from "./token";
import {
  error,
} from "./route";

export const injectAuthData = async (req, _res, next = () => null) => {
  const authHeader = extractAuthorizationToken(req);

  if (authHeader) {
    req.authHeader = authHeader;
    req.authUser = await fetchAuthenticatedUser(authHeader);
  } else {
    req.authHeader = null;
    req.authUser = null;
  }

  return next();
};

export const requireAuth = async (req, res, next) => {
  await injectAuthData(req);

  if (req.authUser) {
    return next();
  }

  res.status(401);

  return res.json(error({
    reason: "authorization-required",
    status: 401,
  }));
};
