import {
  extractAuthorizationToken,
  fetchAuthenticatedUser,
} from "./token";
import {
  hasPermission,
  roleNames,
} from "./permissions";
import {
  error,
} from "./route";

export const injectAuthData =
  ({
     fullUserData = false,
   } = {}) =>
    async (req, _res, next = () => null) => {
      const authHeader = extractAuthorizationToken(req);

      if (authHeader) {
        req.authHeader = authHeader;
        req.authUser = await fetchAuthenticatedUser(authHeader, fullUserData);
      } else {
        req.authHeader = null;
        req.authUser = null;
      }

      return next();
    }
;

export const requireAuth =
  ({
     fullUserData = false,
     role = roleNames.BASE,
   } = {}) =>
    async (req, res, next) => {
      await injectAuthData({ fullUserData })(req);

      if (!req.authUser) {
        res.status(401);

        return res.json(error({
          reason: "authorization-required",
          status: 401,
        }));
      }

      if (false === hasPermission(role, req.authUser.role)) {
        res.status(401);

        return res.json(error({
          reason: "authorization-required",
          status: 401,
        }));
      }

      return next();
    }
;
